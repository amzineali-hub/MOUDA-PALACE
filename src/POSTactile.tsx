import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, User, Utensils, Receipt, Coffee, GlassWater } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const CATEGORIES = [
  { id: 'Entrées', name: 'Entrées', icon: <Utensils size={18} /> },
  { id: 'Plats Principaux', name: 'Plats Principaux', icon: <Utensils size={18} /> },
  { id: 'Desserts', name: 'Desserts', icon: <Coffee size={18} /> },
  { id: 'Boissons', name: 'Boissons', icon: <GlassWater size={18} /> },
];

export default function POSTactile() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('Plats Principaux');
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'menu_items'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure price is a number for calculation
        numPrice: parseFloat((doc.data().price || '0').toString().replace(/[^0-9.]/g, ''))
      }));
      setMenuItems(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = menuItems.filter(item => {
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
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }).filter(item => item.qty > 0 || (item.id === id && delta > 0));
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.numPrice * item.qty), 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  const handleSendKitchen = async () => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    
    try {
      const orderId = 'CMD-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      for (const item of cart) {
        await addDoc(collection(db, 'productionTasks'), {
          orderId,
          item: item.name,
          qty: item.qty,
          status: 'À faire',
          progress: 0,
          createdAt: new Date(),
          source: 'POS',
          priority: 'Haute'
        });
      }
      showToast("Commande envoyée en cuisine !");
      setCart([]);
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'envoi en cuisine", "error");
    }
  };

  const handleCheckout = (method: string) => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    showToast(`Paiement de ${total.toFixed(2)} MAD par ${method} validé !`);
    setCart([]);
  };

  // Helper for generating colors based on category
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Entrées': return 'from-green-400 to-emerald-500 shadow-green-500/40 text-white';
      case 'Plats Principaux': return 'from-[#DDA956] to-orange-500 shadow-[#DDA956]/40 text-[#1A1A1A]';
      case 'Desserts': return 'from-pink-400 to-rose-500 shadow-rose-500/40 text-white';
      case 'Boissons': return 'from-blue-400 to-indigo-500 shadow-blue-500/40 text-white';
      default: return 'from-gray-700 to-gray-900 shadow-gray-900/40 text-white';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-hidden bg-[#F4F4F5]">
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left Side - Menu Area */}
        <div className="flex-1 flex flex-col min-h-[60vh] lg:min-h-0">
          {/* Header & Categories */}
          <div className="p-6 bg-[#F4F4F5] z-10 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] tracking-tight">Caisse Tactile</h1>
                <p className="text-gray-500 mt-1">Terminal de point de vente 3D synchronisé</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un plat..." 
                  className="w-full pl-12 pr-4 py-3 bg-white border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DDA956] text-gray-700 font-medium transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 transform ${
                    activeCategory === cat.id && !searchQuery
                      ? 'bg-[#1A1A1A] text-white shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.2)] -translate-y-1' 
                      : 'bg-white text-gray-500 hover:text-gray-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03),inset_0_-2px_0_rgba(0,0,0,0.05)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none'
                  }`}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-400">Chargement du menu...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map(item => {
                    const colorClass = getCategoryColor(item.category);
                    const textColor = colorClass.includes('text-white') ? 'text-white/90' : 'text-[#1A1A1A]/80';
                    const priceColor = colorClass.includes('text-white') ? 'text-white' : 'text-[#1A1A1A]';
                    
                    return (
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95, y: 0, boxShadow: "none" }}
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className={`relative overflow-hidden flex flex-col h-40 rounded-3xl p-5 text-left bg-gradient-to-br ${colorClass} shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-4px_0_rgba(0,0,0,0.1)] transition-all`}
                      >
                        {/* 3D Inner Glow / Highlights */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none rounded-3xl" />
                        
                        {item.imageUrl && (
                          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full overflow-hidden opacity-30 mix-blend-overlay">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        <span className={`font-bold text-xl leading-tight z-10 flex-1 ${priceColor} drop-shadow-sm`}>{item.name}</span>
                        <div className="mt-auto">
                          <span className={`font-black text-2xl z-10 ${priceColor} drop-shadow-md`}>{item.numPrice}</span>
                          <span className={`font-bold text-sm ml-1 ${textColor}`}>MAD</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
                {filteredItems.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-400 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                    Aucun plat trouvé dans cette catégorie.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Ticket / Cart Area */}
        <div className="w-full lg:w-[400px] bg-white flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-20 lg:m-4 mt-4 lg:mt-4 rounded-t-3xl lg:rounded-3xl overflow-hidden border border-gray-100 flex-shrink-0 min-h-[500px] lg:min-h-0">
          {/* Ticket Header */}
          <div className="p-6 bg-white flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DDA956]/20 flex items-center justify-center text-[#DDA956]">
                <Receipt size={20} />
              </div>
              <h2 className="font-bold text-[#1A1A1A] text-xl">Ticket</h2>
            </div>
            <button 
              className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 hover:shadow-inner transition-all"
            >
              <User size={16} />
              {selectedTable ? selectedTable : "Table"}
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                <Utensils size={64} className="opacity-20" />
                <p className="font-medium text-gray-400">Le ticket est vide</p>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                    key={item.id}
                    className="flex justify-between items-center bg-white p-4 mb-2 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50"
                  >
                    <div className="flex-1 pr-3">
                      <h4 className="font-bold text-[#1A1A1A] leading-tight text-[15px] mb-1 line-clamp-2">{item.name}</h4>
                      <div className="text-[#DDA956] font-black text-sm">{item.numPrice * item.qty} MAD</div>
                    </div>
                    
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 shadow-inner">
                      <button 
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)] text-gray-600 hover:text-red-500 transition-colors active:scale-90"
                      >
                        {item.qty === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                      </button>
                      <span className="w-6 text-center font-bold text-[#1A1A1A]">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)] text-gray-600 hover:text-green-500 transition-colors active:scale-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Ticket Footer / Checkout */}
          <div className="bg-white p-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10 relative">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>TVA (10%)</span>
                <span>{tax.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-[#1A1A1A] font-black text-3xl tracking-tight">{total.toFixed(2)} <span className="text-lg text-gray-500">MAD</span></span>
              </div>
            </div>

            <button 
              onClick={handleSendKitchen}
              className="w-full py-4 bg-gray-100 text-gray-800 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-none mb-3"
            >
              <Utensils size={20} />
              Envoyer en Cuisine
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleCheckout('Espèces')}
                className="py-4 bg-emerald-500 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-emerald-600 transition-all shadow-[0_6px_15px_-5px_rgba(16,185,129,0.5),inset_0_-3px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[inset_0_3px_0_rgba(0,0,0,0.2)]"
              >
                <Banknote size={24} />
                <span className="text-sm">Espèces</span>
              </button>
              <button 
                onClick={() => handleCheckout('Carte Bancaire')}
                className="py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-black transition-all shadow-[0_6px_15px_-5px_rgba(0,0,0,0.4),inset_0_-3px_0_rgba(255,255,255,0.2)] active:translate-y-1 active:shadow-[inset_0_3px_0_rgba(0,0,0,0.5)]"
              >
                <CreditCard size={24} />
                <span className="text-sm">Carte B.</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
