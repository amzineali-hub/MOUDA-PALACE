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

const replacement = `function InventoryAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderingItem, setOrderingItem] = useState<any | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

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
  }, [user]);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(\`Commande fournisseur envoyée pour \${orderingItem?.name}\`);
    setOrderingItem(null);
  };

  if (loading || alerts.length === 0) return null;

  return (
    <>
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
            <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white/60 p-3 rounded-lg border border-red-50 gap-4">
              <span className="font-medium text-red-900">{item.name || 'Produit inconnu'}</span>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <span className="text-sm text-red-700">Stock actuel: {item.quantity} {item.unit || ''}</span>
                <span className="text-sm text-red-500 font-medium">Seuil: {item.criticalThreshold} {item.unit || ''}</span>
                <button 
                  onClick={() => setOrderingItem(item)}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  <ShoppingCart size={16} />
                  Commander
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Order Modal */}
      {orderingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-serif font-medium text-gray-900">Nouvelle Commande Fournisseur</h3>
              <button onClick={() => setOrderingItem(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleOrderSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                  <input 
                    type="text" 
                    value={orderingItem.name || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actuel</label>
                    <input 
                      type="text" 
                      value={\`\${orderingItem.quantity} \${orderingItem.unit || ''}\`}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-red-50 text-red-600 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Suggérée</label>
                    <input 
                      type="number" 
                      defaultValue={Math.max((orderingItem.criticalThreshold * 3) - orderingItem.quantity, orderingItem.criticalThreshold * 2)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur (Optionnel)</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all">
                    <option value="">Sélectionner un fournisseur régulier</option>
                    <option value="f1">Fournisseur Principal (Marché Central)</option>
                    <option value="f2">Grossiste Viande & Volaille</option>
                    <option value="f3">Distributeur Epicerie Fine</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setOrderingItem(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-[#DDA956] hover:bg-[#c99a4e] transition-colors shadow-lg shadow-[#DDA956]/20 flex justify-center items-center gap-2"
                >
                  <Send size={18} />
                  Envoyer Commande
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}`;

content = content.replace(targetInventoryAlerts, replacement);

fs.writeFileSync('src/App.tsx', content);
