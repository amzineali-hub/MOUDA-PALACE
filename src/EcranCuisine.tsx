import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Utensils, AlertCircle } from 'lucide-react';
import { useToast } from './context/ToastContext';

export default function EcranCuisine() {
  const [tasks, setTasks] = useState<any[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'productionTasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'À faire' ? 'En cours' : 'Terminé';
    try {
      await updateDoc(doc(db, 'productionTasks', id), {
        status: nextStatus,
        progress: nextStatus === 'En cours' ? 50 : 100
      });
      if (nextStatus === 'Terminé') {
        showToast("Plat marqué comme terminé !");
      }
    } catch (e) {
      console.error(e);
      showToast("Erreur de mise à jour", "error");
    }
  };

  const aFaire = tasks.filter(t => t.status === 'À faire');
  const enCours = tasks.filter(t => t.status === 'En cours');
  const termines = tasks.filter(t => t.status === 'Terminé').slice(0, 5); // Show only last 5

  const TaskCard = ({ task }: { task: any }) => (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`p-4 rounded-xl shadow-sm border-l-4 bg-white \${
        task.status === 'À faire' ? 'border-red-500' :
        task.status === 'En cours' ? 'border-blue-500' : 'border-green-500'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {task.orderId || 'CMD-???'}
          </span>
        </div>
        <div className="text-sm font-medium text-gray-400 flex items-center gap-1">
          <Clock size={14} />
          {task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 font-bold text-lg px-3 py-1 rounded-lg">
          {task.qty}x
        </div>
        <div className="text-lg font-bold text-[#1A1A1A]">
          {task.item}
        </div>
      </div>

      {task.status !== 'Terminé' && (
        <button 
          onClick={() => updateStatus(task.id, task.status)}
          className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors \${
            task.status === 'À faire' 
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          {task.status === 'À faire' ? (
            <>
              <Utensils size={18} /> Commencer
            </>
          ) : (
            <>
              <Check size={18} /> Terminer
            </>
          )}
        </button>
      )}
    </motion.div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 h-full lg:overflow-hidden overflow-y-auto flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Écran Cuisine (KDS)</h2>
          <p className="text-gray-500">Gestion des bons de commande en temps réel</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-gray-700">{aFaire.length} En attente</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 lg:overflow-hidden">
        {/* À FAIRE */}
        <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
            <h3 className="font-bold text-red-800 flex items-center gap-2">
              <AlertCircle size={18} /> Nouveaux Bons
            </h3>
            <span className="bg-red-200 text-red-800 font-bold px-2 py-0.5 rounded-full text-sm">{aFaire.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-gray-50/50">
            <AnimatePresence>
              {aFaire.map(task => <TaskCard key={task.id} task={task} />)}
            </AnimatePresence>
            {aFaire.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-50">
                <Check size={32} />
                <p>Aucune nouvelle commande</p>
              </div>
            )}
          </div>
        </div>

        {/* EN COURS */}
        <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
              <Utensils size={18} /> En Préparation
            </h3>
            <span className="bg-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded-full text-sm">{enCours.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-gray-50/50">
            <AnimatePresence>
              {enCours.map(task => <TaskCard key={task.id} task={task} />)}
            </AnimatePresence>
            {enCours.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-50">
                <Utensils size={32} />
                <p>Rien en préparation</p>
              </div>
            )}
          </div>
        </div>

        {/* TERMINÉ */}
        <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
            <h3 className="font-bold text-green-800 flex items-center gap-2">
              <Check size={18} /> Prêts (Récents)
            </h3>
            <span className="bg-green-200 text-green-800 font-bold px-2 py-0.5 rounded-full text-sm">{termines.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-gray-50/50">
            <AnimatePresence>
              {termines.map(task => <TaskCard key={task.id} task={task} />)}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
