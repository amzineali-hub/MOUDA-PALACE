import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useToast } from './context/ToastContext';
import { motion } from 'framer-motion';
import { Search, Plus, Maximize, User, Clock, Utensils, CalendarDays, MoreHorizontal, X, Circle, Square, RectangleHorizontal, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function GestionTables({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [activeZone, setActiveZone] = useState('patio');
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTable, setNewTable] = useState({ id: '', capacity: 2, shape: 'carre' });

  const [tables, setTables] = useState<any[]>([
    { id: 'T1', capacity: 2, status: 'occupee', shape: 'rond', zone: 'patio' },
    { id: 'T2', capacity: 2, status: 'libre', shape: 'rond', zone: 'patio' },
    { id: 'T3', capacity: 4, status: 'reservee', shape: 'carre', zone: 'patio' },
    { id: 'T4', capacity: 4, status: 'libre', shape: 'carre', zone: 'patio' },
    { id: 'T5', capacity: 6, status: 'libre', shape: 'rectangle', zone: 'patio' },
    { id: 'T6', capacity: 2, status: 'libre', shape: 'rond', zone: 'terrasse' },
    { id: 'T7', capacity: 8, status: 'libre', shape: 'rectangle', zone: 'terrasse' },
    { id: 'T8', capacity: 4, status: 'libre', shape: 'carre', zone: 'salon' },
    { id: 'T9', capacity: 4, status: 'occupee', shape: 'carre', zone: 'salon' }
  ]);
  const [loading, setLoading] = useState(true);

  const zones = [
    { id: 'patio', name: 'Le Patio Central' },
    { id: 'terrasse', name: 'Terrasse Panoramique' },
    { id: 'salon', name: 'Salon VIP' },
  ].map(z => {
    const zoneTables = tables.filter(t => t.zone === z.id);
    return {
      ...z,
      tables: zoneTables.length,
      capacity: zoneTables.reduce((acc, t) => acc + (t.capacity || 0), 0)
    };
  });

  const { showToast } = useToast();
  
  useEffect(() => {
    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      const fbTables = snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id }));
      if (fbTables.length > 0) {
        setTables(fbTables);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tables", error);
      showToast("Erreur lors de la récupération des tables");
      setLoading(false);
    });

    return () => {
      unsubTables();
    };
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const tableId = newTable.id.trim().toUpperCase();
    if (!tableId) return showToast("Veuillez saisir un identifiant pour la table");
    if (tables.some(table => String(table.id || '').trim().toUpperCase() === tableId)) {
      return showToast("Cet identifiant de table existe déjà", "error");
    }
    
    try {
      await addDoc(collection(db, 'tables'), {
        id: tableId,
        zone: activeZone,
        capacity: newTable.capacity,
        shape: newTable.shape,
        status: 'libre',
        currentPax: 0,
        time: null,
        reservation: null,
        createdAt: serverTimestamp()
      });
      showToast("Nouvelle table ajoutée avec succès");
      setIsAddingTable(false);
      setNewTable({ id: '', capacity: 2, shape: 'carre' });
    } catch (err) {
      console.error("Error adding table", err);
      showToast("Erreur lors de l'ajout de la table");
    }
  };


  const handleUpdateStatus = async (fbId: string, newStatus: string) => {
    if (!fbId) {
      showToast("Cette table n'est pas synchronisée", "error");
      return;
    }
    try {
      await updateDoc(doc(db, 'tables', fbId), { status: newStatus, updatedAt: serverTimestamp() });
      showToast("Statut de la table mis à jour");
    } catch (err) {
      console.error("Error updating table", err);
      showToast("Erreur lors de la mise à jour");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupee': return 'bg-red-50 border-red-200 text-red-700';
      case 'reservee': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'nettoyage': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'libre': 
      default: return 'bg-green-50 border-green-200 text-green-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupee': return 'Occupée';
      case 'reservee': return 'Réservée';
      case 'nettoyage': return 'En nettoyage';
      case 'libre': return 'Libre';
      default: return status;
    }
  };

  const filteredTables = tables.filter(t => t.zone === activeZone);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-1">Gestion de Salle & Tables</h1>
          <p className="text-gray-500">Visualisez et gérez l'occupation de vos zones de restauration en temps réel.</p>
        </div>
        
        <div className="flex items-center gap-3">
          
          <button onClick={() => setIsAddingTable(true)} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Plus size={18} />
            <span>Nouvelle Table</span>
          </button>
          <button onClick={() => { setActiveTab?.("reservations"); sessionStorage.setItem("open-calendar", "true"); }} className="flex items-center gap-2 bg-white border border-gray-200 text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">

            <CalendarDays size={18} />
            <span>Planifier</span>
          </button>
          <button onClick={() => { setActiveTab?.("reservations"); sessionStorage.setItem("open-floorplan", "true"); }} className="flex items-center gap-2 bg-[#F4C75B] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-[#C89845] transition-colors shadow-sm">
            <Maximize size={18} />
            <span>Plan de salle 2D</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {zones.map(zone => (
          <button
            key={zone.id}
            onClick={() => setActiveZone(zone.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeZone === zone.id 
                ? 'bg-[#1A1A1A] border-[#1A1A1A] shadow-md shadow-[#1A1A1A]/10' 
                : 'bg-white border-gray-200 hover:border-[#F4C75B]'
            }`}
          >
            <h3 className={`font-medium mb-1 ${activeZone === zone.id ? 'text-[#F4C75B]' : 'text-[#1A1A1A]'}`}>
              {zone.name}
            </h3>
            <div className={`flex justify-between items-center text-sm ${activeZone === zone.id ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="flex items-center gap-1"><Utensils size={14} /> {zone.tables} tables</span>
              <span className="flex items-center gap-1"><User size={14} /> {zone.capacity} pax</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
            Vue Détaillée : {zones.find(z => z.id === activeZone)?.name}
          </h2>
          
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Libre</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Réservée</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Occupée</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Nettoyage</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
          {filteredTables.map(table => (
            <motion.div 
              key={table.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`border-2 rounded-xl p-3 flex flex-col min-h-24 relative transition-all hover:shadow-md ${getStatusColor(table.status)}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  {table.shape === 'rond' && <Circle size={18} className="text-current opacity-70" />}
                  {table.shape === 'rectangle' && <RectangleHorizontal size={18} className="text-current opacity-70" />}
                  {(!table.shape || table.shape === 'carre') && <Square size={18} className="text-current opacity-70" />}
                  <span className="text-lg font-bold">{table.id}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    if (!table.fbId) {
                      showToast("Cette table n'est pas synchronisée", "error");
                      return;
                    }
                    if (table.status === 'occupee' || table.status === 'reservee') {
                      showToast("Libérez ou transférez cette table avant suppression", "error");
                      return;
                    }
                    if (window.confirm(`Voulez-vous vraiment supprimer la table ${table.id} ?`)) {
                      deleteDoc(doc(db, 'tables', table.fbId)).then(() => showToast('Table supprimée')).catch(() => showToast('Erreur lors de la suppression', 'error'));
                    }
                  }}
                  className="text-current opacity-50 hover:opacity-100 hover:text-red-600 transition-colors"
                  title="Supprimer la table"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <select
                value={table.status}
                onChange={(e) => {
                  if (table.fbId) {
                    handleUpdateStatus(table.fbId, e.target.value);
                  } else {
                    showToast("Cette table n'est pas encore synchronisée avec la base de données", "error");
                  }
                }}
                className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-70 bg-transparent border-none outline-none cursor-pointer hover:opacity-100 -ml-1"
              >
                <option value="libre">{getStatusLabel('libre')}</option>
                <option value="reservee">{getStatusLabel('reservee')}</option>
                <option value="occupee">{getStatusLabel('occupee')}</option>
                <option value="nettoyage">{getStatusLabel('nettoyage')}</option>
              </select>

              {table.reservation && (
                <div className="mt-2 text-sm font-medium flex items-center gap-1 truncate">
                  <User size={14} />
                  {table.reservation}
                </div>
              )}

              <div className="flex justify-between items-end mt-auto pt-2 border-t border-current border-opacity-20">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <User size={14} />
                  {table.currentPax > 0 ? `${table.currentPax}/${table.capacity}` : table.capacity}
                </div>
                {table.time && (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Clock size={14} />
                    {table.time}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal d'ajout de table */}
      <AnimatePresence>
        {isAddingTable && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-[#1A1A1A]">Ajouter une table ({zones.find(z => z.id === activeZone)?.name})</h3>
                <button onClick={() => setIsAddingTable(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddTable} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant (ex: T10)</label>
                  <input 
                    type="text" 
                    value={newTable.id}
                    onChange={(e) => setNewTable({...newTable, id: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all"
                    placeholder="Numéro ou nom de table"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (Pax)</label>
                  <input 
                    type="number" 
                    min="1"
                    max="20"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value) || 2})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forme de la table</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      type="button"
                      onClick={() => setNewTable({...newTable, shape: 'carre'})}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${newTable.shape === 'carre' ? 'border-[#F4C75B] bg-orange-50 text-[#F4C75B]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                      <Square size={24} className="mb-1" />
                      <span className="text-xs font-medium">Carré</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewTable({...newTable, shape: 'rond'})}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${newTable.shape === 'rond' ? 'border-[#F4C75B] bg-orange-50 text-[#F4C75B]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                      <Circle size={24} className="mb-1" />
                      <span className="text-xs font-medium">Rond</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewTable({...newTable, shape: 'rectangle'})}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${newTable.shape === 'rectangle' ? 'border-[#F4C75B] bg-orange-50 text-[#F4C75B]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                      <RectangleHorizontal size={24} className="mb-1" />
                      <span className="text-xs font-medium">Rectangle</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingTable(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 rounded-xl bg-[#1A1A1A] text-white font-medium hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Créer la table
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

}
