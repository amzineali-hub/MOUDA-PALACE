import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { useToast } from './context/ToastContext';
import { QrCode, Printer, Thermometer, ShieldCheck, AlertTriangle, PackageOpen, Plus, Search, Calendar, ChefHat, CheckCircle2, Clock, X, Trash2, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TracabiliteHACCP() {
  const { showToast } = useToast();
  const [lots, setLots] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [operator, setOperator] = useState('');
  const [dlcDays, setDlcDays] = useState(3); // Default 3 days
  const [tempSealing, setTempSealing] = useState('');
  const [tempRefrigeration, setTempRefrigeration] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [labelData, setLabelData] = useState<any>(null);

  useEffect(() => {
    const unsubLots = onSnapshot(query(collection(db, 'haccpLots'), orderBy('createdAt', 'desc')), snapshot => {
      setLots(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubInv = onSnapshot(collection(db, 'inventoryItems'), snapshot => {
      setInventoryItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    return () => {
      unsubLots();
      unsubInv();
    };
  }, []);

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !operator || !tempSealing || !tempRefrigeration) {
      showToast("Veuillez remplir tous les champs obligatoires.", "error");
      return;
    }

    const item = inventoryItems.find(i => i.id === selectedItem);
    if (!item) return;

    setIsLoading(true);
    try {
      const lotNumber = `LOT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000).toString().padStart(3, '0')}`;
      const creationDate = new Date();
      const dlcDate = new Date(creationDate);
      dlcDate.setDate(dlcDate.getDate() + dlcDays);

      const lotData = {
        lotNumber,
        itemId: item.id,
        itemName: item.name,
        operator,
        tempSealing: parseFloat(tempSealing),
        tempRefrigeration: parseFloat(tempRefrigeration),
        quantity,
        dlcDays,
        dlcDate: dlcDate.toISOString(),
        status: 'Validé',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'haccpLots'), lotData);
      
      showToast("Lot sous-vide créé et validé HACCP.");
      setIsModalOpen(false);
      setLabelData({ ...lotData, id: docRef.id, creationDate: creationDate.toISOString() });
      
      // Reset form
      setSelectedItem('');
      setOperator('');
      setTempSealing('');
      setTempRefrigeration('');
      setQuantity(1);
      setDlcDays(3);
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la création du lot.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isDlcExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const isDlcSoon = (dateString: string) => {
    const dlc = new Date(dateString);
    const now = new Date();
    const diff = dlc.getTime() - now.getTime();
    return diff > 0 && diff <= 48 * 60 * 60 * 1000; // 48h
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Traçabilité HACCP & Sous-Vide</h1>
            <p className="text-gray-500">Gestion des lots, dates limites de consommation (DLC) et étiquetage</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <PackageOpen size={18} />
          Nouveau Conditionnement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <QrCode size={20} className="text-gray-400" />
              Registre des Lots (HACCP)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">N° Lot</th>
                  <th className="px-6 py-4 font-medium">Produit</th>
                  <th className="px-6 py-4 font-medium">Contrôle Temp.</th>
                  <th className="px-6 py-4 font-medium">DLC</th>
                  <th className="px-6 py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <ShieldCheck size={32} className="mx-auto text-gray-300 mb-3" />
                      Aucun lot enregistré
                    </td>
                  </tr>
                ) : (
                  lots.map(lot => {
                    const expired = isDlcExpired(lot.dlcDate);
                    const soon = isDlcSoon(lot.dlcDate);
                    return (
                      <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 flex items-center gap-2">
  {lot.lotNumber}
  {lot.status === 'Consommé' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Consommé</span>}
  {lot.status === 'Jeté' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Jeté</span>}
</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <ChefHat size={12} /> {lot.operator}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-indigo-700">
                          {lot.itemName}
                          <span className="ml-2 text-xs text-gray-500 font-normal">x{lot.quantity}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs flex items-center gap-2 mb-1">
                            <span className="w-4 h-4 rounded bg-orange-100 text-orange-600 flex items-center justify-center"><Thermometer size={10} /></span>
                            Scellage: <strong>{lot.tempSealing}°C</strong>
                          </div>
                          <div className="text-xs flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center"><Thermometer size={10} /></span>
                            Froid: <strong>{lot.tempRefrigeration}°C</strong>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className={`font-medium ${expired ? 'text-red-600' : soon ? 'text-orange-500' : 'text-gray-700'}`}>
                              {new Date(lot.dlcDate).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {expired && <span className="text-[10px] uppercase font-bold text-red-600 mt-1 block">Expiré</span>}
                          {soon && <span className="text-[10px] uppercase font-bold text-orange-500 mt-1 block">Expire bientôt</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => setLabelData({ ...lot, creationDate: lot.createdAt?.toDate ? lot.createdAt.toDate().toISOString() : new Date().toISOString() })}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex"
                            title="Imprimer l'étiquette"
                          >
                            <Printer size={18} />
                          </button>
                          
                          {lot.status !== 'Consommé' && lot.status !== 'Jeté' && (
                            <>
                              <button 
                                onClick={async () => {
                                  if(confirm('Marquer ce lot comme consommé ?')) {
                                    try {
                                      await updateDoc(doc(db, 'haccpLots', lot.id), { status: 'Consommé' });
                                      showToast('Lot marqué comme consommé', 'success');
                                    } catch(e) {}
                                  }
                                }}
                                className="p-2 ml-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-flex"
                                title="Marquer comme consommé"
                              >
                                <CheckSquare size={18} />
                              </button>
                              <button 
                                onClick={async () => {
                                  if(confirm('Marquer ce lot comme jeté (perte) ?')) {
                                    try {
                                      await updateDoc(doc(db, 'haccpLots', lot.id), { status: 'Jeté' });
                                      showToast('Lot marqué comme jeté', 'success');
                                      // Log waste
                                      await addDoc(collection(db, 'wasteRecords'), {
                                        item: lot.itemName,
                                        quantity: lot.quantity,
                                        unit: 'portion', // approx
                                        reason: 'DLC dépassée / Avarié (HACCP)',
                                        user: lot.operator,
                                        date: new Date().toLocaleDateString('fr-FR'),
                                        createdAt: serverTimestamp()
                                      });
                                    } catch(e) {}
                                  }
                                }}
                                className="p-2 ml-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                                title="Marquer comme jeté (perte)"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              Alertes Sanitaires
            </h3>
            <div className="space-y-3">
              {lots.filter(l => isDlcExpired(l.dlcDate)).map(lot => (
                <div key={`exp-${lot.id}`} className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-sm font-bold text-red-900">DLC Dépassée : {lot.itemName}</h4>
                    <p className="text-xs text-red-700 mt-1">Lot {lot.lotNumber} - À détruire immédiatement.</p>
                  </div>
                </div>
              ))}
              {lots.filter(l => isDlcSoon(l.dlcDate)).map(lot => (
                <div key={`soon-${lot.id}`} className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
                  <Clock className="text-orange-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-sm font-bold text-orange-900">DLC Proche : {lot.itemName}</h4>
                    <p className="text-xs text-orange-700 mt-1">Lot {lot.lotNumber} - À utiliser en priorité.</p>
                  </div>
                </div>
              ))}
              {lots.filter(l => isDlcExpired(l.dlcDate) || isDlcSoon(l.dlcDate)).length === 0 && (
                <div className="text-sm text-green-700 p-3 bg-green-50 rounded-xl flex items-center gap-2 border border-green-100">
                  <CheckCircle2 size={16} />
                  Aucune alerte sanitaire en cours.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nouveau Lot */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-xl"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <PackageOpen className="text-indigo-600" size={24} />
                Conditionnement Sous-Vide (HACCP)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateLot} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Produit à conditionner</label>
                  <select 
                    value={selectedItem}
                    onChange={e => setSelectedItem(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  >
                    <option value="">Sélectionner un produit...</option>
                    {inventoryItems.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (Stock: {i.quantity} {i.unit})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Opérateur (Chef)</label>
                  <input 
                    type="text"
                    value={operator}
                    onChange={e => setOperator(e.target.value)}
                    placeholder="Nom du responsable"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantité (Sachets)</label>
                  <input 
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  Contrôles Qualité Obligatoires
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">T° de refroidissement avant scellage (°C)</label>
                    <input 
                      type="number"
                      step="0.1"
                      max="10"
                      value={tempSealing}
                      onChange={e => setTempSealing(e.target.value)}
                      placeholder="Doit être < 10°C"
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">T° de stockage visée (°C)</label>
                    <input 
                      type="number"
                      step="0.1"
                      max="4"
                      value={tempRefrigeration}
                      onChange={e => setTempRefrigeration(e.target.value)}
                      placeholder="Doit être < 4°C"
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Durée de conservation (Jours)</label>
                  <div className="flex gap-2">
                    {[1, 3, 5, 7, 10, 21].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDlcDays(d)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${dlcDays === d ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {d} j
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  <CheckCircle2 size={18} />
                  {isLoading ? 'Enregistrement...' : 'Valider & Générer Étiquette'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Étiquette Virtual */}
      {labelData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-sm"
          >
            <div className="p-4 bg-gray-100 flex justify-between items-center border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Printer size={18} /> Aperçu Étiquette
              </h3>
              <button onClick={() => setLabelData(null)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 bg-white" id="label-print-area">
              <div className="border-4 border-black p-4 rounded-lg relative">
                <div className="text-center border-b-2 border-black pb-2 mb-3">
                  <h1 className="text-2xl font-black uppercase tracking-wider text-black leading-tight">
                    {labelData.itemName}
                  </h1>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-end border-b border-gray-300 pb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Lot N°</span>
                    <span className="font-mono font-bold text-sm text-black">{labelData.lotNumber}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-gray-300 pb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Préparation</span>
                    <span className="font-bold text-sm text-black">
                      {new Date(labelData.creationDate).toLocaleDateString('fr-FR')} {new Date(labelData.creationDate).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-gray-300 pb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">À consommer avant (DLC)</span>
                    <span className="font-black text-lg text-black bg-yellow-300 px-1">
                      {new Date(labelData.dlcDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-gray-300 pb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Opérateur</span>
                    <span className="font-bold text-sm text-black">{labelData.operator}</span>
                  </div>
                  <div className="flex justify-between items-end pb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Conservation</span>
                    <span className="font-bold text-sm text-black">&lt; {labelData.tempRefrigeration}°C</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t-2 border-black flex justify-between items-center">
                  <div className="text-[10px] font-bold text-center leading-tight">
                    CONSERVER AU<br/>RÉFRIGÉRATEUR<br/>SOUS-VIDE
                  </div>
                  {/* Simulated QR Code using CSS grid */}
                  <div className="w-16 h-16 grid grid-cols-4 grid-rows-4 gap-[2px] bg-white border-2 border-black p-1">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={`${[0,1,3,4,6,8,9,11,14,15].includes(i) ? 'bg-black' : 'bg-transparent'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setLabelData(null)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Fermer
              </button>
              <button 
                onClick={() => {
                  showToast("Impression lancée vers l'imprimante d'étiquettes...");
                  setTimeout(() => setLabelData(null), 1500);
                }} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
              >
                <Printer size={16} /> Imprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
