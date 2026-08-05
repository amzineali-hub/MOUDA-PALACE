import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy, where, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { useToast } from './context/ToastContext';
import { ThermometerSnowflake, ArrowRightCircle, AlertTriangle, Clock, Activity, ShieldCheck, Plus, CheckCircle2, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChambreNegative() {
  const { showToast } = useToast();
  const [lots, setLots] = useState<any[]>([]);
  const [temperatureLogs, setTemperatureLogs] = useState<any[]>([]);
  
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isTempModalOpen, setIsTempModalOpen] = useState(false);
  
  const [exitItemName, setExitItemName] = useState('');
  const [exitQuantity, setExitQuantity] = useState(1);
  
  const [newTemp, setNewTemp] = useState('');
  const [tempOperator, setTempOperator] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch all lots (we can assume tempRefrigeration <= 0 are in negative room, or just all lots for demo)
    const unsubLots = onSnapshot(query(collection(db, 'haccpLots'), orderBy('dlcDate', 'asc')), snapshot => {
      // Filter for items that are not exhausted
      const allLots = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setLots(allLots.filter((l: any) => l.status !== 'Épuisé' && l.tempRefrigeration <= 0));
    });

    const unsubTemp = onSnapshot(query(collection(db, 'temperatureLogs'), orderBy('timestamp', 'desc')), snapshot => {
      setTemperatureLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    return () => {
      unsubLots();
      unsubTemp();
    };
  }, []);

  const handleLogTemperature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemp || !tempOperator) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'temperatureLogs'), {
        temperature: parseFloat(newTemp),
        operator: tempOperator,
        room: 'Chambre Négative',
        timestamp: serverTimestamp()
      });
      showToast("Relevé de température enregistré.");
      setIsTempModalOpen(false);
      setNewTemp('');
      setTempOperator('');
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'enregistrement.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitFIFO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitItemName || exitQuantity <= 0) return;

    setIsLoading(true);
    try {
      // Find lots for this item, already sorted by dlcDate asc (FIFO)
      const matchingLots = lots.filter(l => l.itemName === exitItemName && l.status !== 'Épuisé');
      
      let remainingToExit = exitQuantity;
      
      await runTransaction(db, async (transaction) => {
        for (const lot of matchingLots) {
          if (remainingToExit <= 0) break;
          
          const lotRef = doc(db, 'haccpLots', lot.id);
          const currentQty = parseInt(lot.quantity) || 0;
          
          if (currentQty <= remainingToExit) {
            // Exhaust this lot
            transaction.update(lotRef, {
              quantity: 0,
              status: 'Épuisé',
              updatedAt: serverTimestamp()
            });
            remainingToExit -= currentQty;
          } else {
            // Partially use this lot
            transaction.update(lotRef, {
              quantity: currentQty - remainingToExit,
              status: 'Entamé',
              updatedAt: serverTimestamp()
            });
            remainingToExit = 0;
          }
        }
      });

      if (remainingToExit > 0) {
        showToast(`Attention: Stock insuffisant. ${remainingToExit} manquants.`, "error");
      } else {
        showToast("Sortie FIFO enregistrée avec succès.");
      }
      setIsExitModalOpen(false);
      setExitItemName('');
      setExitQuantity(1);
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la sortie.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueItems = Array.from(new Set(lots.map(l => l.itemName)));

  const isDlcExpired = (dateString: string) => new Date(dateString) < new Date();
  const isDlcSoon = (dateString: string) => {
    const diff = new Date(dateString).getTime() - new Date().getTime();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000; // 7 days for frozen
  };

  const latestTemp = temperatureLogs.length > 0 ? temperatureLogs[0].temperature : null;
  const tempStatus = latestTemp === null ? 'unknown' : (latestTemp > -18 ? 'danger' : 'ok');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <ThermometerSnowflake size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Chambre Négative & Lots</h1>
            <p className="text-gray-500">Gestion des stocks surgelés et application de la règle FIFO</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsTempModalOpen(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Activity size={18} />
            Relever Temp.
          </button>
          <button 
            onClick={() => setIsExitModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <ArrowRightCircle size={18} />
            Sortie FIFO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Stats & Temperature */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ThermometerSnowflake size={18} className="text-blue-500" />
              État de la Chambre
            </h3>
            <div className={`p-4 rounded-xl flex items-center justify-between border ${tempStatus === 'danger' ? 'bg-red-50 border-red-200' : tempStatus === 'ok' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <div>
                <p className="text-sm text-gray-500 mb-1">Dernier relevé</p>
                <div className={`text-3xl font-black ${tempStatus === 'danger' ? 'text-red-700' : tempStatus === 'ok' ? 'text-blue-700' : 'text-gray-700'}`}>
                  {latestTemp !== null ? `${latestTemp}°C` : '--'}
                </div>
              </div>
              <Activity className={tempStatus === 'danger' ? 'text-red-400' : tempStatus === 'ok' ? 'text-blue-400' : 'text-gray-400'} size={32} />
            </div>
            {tempStatus === 'danger' && (
              <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
                <AlertTriangle size={12} /> Alerte: Température &gt; -18°C
              </p>
            )}
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Derniers relevés</h4>
              <div className="space-y-2">
                {temperatureLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">{log.timestamp?.toDate ? new Date(log.timestamp.toDate()).toLocaleString('fr-FR', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'}) : ''}</span>
                    <span className={`font-bold ${log.temperature > -18 ? 'text-red-600' : 'text-blue-600'}`}>{log.temperature}°C</span>
                    <span className="text-gray-400 truncate w-16 text-right">{log.operator}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-amber-500" />
              Alertes DLC Courtes
            </h3>
            <div className="space-y-3">
              {lots.filter(l => isDlcExpired(l.dlcDate)).map(lot => (
                <div key={`exp-${lot.id}`} className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                    <div>
                      <h4 className="text-xs font-bold text-red-900">{lot.itemName}</h4>
                      <p className="text-[10px] text-red-700 mt-0.5">Lot {lot.lotNumber} - Périmé</p>
                    </div>
                  </div>
                </div>
              ))}
              {lots.filter(l => isDlcSoon(l.dlcDate) && !isDlcExpired(l.dlcDate)).map(lot => (
                <div key={`soon-${lot.id}`} className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Clock className="text-orange-500 shrink-0 mt-0.5" size={14} />
                    <div>
                      <h4 className="text-xs font-bold text-orange-900">{lot.itemName}</h4>
                      <p className="text-[10px] text-orange-700 mt-0.5">Lot {lot.lotNumber} - Exp. {new Date(lot.dlcDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
              ))}
              {lots.filter(l => isDlcExpired(l.dlcDate) || isDlcSoon(l.dlcDate)).length === 0 && (
                <div className="text-sm text-green-700 p-3 bg-green-50 rounded-xl flex items-center gap-2 border border-green-100">
                  <CheckCircle2 size={16} />
                  Aucune alerte DLC.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Lots Inventory */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <QrCode size={20} className="text-gray-400" />
              Inventaire Surgelés (Ordre FIFO)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">N° Lot</th>
                  <th className="px-6 py-4 font-medium">Produit</th>
                  <th className="px-6 py-4 font-medium">Quantité</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium">DLC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <ThermometerSnowflake size={48} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-lg font-medium text-gray-900">Chambre négative vide</p>
                      <p>Aucun lot enregistré avec une température &le; 0°C</p>
                    </td>
                  </tr>
                ) : (
                  lots.map(lot => {
                    const expired = isDlcExpired(lot.dlcDate);
                    const soon = isDlcSoon(lot.dlcDate);
                    return (
                      <tr key={lot.id} className={`hover:bg-gray-50 transition-colors ${expired ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-4 font-mono font-bold text-gray-900 text-xs">
                          {lot.lotNumber}
                        </td>
                        <td className="px-6 py-4 font-medium text-blue-700">
                          {lot.itemName}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {lot.quantity} sachet(s)
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                            ${lot.status === 'Entamé' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {lot.status || 'En stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${expired ? 'text-red-600' : soon ? 'text-orange-500' : 'text-gray-700'}`}>
                            {new Date(lot.dlcDate).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Relevé Température */}
      {isTempModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
          >
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Relevé de Température</h3>
            </div>
            
            <form onSubmit={handleLogTemperature} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Température lue (°C)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={newTemp}
                  onChange={e => setNewTemp(e.target.value)}
                  placeholder="-18.0"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Opérateur (Responsable)</label>
                <input 
                  type="text"
                  value={tempOperator}
                  onChange={e => setTempOperator(e.target.value)}
                  placeholder="Nom du contrôleur"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsTempModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Sortie FIFO */}
      {isExitModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ArrowRightCircle className="text-blue-600" size={24} />
                Sortie de Stock (Mode FIFO)
              </h3>
              <p className="text-sm text-gray-500 mt-1">Le système sélectionnera automatiquement les lots dont la DLC est la plus proche.</p>
            </div>
            
            <form onSubmit={handleExitFIFO} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Produit à sortir</label>
                <select 
                  value={exitItemName}
                  onChange={e => setExitItemName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                >
                  <option value="">Sélectionner un produit...</option>
                  {uniqueItems.map((name, idx) => {
                    const totalQty = lots.filter(l => l.itemName === name).reduce((sum, l) => sum + (parseInt(l.quantity)||0), 0);
                    return (
                      <option key={idx} value={name}>{name} (Total dispo: {totalQty})</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantité (Sachets)</label>
                <input 
                  type="number"
                  min="1"
                  value={exitQuantity}
                  onChange={e => setExitQuantity(parseInt(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              {exitItemName && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-2">
                  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Lots qui seront impactés
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    {(() => {
                      const matching = lots.filter(l => l.itemName === exitItemName);
                      let remain = exitQuantity;
                      const impacted = [];
                      for (const lot of matching) {
                        if (remain <= 0) break;
                        const qty = parseInt(lot.quantity) || 0;
                        const take = Math.min(qty, remain);
                        impacted.push({ lotNumber: lot.lotNumber, take });
                        remain -= take;
                      }
                      return impacted.map((imp, idx) => (
                        <li key={idx} className="flex justify-between border-b border-blue-100/50 pb-1">
                          <span className="font-mono">{imp.lotNumber}</span>
                          <span className="font-bold">- {imp.take}</span>
                        </li>
                      ));
                    })()}
                  </ul>
                  {(() => {
                    const matching = lots.filter(l => l.itemName === exitItemName);
                    const total = matching.reduce((sum, l) => sum + (parseInt(l.quantity)||0), 0);
                    if (exitQuantity > total) {
                      return <p className="text-xs text-red-600 mt-2 font-bold">Stock insuffisant pour cette quantité !</p>
                    }
                    return null;
                  })()}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsExitModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !exitItemName || exitQuantity <= 0}
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? 'Validation...' : 'Valider la sortie'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
