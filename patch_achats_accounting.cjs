const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const search = `        if (totalActual > 0) {
          const supplierName = selectedOrder?.fournisseur || selectedOrder?.supplier || 'Fournisseur Inconnu';
          await addDoc(collection(db, 'expenses'), {
            amount: -totalActual, // negative for expense
            category: 'Achats / Marchandises',
            date: new Date().toISOString().split('T')[0],
            description: \`Achat Marchandises (BC: \${orderId.substring(0,8)}) - Fournisseur: \${supplierName}\`,
            type: 'expense',
            timestamp: serverTimestamp()
          });
        }`;

const replacement = `        if (totalActual > 0) {
          const supplierName = selectedOrder?.fournisseur || selectedOrder?.supplier || 'Fournisseur Inconnu';
          const newExpRef = await addDoc(collection(db, 'expenses'), {
            supplier: supplierName,
            amount: totalActual.toFixed(2) + ' MAD',
            category: 'Achats / Marchandises',
            date: new Date().toISOString().split('T')[0],
            method: 'Virement', // par defaut
            description: \`Achat Marchandises (BC: \${orderId.substring(0,8)})\`,
            createdAt: serverTimestamp()
          });
          await updateDoc(newExpRef, { id: 'EXP-' + newExpRef.id.substring(0,6).toUpperCase() });
        }`;

code = code.replace(search, replacement);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
