import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, User, Utensils, Receipt, Check, Coffee, GlassWater } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Dummy menu data
const MENU_CATEGORIES = [
  { id: 'entrees', name: 'Entrées', icon: <Utensils size={18} /> },
  { id: 'plats', name: 'Plats Principaux', icon: <Utensils size={18} /> },
  { id: 'desserts', name: 'Desserts', icon: <Coffee size={18} /> },
  { id: 'boissons', name: 'Boissons', icon: <GlassWater size={18} /> },
];

const MENU_ITEMS = [
  { id: 'm1', category: 'entrees', name: 'Salade Marocaine', price: 65, color: 'bg-green-100 text-green-800' },
  { id: 'm2', category: 'entrees', name: 'Briouates Fromage', price: 85, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'm3', category: 'entrees', name: 'Harira', price: 75, color: 'bg-orange-100 text-orange-800' },
  { id: 'm4', category: 'plats', name: 'Tajine Poulet Citron', price: 160, color: 'bg-amber-100 text-amber-800' },
  { id: 'm5', category: 'plats', name: 'Couscous Royal', price: 210, color: 'bg-red-100 text-red-800' },
  { id: 'm6', category: 'plats', name: 'Pastilla Fruits de Mer', price: 240, color: 'bg-blue-100 text-blue-800' },
  { id: 'm7', category: 'plats', name: 'Tangia Marrakchia', price: 190, color: 'bg-orange-100 text-orange-800' },
  { id: 'm8', category: 'desserts', name: 'Pastilla au Lait', price: 90, color: 'bg-purple-100 text-purple-800' },
  { id: 'm9', category: 'desserts', name: 'Salade d\'Oranges', price: 60, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'm10', category: 'desserts', name: 'Corne de Gazelle', price: 45, color: 'bg-amber-100 text-amber-800' },
  { id: 'm11', category: 'boissons', name: 'Thé à la Menthe', price: 35, color: 'bg-emerald-100 text-emerald-800' },
  { id: 'm12', category: 'boissons', name: 'Jus d\'Orange Frais', price: 40, color: 'bg-orange-100 text-orange-800' },
  { id: 'm13', category: 'boissons', name: 'Eau Minérale (1L)', price: 25, color: 'bg-blue-100 text-blue-800' },
  { id: 'm14', category: 'boissons', name: 'Café Noir', price: 30, color: 'bg-stone-100 text-stone-800' },
];

export default function POSTactile() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('plats');
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const filteredItems = MENU_ITEMS.filter(item => {
    if (searchQuery) return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return item.category === activeCategory;
  });

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.id === id) {
          const newQty = i.qty + delta;
          return newQty > 0 ? { ...i, qty: newQty } : i;
        }
        return i;
      }).filter(i => i.qty > 0);
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.10; // 10% TVA
  const total = subtotal + tax;

  const handleCheckout = (method: string) => {
    if (cart.length === 0) return showToast("Le panier est vide");
    showToast(`Paiement de ${total.toFixed(2)} MAD validé via ${method}`);
    setCart([]);
    setSelectedTable(null);
  };

  const handleSendKitchen = async () => {
    if (cart.length === 0) return showToast("Le panier est vide");
    
    try {
      for (const item of cart) {
        if (item.category !== 'boissons') {
          const orderId = 'CMD-' + Math.floor(Math.random() * 10000);
          await addDoc(collection(db, 'productionTasks'), {
            orderId: orderId,
            item: item.name,
            qty: item.qty,
            priority: 'Moyenne',
            progress: 0,
            status: 'À faire',
            createdAt: serverTimestamp()
          });
          
          await addDoc(collection(db, 'inventoryTransactions'), {
            item: item.name,
            type: 'out',
            amount: item.qty,
            unit: 'portion(s)',
            reason: 'Production commande client',
            date: new Date().toLocaleString('fr-FR'),
            user: 'Caisse POS',
            createdAt: serverTimestamp()
          });
        }
      }
      showToast("Bon envoyé en cuisine et stock déduit automatiquement !");
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'envoi en cuisine", "error");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Menu Area */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-[#FDFBF7]">
          {/* Header & Categories */}
          <div className="p-4 bg-white border-b border-gray-200 shadow-sm z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Caisse Tactile</h1>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un plat..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DDA956]"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {MENU_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.id && !searchQuery
                      ? 'bg-[#1A1A1A] text-white shadow-md' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map(item => (
                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="flex flex-col bg-white border border-gray-200 rounded-2xl p-4 h-32 hover:border-[#DDA956] hover:shadow-md transition-all active:scale-95 text-left relative overflow-hidden group"
                  >
                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 ${item.color.split(' ')[0]} group-hover:scale-150 transition-transform duration-500`} />
                    <span className="font-semibold text-[#1A1A1A] leading-tight z-10 flex-1">{item.name}</span>
                    <span className="font-bold text-[#DDA956] text-lg z-10">{item.price} MAD</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side - Ticket / Cart Area */}
        <div className="w-96 bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20">
          {/* Ticket Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Receipt className="text-[#DDA956]" size={20} />
              <h2 className="font-bold text-[#1A1A1A] text-lg">Ticket Actuel</h2>
            </div>
            <button 
              className="flex items-center gap-1 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User size={14} />
              {selectedTable ? selectedTable : "Table..."}
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                <Utensils size={48} className="opacity-20" />
                <p>Aucun article sélectionné</p>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={item.id}
                    className="flex justify-between items-start border-b border-gray-100 pb-3"
                  >
                    <div className="flex-1 pr-2">
                      <h4 className="font-medium text-[#1A1A1A] leading-tight text-sm mb-1">{item.name}</h4>
                      <div className="text-[#DDA956] font-semibold text-sm">{item.price} MAD</div>
                    </div>
                    
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-2">
                      <button 
                        onClick={() => updateQty(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-red-500"
                      >
                        {item.qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                      </button>
                      <span className="w-4 text-center font-medium text-sm">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-green-500"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Ticket Footer / Checkout */}
          <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>TVA (10%)</span>
                <span>{tax.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-[#1A1A1A] font-bold text-xl pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-[#DDA956]">{total.toFixed(2)} MAD</span>
              </div>
            </div>

            <button 
              onClick={handleSendKitchen}
              className="w-full py-3 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Utensils size={18} />
              Envoyer en Cuisine
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleCheckout('Espèces')}
                className="py-3 bg-emerald-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-emerald-700 transition-colors"
              >
                <Banknote size={20} />
                <span className="text-xs font-medium">Espèces</span>
              </button>
              <button 
                onClick={() => handleCheckout('Carte Bancaire')}
                className="py-3 bg-[#1A1A1A] text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-gray-800 transition-colors"
              >
                <CreditCard size={20} />
                <span className="text-xs font-medium">Carte B.</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
