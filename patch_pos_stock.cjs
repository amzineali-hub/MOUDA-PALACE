const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

const target = `      // 3. Déduire automatiquement et instantanément des stocks
      const inventorySnapshot = await getDocs(collection(db, 'inventoryItems'));
      const inventoryItems = inventorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));

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
      }`;

const replacement = `      // 3. Déduire automatiquement et instantanément des stocks
      const inventorySnapshot = await getDocs(collection(db, 'inventoryItems'));
      const inventoryItems = inventorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));

      for (const cartItem of cart) {
        // Find if this is a recipe (a dish)
        const matchingRecipe = recettes.find(r => r.name.toLowerCase() === cartItem.name.toLowerCase());
        
        if (matchingRecipe && matchingRecipe.ingredients && matchingRecipe.ingredients.length > 0) {
          // It's a recipe, deduct its ingredients
          for (const ingredient of matchingRecipe.ingredients) {
            let invItem = inventoryItems.find((inv: any) => inv.id === ingredient.id);
            if (!invItem) {
              invItem = inventoryItems.find((inv: any) => inv.name.toLowerCase() === ingredient.name.toLowerCase());
            }

            if (invItem && invItem.quantity !== undefined) {
              const portions = matchingRecipe.portions || 1;
              const qtyToDeduct = (ingredient.quantity / portions) * cartItem.qty;
              const newQty = Math.max(0, invItem.quantity - qtyToDeduct);
              
              await updateDoc(doc(db, 'inventoryItems', invItem.id), {
                quantity: newQty,
                updatedAt: now
              });

              await addDoc(collection(db, 'inventoryTransactions'), {
                itemId: invItem.id,
                itemName: invItem.name,
                type: 'out',
                quantity: qtyToDeduct,
                reason: \`Vente POS (\${displayId}) - Plat: \${cartItem.name}\`,
                createdAt: now
              });
              
              invItem.quantity = newQty;
            }
          }
        } else {
          // Direct inventory item match (like a drink)
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

            await addDoc(collection(db, 'inventoryTransactions'), {
              itemId: matchingItem.id,
              itemName: matchingItem.name,
              type: 'out',
              quantity: cartItem.qty,
              reason: \`Vente POS (\${displayId})\`,
              createdAt: now
            });
            
            matchingItem.quantity = newQty;
          }
        }
      }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/POSTactile.tsx', code);
    console.log("Successfully replaced stock deduction logic in POSTactile.tsx");
} else {
    console.log("Target string not found in POSTactile.tsx");
}
