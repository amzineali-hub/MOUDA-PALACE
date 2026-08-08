const fs = require('fs');
let code = fs.readFileSync('src/NotificationSystem.tsx', 'utf8');

const search = `  return null;
}`;

const replace = `  // Tracking alerts
  const alertedStock = useRef<Set<string>>(new Set());
  const alertedHACCP = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Inventory Alerts
    const unsubInv = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      snapshot.docs.forEach(doc => {
        const item = doc.data();
        const minStock = parseFloat(item.minStock) || 0;
        const qty = parseFloat(item.quantity) || 0;
        const id = doc.id;
        
        if (qty <= minStock && minStock > 0) {
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
        }
      });
    });

    // HACCP DLC Alerts
    const unsubHaccp = onSnapshot(collection(db, 'haccpLots'), (snapshot) => {
      const now = new Date();
      const warningTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 hours

      snapshot.docs.forEach(doc => {
        const lot = doc.data();
        if (lot.status !== 'Consommé' && lot.status !== 'Jeté' && lot.dlcDate) {
          const dlc = new Date(lot.dlcDate);
          const id = doc.id;
          
          if (dlc < now) {
            if (!alertedHACCP.current.has(id + '_expired')) {
              showToast(\`Alerte HACCP : Le lot \${lot.idLot} (\${lot.itemName}) est expiré !\`, 'error');
              alertedHACCP.current.add(id + '_expired');
            }
          } else if (dlc < warningTime) {
            if (!alertedHACCP.current.has(id + '_warning')) {
              showToast(\`Alerte HACCP : Le lot \${lot.idLot} expire bientôt (\${dlc.toLocaleDateString('fr-FR')}).\`, 'error');
              alertedHACCP.current.add(id + '_warning');
            }
          }
        }
      });
    });

    return () => {
      unsubInv();
      unsubHaccp();
    };
  }, [showToast]);

  return null;
}`;

code = code.replace(search, replace);
fs.writeFileSync('src/NotificationSystem.tsx', code);
