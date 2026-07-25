const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldAlertsEffect = `  useEffect(() => {
    const q = query(collection(db, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lowStockItems: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.quantity !== undefined && data.criticalThreshold !== undefined) {
          if (isCriticalStock(data.quantity, data.criticalThreshold)) {
            lowStockItems.push({ id: doc.id, ...data });
          }
        }
      });
      setAlerts(lowStockItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory for alerts", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);`;

const newAlertsEffect = `  useEffect(() => {
    const q = query(collection(db, 'inventoryItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lowStockItems: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.quantity !== undefined && data.minStock !== undefined) {
          if (data.quantity <= data.minStock) {
            lowStockItems.push({ id: doc.id, ...data, criticalThreshold: data.minStock });
          }
        }
      });
      setAlerts(lowStockItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory for alerts", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);`;

content = content.replace(oldAlertsEffect, newAlertsEffect);
fs.writeFileSync('src/App.tsx', content);
