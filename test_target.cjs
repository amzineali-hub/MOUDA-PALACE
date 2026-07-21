const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetInventoryAlerts = `function InventoryAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
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
      console.error("Error fetching inventory alerts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || alerts.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
          <AlertTriangle size={20} />
        </div>
        <h3 className="text-lg font-serif font-medium text-red-900">Alertes de Stock</h3>
      </div>
      <div className="space-y-3">
        {alerts.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-red-50">
            <span className="font-medium text-red-900">{item.name || 'Produit inconnu'}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-red-700">Stock actuel: {item.quantity} {item.unit || ''}</span>
              <span className="text-sm text-red-500 font-medium">Seuil: {item.criticalThreshold} {item.unit || ''}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}`;

console.log("Matched?", content.includes(targetInventoryAlerts));
