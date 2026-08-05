const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

const targetStr = `await updateDoc(doc(db, 'inventoryItems', inventoryItem.id), {
                quantity: newQty,
                updatedAt: serverTimestamp()
              });`;

const replacementStr = `const updateData: any = {
                quantity: newQty,
                updatedAt: serverTimestamp()
              };
              if (item.zone) {
                updateData.zone = item.zone;
              }
              await updateDoc(doc(db, 'inventoryItems', inventoryItem.id), updateData);`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
