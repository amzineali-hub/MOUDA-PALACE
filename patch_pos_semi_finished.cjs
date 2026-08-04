const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

const target = `            let invItem = inventoryItems.find((inv: any) => inv.id === ingredient.id);
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
            }`;

const replacement = `            let invItem = inventoryItems.find((inv: any) => inv.id === ingredient.id);
            if (!invItem) {
              invItem = inventoryItems.find((inv: any) => inv.name.toLowerCase() === ingredient.name.toLowerCase());
            }

            const portions = matchingRecipe.portions || 1;
            const qtyToDeduct = (ingredient.quantity / portions) * cartItem.qty;

            if (invItem && invItem.quantity !== undefined) {
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
            } else {
              // Might be a semi-finished product
              const semiFinishedSnapshot = await getDocs(collection(db, 'semi_finished'));
              const semiFinishedItems = semiFinishedSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
              
              let semiItem = semiFinishedItems.find((semi: any) => semi.id === ingredient.id || semi.name.toLowerCase() === ingredient.name.toLowerCase());
              
              if (semiItem && semiItem.quantity !== undefined) {
                const newQty = Math.max(0, semiItem.quantity - qtyToDeduct);
                
                await updateDoc(doc(db, 'semi_finished', semiItem.id), {
                  quantity: newQty,
                  updatedAt: now
                });
                
                // Add to waste/usage records? We can just track it if needed
              }
            }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/POSTactile.tsx', code);
    console.log("Successfully added semi-finished handling in POSTactile.tsx");
} else {
    console.log("Target string not found for semi-finished in POSTactile.tsx");
}
