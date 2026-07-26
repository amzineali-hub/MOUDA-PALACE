const fs = require('fs');
let posContent = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const oldCode = `        if (item.category !== 'boissons') {
          await addDoc(collection(db, 'productionTasks'), {
            item: item.name,
            qty: item.qty + 'x',
            priority: 'Moyenne',
            progress: 0,
            status: 'À faire',
            createdAt: serverTimestamp()
          });`;

const newCode = `        if (item.category !== 'boissons') {
          const orderId = 'CMD-' + Math.floor(Math.random() * 10000);
          await addDoc(collection(db, 'productionTasks'), {
            orderId: orderId,
            item: item.name,
            qty: item.qty,
            priority: 'Moyenne',
            progress: 0,
            status: 'À faire',
            createdAt: serverTimestamp()
          });`;

posContent = posContent.replace(oldCode, newCode);
fs.writeFileSync('src/POSTactile.tsx', posContent);
console.log("Done");
