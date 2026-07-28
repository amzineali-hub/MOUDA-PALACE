const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const target = `  const handleCheckout = async (method: string) => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    
    try {
      const displayId = 'TKT-' + Date.now().toString().slice(-6);
      await addDoc(collection(db, 'cash_receipts'), {
        displayId,
        amount: total,
        method: method,
        items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: new Date() // Fallback if serverTimestamp is not imported properly
      });
      showToast(\`Paiement de \${total.toFixed(2)} MAD par \${method} validé !\`);
      setCart([]);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'encaissement", "error");
    }
  };`;

const replacement = `  const handleCheckout = async (method: string) => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    
    try {
      const displayId = 'TKT-' + Date.now().toString().slice(-6);
      const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      const now = new Date();
      
      // 1. Ajouter aux recettes caisses (journal de caisse)
      await addDoc(collection(db, 'cash_receipts'), {
        displayId,
        amount: total,
        method: method,
        items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
        date: today,
        createdAt: now
      });

      // 2. Ajouter automatiquement une facture pour la comptabilité (pièce comptable, TVA, Bilan)
      const invoiceId = 'FAC-' + Date.now().toString().slice(-6);
      await addDoc(collection(db, 'invoices'), {
        id: invoiceId, // We use id in the UI
        client: 'Client Comptoir (POS)',
        ice: 'N/A',
        date: today,
        amount: \`\${total.toFixed(2)} MAD\`,
        status: 'Payée',
        method: method,
        createdAt: now
      });

      // 3. Déduire automatiquement et instantanément des stocks
      const inventorySnapshot = await getDocs(collection(db, 'inventoryItems'));
      const inventoryItems = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      for (const cartItem of cart) {
        // Find matching inventory item (by name)
        const matchingItem = inventoryItems.find((inv: any) => 
          inv.name.toLowerCase() === cartItem.name.toLowerCase() ||
          inv.name.toLowerCase().includes(cartItem.name.toLowerCase()) ||
          cartItem.name.toLowerCase().includes(inv.name.toLowerCase())
        );

        if (matchingItem && matchingItem.quantity !== undefined) {
          const newQty = Math.max(0, matchingItem.quantity - cartItem.qty);
          
          await updateDoc(doc(db, 'inventoryItems', matchingItem.id), {
            quantity: newQty,
            updatedAt: now
          });

          // Log the transaction
          await addDoc(collection(db, 'inventoryTransactions'), {
            itemId: matchingItem.id,
            itemName: matchingItem.name,
            type: 'out',
            quantity: cartItem.qty,
            reason: \`Vente POS (\${displayId})\`,
            createdAt: now
          });
        }
      }

      showToast(\`Paiement de \${total.toFixed(2)} MAD validé. Pièces comptables générées et stock mis à jour.\`);
      setCart([]);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'encaissement", "error");
    }
  };`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/POSTactile.tsx', code);
  console.log("Updated handleCheckout");
} else {
  console.log("Could not find target handleCheckout");
}
