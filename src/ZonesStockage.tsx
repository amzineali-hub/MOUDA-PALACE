import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useToast } from './context/ToastContext';
import { Package, ThermometerSnowflake, Wine, ShoppingBag, Plus, Edit2, AlertTriangle, ChevronRight, Settings, Trash2 } from 'lucide-react';

const DEFAULT_ZONES = [
  { id: 'economat', name: 'Économat', description: 'Produits secs / denrées non périssables', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'chambre_froide', name: 'Chambre Froide', description: 'Produits frais / viandes / légumes', icon: ThermometerSnowflake, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'cave', name: 'Cave', description: 'Boissons et vins', icon: Wine, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'consommables', name: 'Consommables', description: 'Articles non alimentaires', icon: ShoppingBag, color: 'text-gray-600', bg: 'bg-gray-50' }
];

export default function ZonesStockage() {
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);
  const [activeZone, setActiveZone] = useState('economat');
  const [subZones, setSubZones] = useState<any[]>([]);
  const [isManageSubZonesOpen, setIsManageSubZonesOpen] = useState(false);
  const [newSubZone, setNewSubZone] = useState({ name: '', zoneId: '' });
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [itemToAssign, setItemToAssign] = useState<any>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'subZones')), (snapshot) => {
      setSubZones(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

  const handleAddSubZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubZone.name || !newSubZone.zoneId) return;
    try {
      await addDoc(collection(db, 'subZones'), {
        ...newSubZone,
        createdAt: serverTimestamp()
      });
      setNewSubZone({ name: '', zoneId: '' });
      showToast("Sous-emplacement ajouté");
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'ajout", "error");
    }
  };

  const handleAssignItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToAssign.itemId || !itemToAssign.zone) return;
    
    try {
      await updateDoc(doc(db, 'inventoryItems', itemToAssign.itemId), {
        zone: itemToAssign.zone,
        subZone: itemToAssign.subZone || ''
      });
      showToast("Affectation mise à jour");
      setAssignModalOpen(false);
      setItemToAssign(null);
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'affectation", "error");
    }
  };

  const currentZoneData = DEFAULT_ZONES.find(z => z.id === activeZone);
  const currentZoneItems = inventoryItems.filter(i => i.zone === activeZone);
  const currentSubZones = subZones.filter(sz => sz.zoneId === activeZone);

  // Group items by subzone
  const itemsBySubZone = currentSubZones.reduce((acc, sz) => {
    acc[sz.id] = currentZoneItems.filter(i => i.subZone === sz.id);
    return acc;
  }, {} as Record<string, any[]>);
  
  const unassignedItemsInZone = currentZoneItems.filter(i => !i.subZone || !currentSubZones.find(sz => sz.id === i.subZone));

  const itemsWithoutZone = inventoryItems.filter(i => !i.zone);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Zone Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEFAULT_ZONES.map(zone => {
          const Icon = zone.icon;
          const isActive = activeZone === zone.id;
          const itemCount = inventoryItems.filter(i => i.zone === zone.id).length;
          
          return (
            <button
              key={zone.id}
              onClick={() => setActiveZone(zone.id)}
              className={`p-4 rounded-2xl border text-left transition-all \${isActive ? 'border-[#265C6D] shadow-md bg-white' : 'border-gray-200 bg-white hover:border-[#265C6D]/30'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-xl \${isActive ? zone.bg : 'bg-gray-50'}`}>
                  <Icon size={24} className={isActive ? zone.color : 'text-gray-400'} />
                </div>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">{itemCount} articles</span>
              </div>
              <h3 className={`font-bold text-lg \${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{zone.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{zone.description}</p>
            </button>
          );
        })}
      </div>

      {/* Main Zone Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {currentZoneData?.icon && <currentZoneData.icon size={24} className={currentZoneData.color} />}
              Détails : {currentZoneData?.name}
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setItemToAssign({ itemId: '', zone: activeZone, subZone: '' });
                setAssignModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#265C6D] text-white rounded-lg text-sm font-medium hover:bg-[#1a4250] transition-colors"
            >
              <Plus size={16} /> Affecter un article
            </button>
            <button 
              onClick={() => setIsManageSubZonesOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Settings size={16} /> Configurer
            </button>
          </div>
        </div>

        <div className="p-6">
          {itemsWithoutZone.length > 0 && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-amber-900">Articles sans zone ({itemsWithoutZone.length})</h4>
                <p className="text-sm text-amber-700 mt-1 mb-3">Certains articles de votre inventaire ne sont pas encore affectés à une zone de stockage.</p>
                <div className="flex flex-wrap gap-2">
                  {itemsWithoutZone.slice(0, 5).map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => {
                        setItemToAssign({ itemId: item.id, zone: activeZone, subZone: '' });
                        setAssignModalOpen(true);
                      }}
                      className="bg-white text-xs px-3 py-1 rounded-full border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      {item.name} +
                    </button>
                  ))}
                  {itemsWithoutZone.length > 5 && <span className="text-xs text-amber-600 px-2 py-1">... et {itemsWithoutZone.length - 5} autres</span>}
                </div>
              </div>
            </div>
          )}

          {currentSubZones.length === 0 && unassignedItemsInZone.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun article dans cette zone</h3>
              <p className="text-gray-500">Affectez des articles de l'inventaire pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {currentSubZones.map(subZone => (
                <div key={subZone.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <ChevronRight size={18} className="text-gray-400" />
                      {subZone.name}
                    </h4>
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                      {itemsBySubZone[subZone.id]?.length || 0} articles
                    </span>
                  </div>
                  
                  <div className="p-0">
                    <ItemsTable items={itemsBySubZone[subZone.id] || []} onEdit={(item) => {
                      setItemToAssign({ itemId: item.id, zone: activeZone, subZone: subZone.id });
                      setAssignModalOpen(true);
                    }} />
                  </div>
                </div>
              ))}

              {unassignedItemsInZone.length > 0 && (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <ChevronRight size={18} className="text-gray-400" />
                      Général (Non classé dans un sous-emplacement)
                    </h4>
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                      {unassignedItemsInZone.length} articles
                    </span>
                  </div>
                  <div className="p-0">
                    <ItemsTable items={unassignedItemsInZone} onEdit={(item) => {
                      setItemToAssign({ itemId: item.id, zone: activeZone, subZone: item.subZone || '' });
                      setAssignModalOpen(true);
                    }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {assignModalOpen && itemToAssign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Affecter un article</h3>
            <form onSubmit={handleAssignItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article de l'inventaire</label>
                <select 
                  value={itemToAssign.itemId}
                  onChange={(e) => setItemToAssign({ ...itemToAssign, itemId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-2.5"
                  required
                >
                  <option value="">Sélectionner un article...</option>
                  {inventoryItems.filter(i => !i.zone || i.id === itemToAssign.itemId || i.zone === activeZone).map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Stock: {i.quantity})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone de stockage</label>
                <select 
                  value={itemToAssign.zone}
                  onChange={(e) => setItemToAssign({ ...itemToAssign, zone: e.target.value, subZone: '' })}
                  className="w-full border border-gray-200 rounded-lg p-2.5"
                  required
                >
                  {DEFAULT_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sous-emplacement (Optionnel)</label>
                <select 
                  value={itemToAssign.subZone}
                  onChange={(e) => setItemToAssign({ ...itemToAssign, subZone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-2.5"
                >
                  <option value="">Général</option>
                  {subZones.filter(sz => sz.zoneId === itemToAssign.zone).map(sz => (
                    <option key={sz.id} value={sz.id}>{sz.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setAssignModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-[#265C6D] text-white rounded-lg">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage SubZones Modal */}
      {isManageSubZonesOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sous-emplacements (Étagères, Rayons...)</h3>
            
            <form onSubmit={handleAddSubZone} className="flex gap-2 mb-6">
              <div className="flex-1">
                <select 
                  value={newSubZone.zoneId}
                  onChange={e => setNewSubZone({...newSubZone, zoneId: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-2.5 mb-2"
                  required
                >
                  <option value="">Choisir une zone...</option>
                  {DEFAULT_ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
                <input 
                  type="text" 
                  value={newSubZone.name}
                  onChange={e => setNewSubZone({...newSubZone, name: e.target.value})}
                  placeholder="Nom de l'emplacement (ex: Étagère 1)"
                  className="w-full border border-gray-200 rounded-lg p-2.5"
                  required
                />
              </div>
              <button type="submit" className="self-end px-4 py-2.5 bg-\[#265C6D\] text-white rounded-lg hover:bg-\[#1a4250\] h-[46px] mt-[42px] flex items-center">
                <Plus size={18} />
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2 font-medium">Zone</th>
                    <th className="px-4 py-2 font-medium">Nom</th>
                    <th className="px-4 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subZones.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-500">Aucun sous-emplacement configuré</td></tr>
                  ) : (
                    subZones.map(sz => (
                      <tr key={sz.id}>
                        <td className="px-4 py-2">{DEFAULT_ZONES.find(z => z.id === sz.zoneId)?.name}</td>
                        <td className="px-4 py-2 font-medium">{sz.name}</td>
                        <td className="px-4 py-2 text-right">
                          <button 
                            onClick={async () => {
                              if (window.confirm('Voulez-vous supprimer ce sous-emplacement ?')) {
                                try {
                                  await deleteDoc(doc(db, 'subZones', sz.id));
                                  showToast("Sous-emplacement supprimé");
                                } catch (e) {
                                  showToast("Erreur lors de la suppression", "error");
                                }
                              }
                            }}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end mt-6">
              <button onClick={() => setIsManageSubZonesOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Fermer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ItemsTable({ items, onEdit }: { items: any[], onEdit: (item: any) => void }) {
  if (items.length === 0) return <div className="p-4 text-center text-sm text-gray-500">Aucun article ici.</div>;
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100 text-xs">
          <tr>
            <th className="px-4 py-2 font-medium">Article</th>
            <th className="px-4 py-2 font-medium">Catégorie</th>
            <th className="px-4 py-2 font-medium text-right">Quantité en stock</th>
            <th className="px-4 py-2 font-medium text-center">Statut</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(item => {
            const isLow = (item.quantity || 0) <= (item.minThreshold || 0);
            return (
              <tr key={item.id} className={`hover:bg-gray-50 \${isLow ? 'bg-red-50/30' : ''}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-500">{item.category}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-bold \${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.quantity} {item.unit}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {isLow ? (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      <AlertTriangle size={12} /> Stock Bas
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      En stock
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onEdit(item)} className="text-gray-400 hover:text-[#265C6D] transition-colors p-1">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
