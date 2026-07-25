const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldStockState = `  const [stockItemsData, setStockItemsData] = useState(() => {
    const saved = localStorage.getItem('inventoryItems');
    return saved ? JSON.parse(saved) : [
      { id: 'INV-001', name: 'Safran de Taliouine', category: 'Épices', supplier: 'Coopérative Taliouine', quantity: 250, unit: 'g', minStock: 100, requiredQty: 150 },
      { id: 'INV-002', name: 'Huile d\\'Olive Vierge Extra', category: 'Épicerie', supplier: 'Ferme Atlas', quantity: 15, unit: 'L', minStock: 20, requiredQty: 25 },
      { id: 'INV-003', name: 'Viande d\\'Agneau (Épaule)', category: 'Viandes', supplier: 'Boucherie Médina', quantity: 45, unit: 'kg', minStock: 20, requiredQty: 30 },
      { id: 'INV-004', name: 'Menthe Fraîche', category: 'Herbes', supplier: 'Marché Central', quantity: 2, unit: 'kg', minStock: 5, requiredQty: 5 },
      { id: 'INV-005', name: 'Amandes Émondées', category: 'Fruits Secs', supplier: 'Grossiste Fès', quantity: 12, unit: 'kg', minStock: 10, requiredQty: 15 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('inventoryCategories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('inventoryItems', JSON.stringify(stockItemsData));
  }, [stockItemsData]);`;

const newStockState = `  const [stockItemsData, setStockItemsData] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('inventoryCategories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'inventoryItems'), orderBy('createdAt', 'desc')), (snapshot) => {
      setStockItemsData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching inventoryItems", error);
    });
    return () => unsub();
  }, []);`;

content = content.replace(oldStockState, newStockState);

const oldRecentTransactions = `  const recentTransactions = [
    { id: 'TX-1209', type: 'out', item: 'Menthe Fraîche', amount: 0.5, unit: 'kg', reason: 'Service Thé du Soir (Cuisine)', date: 'Aujourd\\'hui, 17:30', user: 'Chef Hassan' },
    { id: 'TX-1208', type: 'in', item: 'Viande d\\'Agneau (Épaule)', amount: 20, unit: 'kg', reason: 'Livraison Hebdomadaire', date: 'Aujourd\\'hui, 09:15', user: 'Réception' },
    { id: 'TX-1207', type: 'out', item: 'Huile d\\'Olive Vierge Extra', amount: 2, unit: 'L', reason: 'Préparation Tagines (Cuisine)', date: 'Hier, 11:00', user: 'Chef Hassan' }
  ];`;

const newRecentTransactions = `  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'inventoryTransactions'), orderBy('createdAt', 'desc')), (snapshot) => {
      setRecentTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching inventoryTransactions", error);
    });
    return () => unsub();
  }, []);`;

content = content.replace(oldRecentTransactions, newRecentTransactions);

const oldProductionTasks = `  const [productionTasks, setProductionTasks] = useState([
    { item: "Fonds de volaille", qty: "10 L", progress: 100, status: "Terminé", priority: "Basse" },
    { item: "Légumes taillés (Brunoise)", qty: "5 kg", progress: 60, status: "En cours", priority: "Moyenne" },
    { item: "Pâte à Pastilla", qty: "40 feuilles", progress: 0, status: "À faire", priority: "Haute" }
  ]);`;

const newProductionTasks = `  const [productionTasks, setProductionTasks] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'productionTasks'), orderBy('createdAt', 'desc')), (snapshot) => {
      setProductionTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching productionTasks", error);
    });
    return () => unsub();
  }, []);`;

content = content.replace(oldProductionTasks, newProductionTasks);

fs.writeFileSync('src/App.tsx', content);
