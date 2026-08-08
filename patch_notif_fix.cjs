const fs = require('fs');
let code = fs.readFileSync('src/NotificationSystem.tsx', 'utf8');

const search = `        if (qty <= minStock && minStock > 0) {
          if (!alertedStock.current.has(id)) {
            showToast(\`Alerte Stock : \${item.name} est en rupture ou sous le seuil minimal (\${qty} \${item.unit || 'unité'}).\`, 'error');
            alertedStock.current.add(id);
          }
        } else if (qty <= 0) {
           if (!alertedStock.current.has(id + '_rupture')) {
            showToast(\`Rupture de Stock : \${item.name}\`, 'error');
            alertedStock.current.add(id + '_rupture');
          }
        } else {
          // If stock recovers, remove from alerted set so it can trigger again later
          alertedStock.current.delete(id);
          alertedStock.current.delete(id + '_rupture');
        }`;

const replace = `        if (minStock > 0) {
          if (qty <= 0) {
            if (!alertedStock.current.has(id + '_rupture')) {
              showToast(\`Rupture de Stock : \${item.name} (\${qty} \${item.unit || 'unité'})\`, 'error');
              alertedStock.current.add(id + '_rupture');
              alertedStock.current.add(id); // Avoid double alert
            }
          } else if (qty <= minStock) {
            if (!alertedStock.current.has(id)) {
              showToast(\`Alerte Stock : \${item.name} est sous le seuil minimal (\${qty} \${item.unit || 'unité'}).\`, 'error');
              alertedStock.current.add(id);
            }
          } else {
            alertedStock.current.delete(id);
            alertedStock.current.delete(id + '_rupture');
          }
        }`;

code = code.replace(search, replace);
fs.writeFileSync('src/NotificationSystem.tsx', code);
