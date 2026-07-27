import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, User, Utensils, Receipt, Coffee, GlassWater, X } from 'lucide-react';
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

  const handleClearCart = () => {
    if (cart.length > 0) {
      setCart([]);
      showToast("Ticket annulé");
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    
    try {
      await addDoc(collection(db, 'menu_items'), {
        name: newItemName,
        price: `${newItemPrice} MAD`,
        category: activeCategory,
        active: true,
        desc: ''
      });
      showToast('Article ajouté avec succès');
      setIsAddModalOpen(false);
      setNewItemName('');
      setNewItemPrice('');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de l\'ajout', 'error');
    }
  };

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

  useEffect(() => {
    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      setTables(snapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() })));
    });
    return () => unsubTables();
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
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(item => item.qty > 0);
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
    <div className="flex flex-col h-full min-h-screen lg:h-screen lg:overflow-hidden bg-[#F4F4F5]">
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                <AnimatePresence mode="popLayout">
                  {/* Bouton d'ajout */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddModalOpen(true)}
                    className="relative overflow-hidden flex flex-col justify-center items-center aspect-square rounded-2xl sm:rounded-3xl p-2 sm:p-4 border-2 border-dashed border-gray-300 text-gray-400 hover:text-[#DDA956] hover:border-[#DDA956] hover:bg-[#DDA956]/5 transition-all"
                  >
                    <Plus size={32} className="mb-2" />
                    <span className="font-bold text-sm">Ajouter un article</span>
                  </motion.button>
                  
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
                        className={`relative overflow-hidden flex flex-col justify-between aspect-square rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-left bg-gradient-to-br ${colorClass} shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-3px_0_rgba(0,0,0,0.1)] transition-all`}
                      >
                        {/* 3D Inner Glow / Highlights */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none rounded-3xl" />
                        
                        {item.imageUrl && (
                          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full overflow-hidden opacity-30 mix-blend-overlay">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        <span className={`font-bold text-sm sm:text-lg leading-tight z-10 flex-1 ${priceColor} drop-shadow-sm break-words line-clamp-3`}>{item.name}</span>
                        <div className="mt-auto flex flex-wrap items-baseline">
                          <span className={`font-black text-lg sm:text-2xl z-10 ${priceColor} drop-shadow-md`}>{item.numPrice}</span>
                          <span className={`font-bold text-[10px] sm:text-xs ml-1 ${textColor}`}>MAD</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
                {false && filteredItems.length === 0 && (
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
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button 
                  onClick={handleClearCart}
                  className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Annuler le ticket"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button 
                onClick={() => setIsTableModalOpen(true)}
                className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 hover:shadow-inner transition-all"
              >
                <User size={16} />
                {selectedTable ? selectedTable : "Table"}
              </button>
            </div>
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

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Nouvel Article</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'article</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ex: Coca-Cola" 
                  required 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
                <input 
                  type="number" 
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="Ex: 25" 
                  required 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white"
                />
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#DDA956] text-[#1A1A1A] rounded-xl font-bold hover:bg-[#cda25b] transition-colors"
                >
                  Ajouter dans {activeCategory}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}


      {/* Table Selection Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Sélectionner une table</h2>
              <button 
                onClick={() => setIsTableModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
                {tables.map((table) => (
                  <button
                    key={table.id || table.fbId}
                    onClick={() => {
                      setSelectedTable(table.id);
                      setIsTableModalOpen(false);
                    }}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-bold transition-all ${selectedTable === table.id ? 'bg-[#DDA956] text-[#1A1A1A] shadow-md scale-105 border-2 border-[#DDA956]' : 'bg-white text-gray-700 border-2 border-gray-100 hover:bg-gray-50'}`}
                  >
                    <span className="text-xl mb-1">{table.id}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${table.status === 'libre' ? 'bg-green-100 text-green-700' : table.status === 'occupee' ? 'bg-red-100 text-red-700' : table.status === 'reservee' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                      {table.status === 'libre' ? 'Libre' : table.status === 'occupee' ? 'Occupée' : table.status === 'reservee' ? 'Réservée' : table.status}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-6">
                <button
                  onClick={() => {
                    setSelectedTable('À emporter');
                    setIsTableModalOpen(false);
                  }}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedTable === 'À emporter' ? 'bg-[#DDA956] text-[#1A1A1A] shadow-md' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                >
                  À emporter (Takeaway)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
