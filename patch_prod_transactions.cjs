const fs = require('fs');
let code = fs.readFileSync('src/ProductionJournaliere.tsx', 'utf8');

const search2 = `           transaction.update(doc(db, colName, producedItem.id), updateData);
        }`;

const replace2 = `           transaction.update(doc(db, colName, producedItem.id), updateData);
           
           const inTxRef = doc(collection(db, 'inventoryTransactions'));
           transaction.set(inTxRef, {
             item: producedItem.name,
             type: 'in',
             amount: quantiteAProduire,
             unit: producedItem.unit || 'portion',
             reason: \`Production: \${recipe.nom}\`,
             user: chefResponsable,
             date: new Date().toLocaleDateString('fr-FR'),
             createdAt: serverTimestamp()
           });
        }`;
code = code.replace(search2, replace2);

const search3 = `               zone: targetZone,
               subZone: targetSubZone
             });
           }
        }
      });`;

const replace3 = `               zone: targetZone,
               subZone: targetSubZone
             });
           }
           const inTxRef2 = doc(collection(db, 'inventoryTransactions'));
           transaction.set(inTxRef2, {
             item: recipe.nom,
             type: 'in',
             amount: quantiteAProduire,
             unit: 'portion',
             reason: \`Production initiale: \${recipe.nom}\`,
             user: chefResponsable,
             date: new Date().toLocaleDateString('fr-FR'),
             createdAt: serverTimestamp()
           });
        }
      });`;

code = code.replace(search3, replace3);

fs.writeFileSync('src/ProductionJournaliere.tsx', code);
