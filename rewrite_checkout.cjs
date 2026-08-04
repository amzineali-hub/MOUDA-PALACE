const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

const targetStart = `  const handleCheckout = async (method: string) => {`;
const targetEnd = `  // Helper for generating colors based on category`;

let startIndex = code.indexOf(targetStart);
let endIndex = code.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const newCheckout = `  const handleCheckout = async (method: string) => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    
    try {
      showToast("Traitement en cours...", "info");
      const displayId = 'TKT-' + Date.now().toString().slice(-6);
      const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      const now = new Date();
      
      // 1. Ajouter aux recettes caisses
      await addDoc(collection(db, 'cash_receipts'), {
        displayId,
        amount: total,
        method: method,
        items: cart.map(item => ({ name: item.name || 'Inconnu', qty: item.qty || 1, price: item.price || 0 })),
        date: today,
        createdAt: now
      });

      // 2. Facture
      const invoiceId = 'FAC-' + Date.now().toString().slice(-6);
      await addDoc(collection(db, 'invoices'), {
        id: invoiceId,
        client: 'Client Comptoir (POS)',
        ice: 'N/A',
        date: today,
        amount: \`\${total.toFixed(2)} MAD\`,
        status: 'Payée',
        method: method,
        createdAt: now
      });

      // 3. Stocks
      const inventorySnapshot = await getDocs(collection(db, 'inventoryItems'));
      const inventoryItems = inventorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));

      for (const cartItem of cart) {
        if (!cartItem || !cartItem.name) continue;
        
        const matchingRecipe = recettes.find(r => (r.nom || r.name || '').toLowerCase() === cartItem.name.toLowerCase());
        
        if (matchingRecipe && matchingRecipe.ingredients && Array.isArray(matchingRecipe.ingredients) && matchingRecipe.ingredients.length > 0) {
          for (const ingredient of matchingRecipe.ingredients) {
            if (!ingredient || !ingredient.name) continue;
            
            let invItem = inventoryItems.find((inv: any) => (inv.name || '').toLowerCase() === ingredient.name.toLowerCase());

            const portions = matchingRecipe.portions || 1;
            const qtyToDeduct = ((ingredient.quantity || 0) / portions) * (cartItem.qty || 1);

            if (invItem && typeof invItem.quantity !== 'undefined') {
              const newQty = Math.max(0, Number(invItem.quantity) - qtyToDeduct);
              await updateDoc(doc(db, 'inventoryItems', invItem.id), { quantity: newQty, updatedAt: now });
              await addDoc(collection(db, 'inventoryTransactions'), {
                itemId: invItem.id,
                itemName: invItem.name || 'Inconnu',
                type: 'out',
                quantity: qtyToDeduct,
                reason: \`Vente POS (\${displayId}) - Plat: \${cartItem.name}\`,
                createdAt: now
              });
              invItem.quantity = newQty;
            } else {
              const semiFinishedSnapshot = await getDocs(collection(db, 'semi_finished'));
              const semiFinishedItems = semiFinishedSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
              
              let semiItem = semiFinishedItems.find((semi: any) => 
                (semi.id === ingredient.id) || 
                ((semi.name || semi.nom || '').toLowerCase() === ingredient.name.toLowerCase())
              );
              
              if (semiItem && typeof semiItem.quantity !== 'undefined') {
                const newQty = Math.max(0, Number(semiItem.quantity) - qtyToDeduct);
                await updateDoc(doc(db, 'semi_finished', semiItem.id), { quantity: newQty, updatedAt: now });
              }
            }
          }
        } else {
          const matchingItem = inventoryItems.find((inv: any) => 
            (inv.name || '').toLowerCase() === cartItem.name.toLowerCase() ||
            (inv.name || '').toLowerCase().includes(cartItem.name.toLowerCase()) ||
            cartItem.name.toLowerCase().includes((inv.name || '').toLowerCase())
          );

          if (matchingItem && typeof matchingItem.quantity !== 'undefined') {
            const newQty = Math.max(0, Number(matchingItem.quantity) - (cartItem.qty || 1));
            await updateDoc(doc(db, 'inventoryItems', matchingItem.id), { quantity: newQty, updatedAt: now });
            await addDoc(collection(db, 'inventoryTransactions'), {
              itemId: matchingItem.id,
              itemName: matchingItem.name || 'Inconnu',
              type: 'out',
              quantity: cartItem.qty || 1,
              reason: \`Vente POS (\${displayId})\`,
              createdAt: now
            });
            matchingItem.quantity = newQty;
          }
        }
      }

      showToast(\`Paiement de \${total.toFixed(2)} MAD validé. Pièces comptables générées et stock mis à jour.\`);
      setTicketToPrint({
        id: displayId,
        date: today,
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: total,
        method: method
      });
      setIsTicketModalOpen(true);
      setCart([]);
    } catch (err: any) {
      console.error("Checkout Error:", err);
      showToast("Erreur: " + (err.message || "Erreur inconnue lors de l'encaissement"), "error");
    }
  };

`;
  
  code = code.substring(0, startIndex) + newCheckout + code.substring(endIndex);
  fs.writeFileSync('src/POSTactile.tsx', code);
  console.log("Successfully replaced handleCheckout");
} else {
  console.log("Could not find bounds");
}
