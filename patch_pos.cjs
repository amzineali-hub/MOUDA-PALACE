const fs = require('fs');
let content = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

const target = `              if (invItem && typeof invItem.quantity !== 'undefined') {
                const newQty = Math.max(0, Number(invItem.quantity) - qtyToDeduct);
                await updateDoc(doc(db, 'inventoryItems', invItem.id), { quantity: newQty, updatedAt: now });
              }`;
              
const replacement = `              if (invItem && typeof invItem.quantity !== 'undefined') {
                const newQty = Math.max(0, Number(invItem.quantity) - qtyToDeduct);
                await updateDoc(doc(db, 'inventoryItems', invItem.id), { quantity: newQty, updatedAt: now });
                await addDoc(collection(db, 'inventoryTransactions'), {
                  item: invItem.name,
                  type: 'out',
                  amount: qtyToDeduct,
                  unit: invItem.unit || 'kg',
                  reason: \`Vente POS: \${cartItem.name} (\${displayId})\`,
                  user: 'POS',
                  date: today,
                  createdAt: now
                });
              }`;
              
content = content.replace(target, replacement);

const target2 = `            if (matchingItem && typeof matchingItem.quantity !== 'undefined') {
              const newQty = Math.max(0, Number(matchingItem.quantity) - (cartItem.qty || 1));
              await updateDoc(doc(db, 'inventoryItems', matchingItem.id), { quantity: newQty, updatedAt: now });
            }`;

const replacement2 = `            if (matchingItem && typeof matchingItem.quantity !== 'undefined') {
              const newQty = Math.max(0, Number(matchingItem.quantity) - (cartItem.qty || 1));
              const deductedQty = cartItem.qty || 1;
              await updateDoc(doc(db, 'inventoryItems', matchingItem.id), { quantity: newQty, updatedAt: now });
              await addDoc(collection(db, 'inventoryTransactions'), {
                item: matchingItem.name,
                type: 'out',
                amount: deductedQty,
                unit: matchingItem.unit || 'pièce',
                reason: \`Vente POS: \${cartItem.name} (\${displayId})\`,
                user: 'POS',
                date: today,
                createdAt: now
              });
            }`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/POSTactile.tsx', content);
console.log("Patched POS transaction logs");
