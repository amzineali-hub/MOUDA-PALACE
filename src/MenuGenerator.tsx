import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Sparkles, Upload, Printer } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function MenuGenerator() {
  const { showToast } = useToast();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isPrintView, setIsPrintView] = useState(false);
  const [printTemplate, setPrintTemplate] = useState<'moderne' | 'traditionnel'>('moderne');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Entrées');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const categories = ['Entrées', 'Plats Principaux', 'Desserts', 'Boissons'];

  const availableImages = [
    "/8c978763-67b7-4533-b682-dad543615044_3-hours-cultural-walk-in-fes-medina-medium.jpg",
    "/fes-spring.jpg",
    "/IMG_4253-2048x1365.jpg",
    "/d0.jpg"
  ];

  // Chargement en temps réel depuis Firebase
  useEffect(() => {
    const q = query(collection(db, 'menu_items'), orderBy('category'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(items);
    });

  return () => unsubscribe();
  }, []);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      showToast("Veuillez remplir le nom et le tarif.", "error");
      return;
    }

    try {
      const itemData = {
        name,
        category,
        price: price.includes('MAD') ? price : `${price} MAD`,
        desc,
        imageUrl: imageUrl || availableImages[0],
        updatedAt: new Date()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'menu_items', editingItem.id), itemData);
        showToast("Plat mis à jour avec succès !");
        setEditingItem(null);
      } else {
        await addDoc(collection(db, 'menu_items'), {
          ...itemData,
          createdAt: new Date()
        });
        showToast("Nouveau plat ajouté au menu !");
      }

      // Reset form
      setName('');
      setPrice('');
      setDesc('');
      setImageUrl('');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'enregistrement.", "error");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.replace(' MAD', ''));
    setDesc(item.desc);
    setImageUrl(item.imageUrl);
    setIsAddModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous supprimer ce plat du menu ?")) {
      try {
        await deleteDoc(doc(db, 'menu_items', id));
        showToast("Plat supprimé.");
      } catch (e) {
        showToast("Erreur lors de la suppression.", "error");
      }
    }
  };

if (isPrintView) {
    return (
      <div className="bg-white min-h-screen p-8 print:p-0">
        <div className="max-w-5xl mx-auto print:max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 print:hidden">
            <button onClick={() => setIsPrintView(false)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
              <X size={20} /> Retour
            </button>
            <div className="flex items-center gap-4">
              <select 
                value={printTemplate} 
                onChange={(e) => setPrintTemplate(e.target.value as any)}
                className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-sm font-medium focus:outline-none focus:border-[#DDA956]"
              >
                <option value="moderne">Modèle Moderne (Minimaliste)</option>
                <option value="traditionnel">Modèle Traditionnel (Marocain)</option>
              </select>
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-[#c4954b] transition-colors">
                <Printer size={18} /> Imprimer
              </button>
            </div>
          </div>

          {printTemplate === 'moderne' ? (
            <div className="print:p-4">
              <div className="text-center mb-16 border-b-2 border-[#DDA956] pb-10">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full border border-[#DDA956] flex items-center justify-center overflow-hidden bg-white p-2">
                    <img src="/mouda.png" alt="Mouda Palace Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-[0.2em]">Mouda Palace</h1>
                <p className="text-2xl text-gray-500 font-serif italic tracking-wider">La Carte</p>
              </div>

              <div className="space-y-16">
                {categories.map((cat) => {
                  const itemsInCat = menuItems.filter(i => i.category === cat);
                  if (itemsInCat.length === 0) return null;

                  return (
                    <div key={cat} className="break-inside-avoid">
                      <h2 className="text-3xl font-serif text-[#DDA956] text-center mb-10 uppercase tracking-widest flex items-center justify-center gap-6">
                        <span className="h-[1px] w-12 bg-[#DDA956]"></span> 
                        {cat} 
                        <span className="h-[1px] w-12 bg-[#DDA956]"></span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {itemsInCat.map(item => (
                          <div key={item.id} className="flex gap-5 break-inside-avoid">
                            {item.imageUrl && (
                              <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-[#DDA956]/30 shadow-sm print:border-gray-200">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 pt-1">
                              <div className="flex justify-between items-baseline mb-2 gap-4">
                                <h3 className="text-xl font-serif font-bold text-gray-900">{item.name}</h3>
                                <div className="flex-1 border-b-2 border-dotted border-gray-300 relative -top-1"></div>
                                <span className="text-lg font-serif font-bold text-[#DDA956] whitespace-nowrap">{item.price}</span>
                              </div>
                              <p className="text-sm text-gray-600 italic leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div 
              className="relative p-8 md:p-12 min-h-[1100px] shadow-2xl rounded-sm print:shadow-none print:p-8 print:m-0 overflow-hidden bg-[#FAF3E0]"
              style={{ backgroundImage: "url('/menu_traditionnel.jpeg')", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}
            >
              <div className="relative z-10 pt-20 md:pt-32 px-4 md:px-12">
                <div className="text-center mb-12 md:mb-16">
                  {/* Optionnel : on garde le titre s'il n'est pas dans l'image de fond */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#5c2d16] mb-4 uppercase tracking-[0.15em] drop-shadow-sm">
                    MAISON MAROCAINE
                  </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 md:gap-16 relative z-10">
                  <div className="space-y-10 md:space-y-12">
                    {categories.map((cat) => {
                      const itemsInCat = menuItems.filter(i => i.category === cat);
                      if (itemsInCat.length === 0) return null;
                      return (
                        <div key={cat} className="break-inside-avoid">
                          <div className="flex items-center justify-center lg:justify-start mb-6 md:mb-8 relative">
                            {/* Decorative Line behind */}
                            <div className="absolute w-full h-[2px] bg-[#91221b] z-0 opacity-40"></div>
                            {/* Banner */}
                            <div className="relative z-10 bg-gradient-to-r from-[#7a1c15] to-[#91221b] border-y-2 border-[#d4af37] px-6 md:px-10 py-1.5 shadow-md flex items-center gap-3">
                              <span className="text-[#d4af37] text-lg">♦</span>
                              <h2 className="text-[#FAF3E0] text-lg md:text-xl font-serif font-bold uppercase tracking-widest m-0">
                                NOS {cat}
                              </h2>
                              <span className="text-[#d4af37] text-lg">♦</span>
                            </div>
                          </div>

                          <div className="space-y-3 md:space-y-4 px-2 md:px-4">
                            {itemsInCat.map(item => (
                              <div key={item.id} className="flex flex-col">
                                <div className="flex justify-between items-end gap-2 md:gap-4">
                                  <h3 className="text-lg md:text-xl font-serif font-bold text-[#3d1e0f] tracking-wide whitespace-nowrap">{item.name}</h3>
                                  <div className="flex-1 border-b-[2px] border-dotted border-[#3d1e0f]/50 relative bottom-[6px] md:bottom-[8px]"></div>
                                  <span className="text-lg md:text-xl font-serif font-bold text-[#3d1e0f] whitespace-nowrap">{item.price}</span>
                                </div>
                                {item.desc && (
                                  <p className="text-sm md:text-base text-[#3d1e0f]/70 italic mt-0.5">{item.desc}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden lg:flex flex-col gap-8 md:gap-12 mt-4 items-center">
                     {menuItems.filter(i => i.imageUrl).slice(0, 4).map((item, index) => (
                        <div key={index} className="relative group">
                          {/* Tagine effect */}
                          <div className="absolute inset-[-6px] bg-gradient-to-br from-[#d4af37] to-[#aa8322] rounded-full shadow-lg"></div>
                          <div className="relative rounded-full overflow-hidden border-[4px] border-[#FAF3E0] w-[260px] h-[260px] mx-auto z-10 shadow-inner">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                          </div>
                        </div>
                     ))}
                  </div>
                </div>
                
                <div className="mt-16 md:mt-24 pt-6 md:pt-8 text-[#3d1e0f] text-sm md:text-base font-serif italic pb-8 md:pb-12 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p>• Commande 24-48h à l'avance</p>
                    <p className="mt-1">• Paiement à la récupération</p>
                  </div>
                  <div className="text-center md:text-right font-bold tracking-wider text-[#7a1c15]">
                    <p>MOUDA PALACE</p>
                    <p className="font-sans text-sm tracking-normal font-normal mt-1">+212 5 35 00 00 00</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

    return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* En-Tête du Menu avec Logo & Identité Mouda Palace */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#DDA956]/20 border border-[#DDA956]/40 flex items-center justify-center overflow-hidden p-2">
            <img src="/mouda.png" alt="Mouda Palace Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#DDA956] font-semibold">Éditeur de Carte Officiel</span>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-wide">Restaurant Mouda Palace</h1>
            <p className="text-gray-300 text-sm mt-1">Fès, Maroc — Gestion dynamique des menus, tarifs et visuels</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setIsPrintView(true)}
            className="flex items-center w-full sm:w-auto gap-2 bg-white/10 text-white border border-white/20 px-5 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors shadow-lg"
          >
            <Printer size={20} />
            <span>Aperçu Impression</span>
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setName('');
              setPrice('');
              setDesc('');
              setImageUrl('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center w-full sm:w-auto gap-2 bg-[#DDA956] text-[#1A1A1A] px-5 py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors shadow-lg"
          >
            <Plus size={20} />
            <span>Ajouter un plat</span>
          </button>
        </div>
      </div>

      {/* Affichage par Catégories */}
      {categories.map((cat) => {
        const itemsInCat = menuItems.filter(i => i.category === cat);
        if (itemsInCat.length === 0) return null;

        return (
          <div key={cat} className="space-y-4">
            <h2 className="text-2xl font-serif text-[#1A1A1A] border-b border-gray-200 pb-2 flex items-center gap-2">
              <Sparkles size={20} className="text-[#DDA956]" />
              {cat}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itemsInCat.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="h-48 relative bg-gray-100">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-[#DDA956] font-serif font-bold px-3 py-1 rounded-full text-sm">
                      {item.price}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-serif font-semibold text-lg text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{item.desc}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Mouda Palace Fès</span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-gray-50"
                          title="Éditer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-50"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Modal Ajout / Édition */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-6">
              {editingItem ? "Modifier le plat" : "Ajouter un plat au menu"}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Tagine d'Agneau aux Pruneaux" 
                  required 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarif (ex: 220 MAD)</label>
                  <input 
                    type="text" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="220" 
                    required 
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  placeholder="Ingrédients, préparation, traditions..." 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] resize-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visuel (Image)</label>
                <div className="space-y-2">
                  <select
                    value={availableImages.includes(imageUrl) ? imageUrl : ""}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white"
                  >
                    <option value="">Sélectionner une image par défaut</option>
                    {availableImages.map(img => (
                      <option key={img} value={img}>{img.split('/').pop()}</option>
                    ))}
                  </select>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl p-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:border-[#DDA956] transition-colors">
                        <Upload size={16} />
                        <span>Télécharger une image</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 font-medium">OU</span>
                    <input 
                      type="text" 
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="URL directe de l'image" 
                      className="flex-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#DDA956]" 
                    />
                  </div>
                  {imageUrl && imageUrl.startsWith('data:image') && (
                    <div className="text-xs text-green-600 font-medium mt-1">Image chargée avec succès.</div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
