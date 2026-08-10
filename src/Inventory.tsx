import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Plus, Trash2, Edit, Search, AlertTriangle, CalendarClock, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductionJournaliere from './ProductionJournaliere';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('stocks');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-gradient-to-r from-[#265C6D] to-[#2F6B7F] flex overflow-x-auto hide-scrollbar p-2 gap-2 shrink-0">
        {['stocks', 'production_orders', 'semi_finished', 'waste', 'transactions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab ? 'bg-[#F4C75B]/20 text-[#F4C75B]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            {tab === 'stocks' && 'Inventaires Actuels'}
            {tab === 'production_orders' && 'Ordre de fabrication'}
            {tab === 'semi_finished' && 'Plats Semi-finis'}
            {tab === 'waste' && 'Pertes & Gaspillage'}
            {tab === 'transactions' && 'Entrées & Sorties'}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'production_orders' && (
          <ProductionJournaliere />
        )}

        {activeTab === 'stocks' && (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-serif text-[#265C6D]">État des Stocks</h1>
              <button className="bg-[#F4C75B] text-[#265C6D] px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#E5B745] transition-colors">
                <Plus size={18} /> Nouveau Produit
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-medium">Produit</th>
                    <th className="p-4 font-medium">Catégorie</th>
                    <th className="p-4 font-medium">Quantité</th>
                    <th className="p-4 font-medium">Unité</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{item.name || item.nom}</td>
                      <td className="p-4 text-gray-600">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs">
                          {item.category || item.categorie || 'Non classé'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900 font-semibold">{item.quantity || item.quantite}</td>
                      <td className="p-4 text-gray-500">{item.unit || item.unite}</td>
                      <td className="p-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-[#265C6D] transition-colors">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteDoc(doc(db, 'inventoryItems', item.id))}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-500">
                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p>Aucun produit en stock</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab !== 'stocks' && activeTab !== 'production_orders' && (
          <div className="p-12 text-center text-gray-500">
            <p>Module en cours de développement</p>
          </div>
        )}
      </div>
    </div>
  );
}
