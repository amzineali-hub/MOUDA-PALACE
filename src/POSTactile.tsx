import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, User, Utensils, Receipt, Coffee, GlassWater, X } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, query, addDoc, getDocs, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
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
  const [recettes, setRecettes] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState<string>('');
  const [isManualName, setIsManualName] = useState(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState<any>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  
  
  const handleNameChange = (val: string) => {
    setNewItemName(val);
    const matchedRecette = recettes.find(r => r.nom === val);
    if (matchedRecette) {
      if (matchedRecette.prixVente) {
        setNewItemPrice(String(matchedRecette.prixVente));
      } else if (matchedRecette.prix) {
        setNewItemPrice(String(matchedRecette.prix));
      } else if (matchedRecette.coutMatiere) {
        setNewItemPrice(String(Math.round(matchedRecette.coutMatiere * 1.3)));
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setNewItemImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    
    try {
      const itemData: any = {
        name: newItemName,
        price: `${newItemPrice} MAD`,
        category: activeCategory,
        active: true,
        desc: ''
      };
      
      if (newItemImage) {
        itemData.imageUrl = newItemImage;
      }
      
      await addDoc(collection(db, 'menu_items'), itemData);
      
      showToast('Article ajouté avec succès');
      setIsAddModalOpen(false);
      setIsManualName(false);
      setIsPhotoGalleryOpen(false);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemImage('');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de l\'ajout', 'error');
    }
  };

  
  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Voulez-vous vraiment supprimer cet article du menu ?')) return;
    try {
      await deleteDoc(doc(db, 'menu_items', id));
      showToast('Article supprimé avec succès');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'menu_items'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
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
      setTables(snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id })));
    });
    const unsubRecettes = onSnapshot(query(collection(db, 'fiches_techniques')), (snapshot) => {
      setRecettes(snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id })));
    });
    const unsubInventory = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsubTables(); unsubRecettes(); unsubInventory(); };
  }, []);

  const normalizeString = (str: string) => {
    return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredItems = (() => {
    if (searchQuery) {
      const q = normalizeString(searchQuery);
      
      const matchedMenu = menuItems.filter(item => normalizeString(item.name).includes(q));
      
      const menuNames = new Set(matchedMenu.map(m => normalizeString(m.name)));
      
      const matchedRecettes = recettes.filter(r => {
        const nom = normalizeString(r.nom);
        return nom.includes(q) && !menuNames.has(nom);
      });
      
      const additionalItems = matchedRecettes.map(r => ({
        id: 'recette-' + (r.id || r.fbId || Math.random().toString()),
        name: r.nom,
        category: r.categorie || 'Autres',
        price: (r.prixVente || r.coutTotal || '0') + ' MAD',
        numPrice: parseFloat((r.prixVente || r.coutTotal || '0').toString().replace(/[^0-9.]/g, '')),
        imageUrl: r.photo || r.image || ''
      }));
      
      const combinedNames = new Set([
        ...matchedMenu.map(m => normalizeString(m.name)),
        ...matchedRecettes.map(r => normalizeString(r.nom))
      ]);
      
      const matchedInventory = inventoryItems.filter(i => {
        const nom = normalizeString(i.name);
        return nom.includes(q) && !combinedNames.has(nom);
      });
      
      const additionalInventory = matchedInventory.map(i => ({
        id: 'inv-' + (i.id || Math.random().toString()),
        name: i.name,
        category: i.category || 'Autres',
        price: '0 MAD',
        numPrice: 0,
        imageUrl: ''
      }));

      return [...matchedMenu, ...additionalItems, ...additionalInventory];
    }
    return menuItems.filter(item => item.category === activeCategory);
  })();

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

  const subtotal = cart.reduce((sum, item) => sum + ((Number.isNaN(item.numPrice) ? 0 : (item.numPrice || 0)) * (item.qty || 1)), 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  const handleSendKitchen = async () => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    
    try {
      showToast("Envoi en cuisine...", "success");
      const orderId = 'CMD-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      for (const item of cart) {
        await addDoc(collection(db, 'productionTasks'), {
          orderId,
          item: item.name || 'Inconnu',
          qty: item.qty || 1,
          status: 'À faire',
          progress: 0,
          createdAt: new Date(),
          source: 'POS',
          priority: 'Haute'
        });
      }
      showToast("Commande envoyée en cuisine !", "success");
      setCart([]);
    } catch (e: any) {
      console.error(e);
      alert("Erreur cuisine: " + e.message);
      showToast("Erreur lors de l'envoi en cuisine", "error");
    }
  };

  const handleCheckout = async (method: string) => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    
    try {
      const displayId = 'TKT-' + Date.now().toString().slice(-6);
      const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      const now = new Date();
      
      // 1. Ajouter aux recettes caisses
      await addDoc(collection(db, 'cash_receipts'), {
        displayId,
        amount: total,
        method: method,
        items: cart.map(item => ({ name: item.name || 'Inconnu', qty: item.qty || 1, price: item.price || 0 })),
        date: today,
        createdAt: now
      });

      // 2. Facture
      const invoiceId = 'FAC-' + Date.now().toString().slice(-6);
      await addDoc(collection(db, 'invoices'), {
        id: invoiceId,
        client: 'Client Comptoir (POS)',
        ice: 'N/A',
        date: today,
        amount: `${total.toFixed(2)} MAD`,
        status: 'Payée',
        method: method,
        createdAt: now
      });

      // 3. Stocks (simplified to avoid bugs)
      try {
        const inventorySnapshot = await getDocs(collection(db, 'inventoryItems'));
        const inventoryItems = inventorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));

        for (const cartItem of cart) {
          if (!cartItem || !cartItem.name) continue;
          
          const matchingRecipe = recettes.find(r => (r.nom || r.name || '').toLowerCase() === cartItem.name.toLowerCase());
          
          if (matchingRecipe && matchingRecipe.ingredients && Array.isArray(matchingRecipe.ingredients)) {
            for (const ingredient of matchingRecipe.ingredients) {
              if (!ingredient || !ingredient.name) continue;
              
              let invItem = inventoryItems.find((inv: any) => (inv.name || '').toLowerCase() === ingredient.name.toLowerCase());

              const portions = matchingRecipe.portions || 1;
              const qtyToDeduct = ((ingredient.quantity || 0) / portions) * (cartItem.qty || 1);

              if (invItem && typeof invItem.quantity !== 'undefined') {
                const newQty = Math.max(0, Number(invItem.quantity) - qtyToDeduct);
                await updateDoc(doc(db, 'inventoryItems', invItem.id), { quantity: newQty, updatedAt: now });
              }
            }
          } else {
            const matchingItem = inventoryItems.find((inv: any) => 
              (inv.name || '').toLowerCase() === cartItem.name.toLowerCase()
            );

            if (matchingItem && typeof matchingItem.quantity !== 'undefined') {
              const newQty = Math.max(0, Number(matchingItem.quantity) - (cartItem.qty || 1));
              await updateDoc(doc(db, 'inventoryItems', matchingItem.id), { quantity: newQty, updatedAt: now });
            }
          }
        }
      } catch (stockErr) {
        console.error("Stock deduction error", stockErr);
      }

      setTicketToPrint({
        id: displayId,
        date: today,
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: total,
        method: method
      });
      setIsTicketModalOpen(true);
      setCart([]);
      
    } catch (err: any) {
      console.error("Checkout Error:", err);
      alert("Erreur caisse: " + err.message + "\n" + JSON.stringify(err, Object.getOwnPropertyNames(err)));
      showToast("Erreur: " + (err.message || "Erreur inconnue lors de l'encaissement"), "error");
    }
  };

  // Helper for generating colors based on category
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Entrées': return 'from-green-400 to-emerald-500 shadow-green-500/40 text-white';
      case 'Plats Principaux': return 'from-[#F4C75B] to-orange-500 shadow-[#F4C75B]/40 text-[#1A1A1A]';
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
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Rechercher un plat..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F4C75B] text-gray-700 font-medium transition-all"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`p-3 rounded-2xl transition-colors ${isEditMode ? 'bg-red-100 text-red-600' : 'bg-white text-gray-500 hover:bg-gray-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'}`}
                  title={isEditMode ? "Désactiver le mode édition" : "Activer le mode édition (suppression)"}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                                    className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat.id && !searchQuery
                      ? 'bg-[#1A1A1A] text-[#F4C75B] shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] translate-y-[4px]' 
                      : 'bg-white text-gray-500 hover:text-gray-900 shadow-[0_6px_0_#d1d5db,0_10px_15px_rgba(0,0,0,0.1)] border border-gray-100 -translate-y-[2px] active:translate-y-[4px] active:shadow-[0_0px_0_#d1d5db]'
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
                    whileTap={{ scale: 0.95, y: 4, boxShadow: "0 4px 0 #d1d5db, 0 8px 10px rgba(0,0,0,0.1)" }}
                    onClick={() => setIsAddModalOpen(true)}
                    className="relative overflow-hidden flex flex-col justify-center items-center aspect-square rounded-2xl sm:rounded-3xl p-2 sm:p-4 border-2 border-dashed border-gray-300 text-gray-400 hover:text-[#F4C75B] hover:border-[#F4C75B] hover:bg-[#F4C75B]/5 bg-white shadow-[0_8px_0_#d1d5db,0_12px_20px_rgba(0,0,0,0.1)] transition-all"
                  >
                    <Plus size={32} className="mb-2" />
                    <span className="font-bold text-sm">Ajouter un article</span>
                  </motion.button>
                  
                  {filteredItems.map(item => {
                    const colorClass = getCategoryColor(item.category);
                    const textColor = colorClass.includes('text-white') ? 'text-white/90' : 'text-[#1A1A1A]/80';
                    const priceColor = colorClass.includes('text-white') ? 'text-white' : 'text-[#1A1A1A]';
                    
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95, y: 4, boxShadow: "0 4px 0 rgba(0,0,0,0.25), 0 8px 10px rgba(0,0,0,0.3), inset 0 3px 0 rgba(255,255,255,0.4), inset 0 -3px 0 rgba(0,0,0,0.2)" }}
                        key={item.id}
                        onClick={() => !isEditMode && addToCart(item)}
                        className={`relative overflow-hidden flex flex-col justify-between aspect-square rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-left bg-gradient-to-br ${colorClass} shadow-[0_8px_0_rgba(0,0,0,0.25),0_12px_20px_rgba(0,0,0,0.3),inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-3px_0_rgba(0,0,0,0.2)] border border-white/20 transition-all`}
                      >
                        {/* Full Image Background if available */}
                        {item.imageUrl ? (
                          <>
                            <div className="absolute inset-0">
                              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 rounded-3xl" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none rounded-3xl" />
                        )}
                        
                        {isEditMode && (
                          <div 
                            onClick={(e) => handleDeleteItem(e, item.id)}
                            className="absolute top-2 right-2 z-20 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </div>
                        )}
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          <span className={`font-bold text-sm sm:text-lg leading-tight flex-1 drop-shadow-sm break-words line-clamp-3 ${item.imageUrl ? 'text-white' : priceColor}`}>
                            {item.name}
                          </span>
                          <div className="mt-auto flex flex-wrap items-baseline">
                            <span className={`font-black text-lg sm:text-2xl drop-shadow-md ${item.imageUrl ? 'text-white' : priceColor}`}>
                              {item.numPrice}
                            </span>
                            <span className={`font-bold text-[10px] sm:text-xs ml-1 ${item.imageUrl ? 'text-white/80' : textColor}`}>MAD</span>
                          </div>
                        </div>
                      </motion.div>
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
              <div className="w-10 h-10 rounded-xl bg-[#F4C75B]/20 flex items-center justify-center text-[#F4C75B]">
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
                      <div className="text-[#F4C75B] font-black text-sm">{item.numPrice * item.qty} MAD</div>
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

      {/* Ticket Modal */}
      {isTicketModalOpen && ticketToPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-sm w-full flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Ticket de caisse</h3>
              <button onClick={() => setIsTicketModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white flex-1" id="printable-ticket">
              <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-4">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">MOUDA PALACE</h2>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Restaurant & Salon de thé</p>
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p>Ticket: {ticketToPrint.id}</p>
                  <p>{ticketToPrint.date} à {ticketToPrint.time}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {ticketToPrint.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.qty}x</span> {item.name}
                    </div>
                    <div className="text-gray-700">{(item.price * item.qty).toFixed(2)} MAD</div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-dashed border-gray-300 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>TOTAL</span>
                  <span>{ticketToPrint.total.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Paiement</span>
                  <span>{ticketToPrint.method}</span>
                </div>
              </div>
              
              <div className="text-center text-xs text-gray-400 mt-8">
                <p>Merci de votre visite !</p>
                <p>À très bientôt chez Mouda Palace</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  const printContent = document.getElementById('printable-ticket');
                  if (printContent) {
                    const originalContents = document.body.innerHTML;
                    document.body.innerHTML = printContent.innerHTML;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload();
                  }
                }}
                className="flex-1 py-2.5 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors flex items-center justify-center gap-2"
              >
                <Receipt size={18} />
                Imprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
\n            {/* Add Item Modal */}
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
                <div className="relative">
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Saisie libre ou sélectionner..." 
                    required 
                    list="recettes-list"
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] bg-white"
                  />
                  <datalist id="recettes-list">
                    {recettes.map((r, idx) => (
                      <option key={idx} value={r.nom} />
                    ))}
                  </datalist>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
                <input 
                  type="number" 
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="Ex: 25" 
                  required 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] bg-white"
                />
              </div>

                            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo de l'article</label>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="w-full border border-gray-200 rounded-xl p-2 focus:outline-none focus:border-[#F4C75B] bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsPhotoGalleryOpen(!isPhotoGalleryOpen)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    Photos du menu
                  </button>
                </div>
                
                {isPhotoGalleryOpen && (
                  <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 h-40 overflow-y-auto">
                    {Array.from(new Set(menuItems.filter(i => i.imageUrl).map(i => i.imageUrl))).map((url: any, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewItemImage(url);
                          setIsPhotoGalleryOpen(false);
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${newItemImage === url ? 'border-[#F4C75B]' : 'border-transparent hover:border-gray-300'}`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {menuItems.filter(i => i.imageUrl).length === 0 && (
                      <div className="col-span-4 text-center text-sm text-gray-500 py-4">Aucune photo disponible dans le menu</div>
                    )}
                  </div>
                )}

                {newItemImage && !isPhotoGalleryOpen && (
                  <div className="mt-2 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setNewItemImage('')} className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1 shadow text-gray-700">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#F4C75B] text-[#1A1A1A] rounded-xl font-bold hover:bg-[#cda25b] transition-colors"
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
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-bold transition-all ${selectedTable === table.id ? 'bg-[#F4C75B] text-[#1A1A1A] shadow-md scale-105 border-2 border-[#F4C75B]' : 'bg-white text-gray-700 border-2 border-gray-100 hover:bg-gray-50'}`}
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
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedTable === 'À emporter' ? 'bg-[#F4C75B] text-[#1A1A1A] shadow-md' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
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
