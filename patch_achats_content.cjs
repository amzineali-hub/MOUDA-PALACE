const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

// Insert ReceptionAchats rendering
const renderingTarget = `{activeTab === 'fournisseurs' && (`;
const renderingReplacement = `{activeTab === 'reception' && (
            <div className="p-4">
              <ReceptionAchats commandes={commandes} inventoryItems={inventoryItems} showToast={showToast} />
            </div>
          )}
          
          {activeTab === 'fournisseurs' && (`;

content = content.replace(renderingTarget, renderingReplacement);

// Append ReceptionAchats component
const appendedComponents = `

function ReceptionAchats({ commandes, inventoryItems, showToast }: { commandes: any[], inventoryItems: any[], showToast: any }) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const pendingOrders = commandes.filter(c => c.status === "En attente" || c.status === "Validée");

  const handleValidate = async (orderId: string, receivedItems: any[], status: 'Livrée' | 'Refusée', invoiceNote: string) => {
    try {
      if (status === 'Livrée') {
        const totalActual = receivedItems.reduce((sum, item) => sum + ((item.quantityReceived || 0) * (item.actualPrice || 0)), 0);
        
        // 1. Update purchase order
        await updateDoc(doc(db, 'commandes', orderId), {
          status: 'Livrée',
          items: receivedItems,
          totalActual,
          receivedAt: serverTimestamp(),
          invoiceNote
        });

        // 2. Update stock & Create transactions
        const batchPromises = receivedItems.map(async (item) => {
          if (item.quantityReceived > 0) {
            // Match inventory item by name (since the original commande might not have inventoryItemId)
            const inventoryItem = inventoryItems.find(i => i.name.toLowerCase() === item.name.toLowerCase() || i.id === item.inventoryItemId);
            
            if (inventoryItem) {
              const newQty = (inventoryItem.quantity || 0) + item.quantityReceived;
              await updateDoc(doc(db, 'inventoryItems', inventoryItem.id), {
                quantity: newQty,
                updatedAt: serverTimestamp()
              });

              // Add stock transaction
              await addDoc(collection(db, 'inventoryTransactions'), {
                item: inventoryItem.name,
                type: 'in',
                amount: item.quantityReceived,
                unit: inventoryItem.unit || item.unit || 'unité',
                reason: \`Réception Commande \${orderId.substring(0,6)}\`,
                user: 'Gestionnaire Achats',
                date: new Date().toLocaleDateString('fr-FR'),
                createdAt: serverTimestamp()
              });
            }
          }
        });
        
        await Promise.all(batchPromises);

        // 3. Create accounting transaction (Expense)
        if (totalActual > 0) {
          const supplierName = selectedOrder?.fournisseur || selectedOrder?.supplier || 'Fournisseur Inconnu';
          await addDoc(collection(db, 'transactions'), {
            amount: -totalActual, // negative for expense
            category: 'Achats / Marchandises',
            date: new Date().toISOString().split('T')[0],
            description: \`Achat Marchandises (BC: \${orderId.substring(0,8)}) - Fournisseur: \${supplierName}\`,
            type: 'expense',
            timestamp: serverTimestamp()
          });
        }
        
        showToast("Réception validée, stock et comptabilité mis à jour !");
      } else {
        await updateDoc(doc(db, 'commandes', orderId), {
          status: 'Refusée',
          receivedAt: serverTimestamp(),
          invoiceNote
        });
        showToast("Commande refusée.");
      }
      
      setSelectedOrder(null);
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la validation", "error");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-serif text-gray-900 mb-6">Contrôle Terrain & Réception</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingOrders.length === 0 ? (
          <p className="text-gray-500 col-span-full">Aucune livraison en attente de réception.</p>
        ) : (
          pendingOrders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md">#{order.id.substring(0,8)}</span>
                  <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium">{order.status}</span>
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-1">{order.fournisseur || order.supplier || 'Fournisseur Inconnu'}</h4>
                <p className="text-sm text-gray-600 mb-2">{(order.items || order.articles || []).length} articles prévus</p>
                <p className="text-xl font-semibold text-gray-900 mb-6">{order.total || order.totalExpected || 0} MAD</p>
              </div>
              
              <button 
                onClick={() => setSelectedOrder(order)}
                className="w-full py-3 bg-[#265C6D] text-white rounded-xl text-sm font-medium hover:bg-[#1a4250] transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Effectuer le contrôle
              </button>
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <ValidateReceptionModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onValidate={handleValidate}
        />
      )}
    </div>
  );
}

function ValidateReceptionModal({ order, onClose, onValidate }: { order: any, onClose: () => void, onValidate: any }) {
  const originalItems = order.items || order.articles || [];
  const [items, setItems] = useState<any[]>(
    originalItems.map((i: any) => ({
      ...i,
      name: i.name || i.produit || 'Produit inconnu',
      quantityOrdered: i.qty || i.quantity || i.quantityOrdered || 0,
      quantityReceived: i.qty || i.quantity || i.quantityOrdered || 0,
      expectedPrice: i.price || i.prix || i.expectedPrice || 0,
      actualPrice: i.price || i.prix || i.expectedPrice || 0,
      qualityOk: true
    }))
  );
  const [invoiceNote, setInvoiceNote] = useState('');

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleAccept = () => {
    onValidate(order.id, items, 'Livrée', invoiceNote);
  };

  const handleReject = () => {
    if (window.confirm("Voulez-vous vraiment refuser entièrement cette livraison ?")) {
      onValidate(order.id, items, 'Refusée', invoiceNote);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Contrôle de Réception (3 points)</h3>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Store size={14} /> {order.fournisseur || order.supplier} 
              <span className="text-gray-300">|</span> 
              Commande #{order.id.substring(0,8)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertTriangle className="text-blue-500 mt-0.5 shrink-0" size={18} />
            <div className="text-sm text-blue-900">
              <strong className="block mb-1">Procédure de validation obligatoire :</strong>
              Vérifiez physiquement la <strong>Quantité</strong> reçue, le <strong>Prix Unitaire</strong> facturé, et la <strong>Qualité</strong> (conformité) pour chaque article avant validation.
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Article</th>
                  <th className="px-4 py-3 font-medium text-center">Qté Prévue</th>
                  <th className="px-4 py-3 font-medium text-center">Qté Reçue</th>
                  <th className="px-4 py-3 font-medium text-right">Prix (MAD)</th>
                  <th className="px-4 py-3 font-medium text-center">Qualité OK?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={idx} className={!item.qualityOk ? 'bg-red-50/50' : ''}>
                    <td className="px-4 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-4 text-center text-gray-500">{item.quantityOrdered} {item.unit || ''}</td>
                    <td className="px-4 py-4">
                      <input 
                        type="number" 
                        min="0" step="0.1"
                        value={item.quantityReceived}
                        onChange={e => handleItemChange(idx, 'quantityReceived', parseFloat(e.target.value) || 0)}
                        className="w-24 text-center text-sm rounded-lg border-gray-200 focus:border-[#265C6D] focus:ring-[#265C6D] mx-auto block"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-end">
                        <input 
                          type="number" 
                          min="0" step="0.01"
                          value={item.actualPrice}
                          onChange={e => handleItemChange(idx, 'actualPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 text-right text-sm rounded-lg border-gray-200 focus:border-[#265C6D] focus:ring-[#265C6D]"
                        />
                        {item.actualPrice !== item.expectedPrice && (
                          <span className="text-[10px] font-medium text-amber-600 mt-1 bg-amber-50 px-2 py-0.5 rounded-full">
                            Prévu: {item.expectedPrice}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input 
                        type="checkbox"
                        checked={item.qualityOk}
                        onChange={e => handleItemChange(idx, 'qualityOk', e.target.checked)}
                        className="w-5 h-5 text-[#265C6D] rounded border-gray-300 focus:ring-[#265C6D] cursor-pointer mx-auto block"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de facture / Bon de livraison (Optionnel)</label>
            <input 
              type="text" 
              value={invoiceNote}
              onChange={e => setInvoiceNote(e.target.value)}
              className="w-full text-sm rounded-lg border-gray-200 focus:border-[#265C6D] focus:ring-[#265C6D] p-3"
              placeholder="Ex: BL-2026-890"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          <button onClick={handleReject} className="w-full sm:w-auto px-6 py-3 text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center font-medium transition-colors">
            <XCircle size={18} className="mr-2" /> Refuser la livraison
          </button>
          
          <button onClick={handleAccept} className="w-full sm:w-auto px-8 py-3 bg-[#265C6D] text-white rounded-xl flex items-center justify-center font-medium hover:bg-[#1a4250] transition-colors shadow-sm">
            <CheckCircle size={18} className="mr-2" /> Valider & Entrée en Stock
          </button>
        </div>
      </div>
    </div>
  );
}
`;

content = content + appendedComponents;

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log("Patched AchatsFournisseurs content");
