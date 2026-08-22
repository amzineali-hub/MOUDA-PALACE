import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, limit } from 'firebase/firestore';
import { db } from './firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Utensils, AlertCircle } from 'lucide-react';
import { useToast } from './context/ToastContext';

export default function EcranCuisine() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'productionTasks'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, currentStatus: string) => {
    if (updatingTasks.has(id)) return;
    const nextStatus = currentStatus === 'À faire' ? 'En cours' : 'Terminé';
    const task = tasks.find(item => item.id === id);
    setUpdatingTasks(prev => new Set(prev).add(id));
    try {
      await updateDoc(doc(db, 'productionTasks', id), {
        status: nextStatus,
        progress: nextStatus === 'En cours' ? 50 : 100,
        ...(nextStatus === 'En cours' ? { startedAt: new Date() } : { completedAt: new Date() }),
        updatedAt: new Date()
      });

      if (nextStatus === 'Terminé' && task?.orderId) {
        const remainingTasks = tasks.some(item => item.orderId === task.orderId && item.id !== id && item.status !== 'Terminé');
        if (!remainingTasks) {
          await updateDoc(doc(db, 'orders', task.orderId), {
            status: 'Prête',
            kitchenStatus: 'Prête',
            updatedAt: new Date()
          }).catch(error => console.warn('Order status update skipped:', error));
        }
      }
      if (nextStatus === 'Terminé') {
        showToast("Plat marqué comme terminé !");
      }
    } catch (e) {
      console.error(e);
      showToast("Erreur de mise à jour", "error");
    } finally {
      setUpdatingTasks(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const clearDemoTasks = async () => {
    if (tasks.length === 0) {
      showToast('Aucun bon à supprimer.');
      return;
    }
    if (!window.confirm(`Supprimer les ${tasks.length} bons affichés dans l'écran cuisine ? Cette action est réservée au nettoyage des démonstrations.`)) return;

    try {
      await Promise.all(tasks.map(task => deleteDoc(doc(db, 'productionTasks', task.id))));
      showToast('Écran cuisine vidé.');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors du nettoyage des bons', 'error');
    }
  };

  const STATIONS = ['Entrées', 'Plats Principaux', 'Desserts', 'Boissons'];
  const [stationFilter, setStationFilter] = useState('Toutes');

  const visibleTasks = stationFilter === 'Toutes'
    ? tasks
    : tasks.filter(t => (t.category || 'Autres') === stationFilter);

  const aFaire = visibleTasks.filter(t => t.status === 'À faire');
  const enCours = visibleTasks.filter(t => t.status === 'En cours');
  const termines = visibleTasks.filter(t => t.status === 'Terminé').slice(0, 5); // Show only last 5

  const groupByOrder = (list: any[]) => {
    const groups: { orderId: string; items: any[] }[] = [];
    const index = new Map<string, number>();
    list.forEach(task => {
      const key = task.orderId || task.id;
      if (!index.has(key)) {
        index.set(key, groups.length);
        groups.push({ orderId: key, items: [] });
      }
      groups[index.get(key)!].items.push(task);
    });
    return groups;
  };

  const OrderGroupCard = ({ orderId, items }: { orderId: string; items: any[] }) => {
    const first = items[0];
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="rounded-xl shadow-sm border border-gray-200 bg-white overflow-hidden"
      >
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100/70 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
              {orderId || 'CMD-???'}
            </span>
            {first?.tableId && (
              <span className="text-xs font-semibold text-gray-500">{first.tableId}</span>
            )}
          </div>
          <div className="text-sm font-medium text-gray-400 flex items-center gap-1">
            <Clock size={14} />
            {first?.createdAt ? new Date(first.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {items.map(task => (
            <div key={task.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gray-100 font-bold text-lg px-3 py-1 rounded-lg">
                  {task.qty}x
                </div>
                <div className="text-lg font-bold text-[#1A1A1A] flex-1">
                  {task.item}
                </div>
                {task.category && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                    {task.category}
                  </span>
                )}
              </div>

              {task.modifiers && Object.values(task.modifiers).some(Boolean) && (
                <div className="mb-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-900">
                  {[task.modifiers.cooking, task.modifiers.extra, task.modifiers.note].filter(Boolean).join(' · ')}
                </div>
              )}

              {task.status !== 'Terminé' && (
                <button
                  onClick={() => updateStatus(task.id, task.status)}
                  disabled={updatingTasks.has(task.id)}
                  className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-150 active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 disabled:cursor-wait ${
                    task.status === 'À faire'
                      ? 'bg-blue-500 text-white shadow-[0_4px_0_0_#1d4ed8] hover:brightness-110'
                      : 'bg-green-500 text-white shadow-[0_4px_0_0_#15803d] hover:brightness-110'
                  }`}
                >
                  {task.status === 'À faire' ? (
                    <>
                      <Utensils size={16} /> Commencer
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Terminer
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 h-full lg:overflow-hidden overflow-y-auto flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Écran Cuisine (KDS)</h2>
          <p className="text-gray-500">Gestion des bons de commande en temps réel</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            type="button"
            onClick={clearDemoTasks}
            disabled={tasks.length === 0}
            className="px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold shadow-[0_4px_0_0_#b91c1c] hover:brightness-110 transition-all duration-150 active:shadow-none active:translate-y-1 disabled:opacity-40 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
          >
            Vider les démonstrations
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-gray-700">{aFaire.length} En attente</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {['Toutes', ...STATIONS].map(station => (
          <button
            key={station}
            type="button"
            onClick={() => setStationFilter(station)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 active:shadow-none active:translate-y-1 ${
              stationFilter === station
                ? 'bg-[#265C6D] text-white shadow-[0_3px_0_0_#173840]'
                : 'bg-white text-gray-600 shadow-[0_3px_0_0_#d1d5db] hover:brightness-105'
            }`}
          >
            {station}
          </button>
        ))}
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
              {groupByOrder(aFaire).map(group => <OrderGroupCard key={group.orderId} orderId={group.orderId} items={group.items} />)}
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
              {groupByOrder(enCours).map(group => <OrderGroupCard key={group.orderId} orderId={group.orderId} items={group.items} />)}
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
              {groupByOrder(termines).map(group => <OrderGroupCard key={group.orderId} orderId={group.orderId} items={group.items} />)}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
