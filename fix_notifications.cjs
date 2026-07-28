const fs = require('fs');
let code = fs.readFileSync('src/NotificationSystem.tsx', 'utf8');

const oldResLogic = `        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.tag === 'VIP' || (data.notes && data.notes.toLowerCase().includes('vip'))) {
            showToast(\`Nouvelle réservation VIP : \${data.name} pour \${data.pax} pax\`, 'success');
          }
        }`;

const newResLogic = `        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.tag === 'VIP' || (data.notes && data.notes.toLowerCase().includes('vip'))) {
            showToast(\`Nouvelle réservation VIP : \${data.name} pour \${data.pax} pax\`, 'success');
          }
          if (data.isB2B || data.source === 'partenaire' || data.type === 'B2B' || data.tag === 'B2B') {
            showToast(\`Nouvelle réservation B2B (Partenaire) : \${data.name || 'Client B2B'}\`, 'info');
          }
        }`;

code = code.replace(oldResLogic, newResLogic);
fs.writeFileSync('src/NotificationSystem.tsx', code);
console.log("Updated notifications");
