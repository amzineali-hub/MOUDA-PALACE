import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useToast } from './context/ToastContext';
import { motion } from 'framer-motion';
import { Search, Plus, Maximize, User, Clock, Utensils, CalendarDays, MoreHorizontal } from 'lucide-react';

export default function GestionTables() {
  const [activeZone, setActiveZone] = useState('patio');

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
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      setTables(snapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() })));
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
  
  const handleUpdateStatus = async (fbId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'tables', fbId), { status: newStatus });
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
          <h1 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Gestion de Salle & Tables</h1>
          <p className="text-gray-500">Visualisez et gérez l'occupation de vos zones de restauration en temps réel.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <CalendarDays size={18} />
            <span>Planifier</span>
          </button>
          <button className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-[#C89845] transition-colors shadow-sm">
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
                : 'bg-white border-gray-200 hover:border-[#DDA956]'
            }`}
          >
            <h3 className={`font-medium mb-1 ${activeZone === zone.id ? 'text-[#DDA956]' : 'text-[#1A1A1A]'}`}>
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
              className={`border-2 rounded-xl p-4 flex flex-col h-40 relative transition-all hover:shadow-md ${getStatusColor(table.status)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xl font-bold">{table.id}</span>
                <button className="text-current opacity-50 hover:opacity-100 transition-opacity">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <div className="text-xs font-medium uppercase tracking-wider opacity-70 mb-auto">
                {getStatusLabel(table.status)}
              </div>

              {table.reservation && (
                <div className="mt-2 text-sm font-medium flex items-center gap-1 truncate">
                  <User size={14} />
                  {table.reservation}
                </div>
              )}

              <div className="flex justify-between items-end mt-2 pt-2 border-t border-current border-opacity-20">
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
    </div>
  );
}
