const fs = require('fs');
let code = fs.readFileSync('src/NotificationSystem.tsx', 'utf8');

const search = `  const isInitialInvLoad = useRef(true);
  const isInitialHaccpLoad = useRef(true);

  useEffect(() => {
    // Inventory Alerts
    const unsubInv = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      const isInitial = isInitialInvLoad.current;
      if (isInitial) {
        isInitialInvLoad.current = false;
      }
      snapshot.docs.forEach(doc => {
        const item = doc.data();
        const minStock = parseFloat(item.minStock) || 0;
        const qty = parseFloat(item.quantity) || 0;
        const id = doc.id;
        
        if (minStock > 0) {
          if (qty <= 0) {
            if (!alertedStock.current.has(id + '_rupture')) {
              if (!isInitial) showToast(\`Rupture de Stock : \${item.name} (\${qty} \${item.unit || 'unité'})\`, 'error');
              alertedStock.current.add(id + '_rupture');
              alertedStock.current.add(id); // Avoid double alert
            }
          } else if (qty <= minStock) {
            if (!alertedStock.current.has(id)) {
              if (!isInitial) showToast(\`Alerte Stock : \${item.name} est sous le seuil minimal (\${qty} \${item.unit || 'unité'}).\`, 'error');
              alertedStock.current.add(id);
            }
          } else {
            alertedStock.current.delete(id);
            alertedStock.current.delete(id + '_rupture');
          }
        }
      });
    });

    // HACCP DLC Alerts
    const unsubHaccp = onSnapshot(collection(db, 'haccpLots'), (snapshot) => {
      const isInitial = isInitialHaccpLoad.current;
      if (isInitial) {
        isInitialHaccpLoad.current = false;
      }
      const now = new Date();
      const warningTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 hours
      snapshot.docs.forEach(doc => {
        const lot = doc.data();
        if (lot.status !== 'Consommé' && lot.status !== 'Jeté' && lot.dlcDate) {
          const dlc = new Date(lot.dlcDate);
          const id = doc.id;
          
          if (dlc < now) {
            if (!alertedHACCP.current.has(id + '_expired')) {
              if (!isInitial) showToast(\`Alerte HACCP : Le lot \${lot.idLot} (\${lot.itemName}) est expiré !\`, 'error');
              alertedHACCP.current.add(id + '_expired');
            }
          } else if (dlc < warningTime) {
            if (!alertedHACCP.current.has(id + '_warning')) {
              if (!isInitial) showToast(\`Alerte HACCP : Le lot \${lot.idLot} expire bientôt (\${dlc.toLocaleDateString('fr-FR')}).\`, 'error');
              alertedHACCP.current.add(id + '_warning');
            }
          }
        }
      });
    });`;

const replace = `  useEffect(() => {
    // Inventory Alerts
    const unsubInv = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const item = change.doc.data();
        const minStock = parseFloat(item.minStock) || 0;
        const qty = parseFloat(item.quantity) || 0;
        const id = change.doc.id;
        
        if (minStock > 0) {
          if (qty <= 0) {
            if (!alertedStock.current.has(id + '_rupture')) {
              if (change.type === 'modified') {
                showToast(\`Rupture de Stock : \${item.name} (\${qty} \${item.unit || 'unité'})\`, 'error');
              }
              alertedStock.current.add(id + '_rupture');
              alertedStock.current.add(id); // Avoid double alert
            }
          } else if (qty <= minStock) {
            if (!alertedStock.current.has(id)) {
              if (change.type === 'modified') {
                showToast(\`Alerte Stock : \${item.name} est sous le seuil minimal (\${qty} \${item.unit || 'unité'}).\`, 'error');
              }
              alertedStock.current.add(id);
            }
            alertedStock.current.delete(id + '_rupture');
          } else {
            alertedStock.current.delete(id);
            alertedStock.current.delete(id + '_rupture');
          }
        } else {
          alertedStock.current.delete(id);
          alertedStock.current.delete(id + '_rupture');
        }
      });
    });

    // HACCP DLC Alerts
    const unsubHaccp = onSnapshot(collection(db, 'haccpLots'), (snapshot) => {
      const now = new Date();
      const warningTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 hours
      snapshot.docChanges().forEach(change => {
        const lot = change.doc.data();
        const id = change.doc.id;

        if (lot.status !== 'Consommé' && lot.status !== 'Jeté' && lot.dlcDate) {
          const dlc = new Date(lot.dlcDate);
          
          if (dlc < now) {
            if (!alertedHACCP.current.has(id + '_expired')) {
              if (change.type === 'modified') {
                showToast(\`Alerte HACCP : Le lot \${lot.idLot} (\${lot.itemName}) est expiré !\`, 'error');
              }
              alertedHACCP.current.add(id + '_expired');
            }
          } else if (dlc < warningTime) {
            if (!alertedHACCP.current.has(id + '_warning')) {
              if (change.type === 'modified') {
                showToast(\`Alerte HACCP : Le lot \${lot.idLot} expire bientôt (\${dlc.toLocaleDateString('fr-FR')}).\`, 'error');
              }
              alertedHACCP.current.add(id + '_warning');
            }
            alertedHACCP.current.delete(id + '_expired');
          } else {
            alertedHACCP.current.delete(id + '_expired');
            alertedHACCP.current.delete(id + '_warning');
          }
        } else {
          alertedHACCP.current.delete(id + '_expired');
          alertedHACCP.current.delete(id + '_warning');
        }
      });
    });`;

code = code.replace(search, replace);
fs.writeFileSync('src/NotificationSystem.tsx', code);
