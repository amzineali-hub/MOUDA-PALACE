import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Sparkles, Upload, Printer, ChefHat, ZoomIn, ClipboardList, PlayCircle, Video } from 'lucide-react';
import { useToast } from './context/ToastContext';
import ConfirmModal from './components/ConfirmModal';
import Combobox from './components/Combobox';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { computeRecipeCost } from './lib/recipeCost';
import { parseAmount } from './lib/revenueUtils';
import { getVideoEmbedUrl } from './lib/videoUtils';
import DishIngredientsModal from './components/DishIngredientsModal';

import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function MenuGenerator({ onOpenFiche }: { onOpenFiche?: (dishName: string) => void } = {}) {
  const { showToast } = useToast();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [recettes, setRecettes] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isPrintView, setIsPrintView] = useState(false);
  const [printTemplate, setPrintTemplate] = useState<'moderne' | 'traditionnel'>('moderne');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [lightboxItem, setLightboxItem] = useState<any | null>(null);
  const [ingredientsPreviewItem, setIngredientsPreviewItem] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Entrées');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

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
        ...doc.data(),
        id: doc.id
      }));
      setMenuItems(items);
    });

  return () => unsubscribe();
  }, []);

  // Fiches techniques + stock, pour afficher le coût matière/marge réels à titre informatif
  useEffect(() => {
    const unsubRecettes = onSnapshot(collection(db, 'fiches_techniques'), snapshot => {
      setRecettes(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    const unsubInventory = onSnapshot(collection(db, 'inventoryItems'), snapshot => {
      setInventoryItems(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => {
      unsubRecettes();
      unsubInventory();
    };
  }, []);

  const matchedRecipeCost = useMemo(() => {
    const recipe = recettes.find(r => (r.nom || r.name || '').toLowerCase() === name.trim().toLowerCase());
    if (!recipe) return null;
    const priceValue = parseAmount(price);
    const result = computeRecipeCost({ ...recipe, prixVente: priceValue || recipe.prixVente }, inventoryItems);
    return result;
  }, [name, price, recettes, inventoryItems]);

  // Un plat du menu a une fiche technique liée s'il existe une fiche du même nom — utilisé
  // pour afficher le bouton "Voir la fiche technique" sur chaque plat (pas seulement celui en
  // cours d'édition, contrairement à matchedRecipeCost ci-dessus).
  const findFicheForDish = (dishName: string) =>
    recettes.find(r => (r.nom || r.name || '').trim().toLowerCase() === (dishName || '').trim().toLowerCase());

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
        videoUrl: videoUrl.trim(),
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
      setVideoUrl('');
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
    setVideoUrl(item.videoUrl || '');
    setIsAddModalOpen(true);
  };

      const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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
          setImageUrl(dataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };


    
  const handlePrint = async () => {
    try {
      const element = document.getElementById('printable-menu');
      if (!element) return;
      
      showToast("Génération du PDF en cours... Veuillez patienter", "success");
      
      const dataUrl = await toPng(element, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2 // High resolution
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      // If the content is taller than one A4 page, it will overflow or get scaled down.
      // Usually for menus, a long scroll should either span multiple pages or be scaled to fit.
      // We will add it to the first page, and if it exceeds, we can optionally add multiple pages, 
      // but to keep it simple, we'll just put the image on the PDF.
      // A typical A4 page height in mm is 297.
      let heightLeft = pdfHeight;
      let position = 0;
      let pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('Menu-Mouda-Palace.pdf');
      
      showToast("Menu téléchargé avec succès !", "success");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF", error);
      showToast("Erreur lors de la génération du PDF", "error");
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'menu_items', itemToDelete));
      showToast("Plat supprimé.");
    } catch (e) {
      showToast("Erreur lors de la suppression.", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

if (isPrintView) {
    return (
      <div className="bg-white min-h-screen p-2 sm:p-4 md:p-8 print:p-0 overflow-hidden print:overflow-visible">
        <div className="max-w-5xl mx-auto print:max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 print:hidden">
            <button onClick={() => setIsPrintView(false)} className="flex items-center justify-center w-full sm:w-auto gap-2 text-gray-500 hover:text-gray-900 transition-colors py-2">
              <X size={20} /> Retour
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <select 
                value={printTemplate} 
                onChange={(e) => setPrintTemplate(e.target.value as any)}
                className="w-full sm:w-auto border border-gray-200 rounded-lg px-4 py-2.5 bg-white text-sm font-medium focus:outline-none focus:border-[#F4C75B]"
              >
                <option value="moderne">Modèle Moderne (Minimaliste)</option>
                <option value="traditionnel">Modèle Traditionnel (Marocain)</option>
              </select>
              <div className="w-full sm:w-auto flex flex-col items-center gap-1">
                <button onClick={handlePrint} className="w-full flex justify-center items-center gap-2 bg-[#F4C75B] text-[#1A1A1A] px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-[#E5B745] transition-colors">
                  <Printer size={18} /> Télécharger le PDF
                </button>
              </div>
            </div>
          </div>

          <div id="printable-menu">
          {printTemplate === 'moderne' ? (
            <div className="print:p-4">
              <div
                className="text-center mb-16 py-14 px-4 bg-[#265C6D]"
                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
              >
                <div className="flex justify-center mb-6">
                  <div
                    className="h-20 w-24 bg-[#F4C75B]"
                    style={{
                      maskImage: 'url(/mouda-1-1-1.png)',
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskImage: 'url(/mouda-1-1-1.png)',
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center'
                    }}
                  />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 uppercase tracking-[0.15em] sm:tracking-[0.2em] px-2 text-center">Mouda Palace</h1>
                <p className="text-2xl text-[#F4C75B] font-serif italic tracking-wider">La Carte</p>
              </div>

              <div className="space-y-16">
                {categories.map((cat) => {
                  const itemsInCat = menuItems.filter(i => i.category === cat);
                  if (itemsInCat.length === 0) return null;

                  return (
                    <div key={cat} className="break-inside-avoid">
                      <h2 className="text-2xl sm:text-3xl font-serif text-[#F4C75B] text-center mb-10 uppercase tracking-widest flex items-center justify-center gap-4 sm:gap-6">
                        <span className="h-[1px] w-12 bg-[#F4C75B]"></span> 
                        {cat} 
                        <span className="h-[1px] w-12 bg-[#F4C75B]"></span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {itemsInCat.map(item => (
                          <div key={item.id} className="flex gap-3 sm:gap-5 break-inside-avoid items-center sm:items-start">
                            {item.imageUrl && (
                              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 shrink-0 rounded-full overflow-hidden border-2 border-[#F4C75B]/30 shadow-sm print:border-gray-200">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 pt-1 text-left">
                              <div className="flex justify-between items-baseline mb-2 gap-4">
                                <h3 className="text-lg md:text-xl font-serif font-bold text-gray-900">{item.name}</h3>
                                <div className="flex-1 border-b-2 border-dotted border-gray-300 relative -top-1"></div>
                                <span className="text-lg font-serif font-bold text-[#F4C75B] whitespace-nowrap">{item.price}</span>
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
              className="relative p-2 sm:p-4 md:p-12 min-h-[1100px] shadow-2xl rounded-sm print:shadow-none print:p-8 print:m-0 overflow-hidden print:overflow-visible bg-[#FAF3E0]"
              style={{ backgroundImage: "url('/menu_traditionnel.jpeg')", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}
            >
              <div className="relative z-10 pt-10 sm:pt-16 md:pt-32 px-2 sm:px-4 md:px-12">
                <div
                  className="text-center mb-12 md:mb-16 flex flex-col items-center py-10 md:py-14 px-4 bg-[#265C6D] rounded-sm shadow-md -mx-2 sm:-mx-4 md:-mx-12"
                  style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  <div
                    className="h-20 w-24 md:h-24 md:w-28 bg-[#F4C75B] mb-4"
                    style={{
                      maskImage: 'url(/mouda-1-1-1.png)',
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskImage: 'url(/mouda-1-1-1.png)',
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center'
                    }}
                  />
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-2 uppercase tracking-[0.1em] md:tracking-[0.15em]">
                    MOUDA PALACE
                  </h1>
                  <p className="text-xl md:text-2xl text-[#F4C75B] font-serif italic tracking-wider">La Carte</p>
                </div>

                <div className="relative z-10">
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
                            <div className="relative z-10 bg-gradient-to-r from-[#7a1c15] to-[#91221b] border-y-2 border-[#d4af37] px-4 md:px-10 py-1.5 shadow-md flex items-center gap-2 md:gap-3">
                              <span className="text-[#d4af37] text-lg">♦</span>
                              <h2 className="text-[#FAF3E0] text-lg md:text-xl font-serif font-bold uppercase tracking-widest m-0">
                                NOS {cat}
                              </h2>
                              <span className="text-[#d4af37] text-lg">♦</span>
                            </div>
                          </div>

                          <div className="space-y-6 md:space-y-8 px-2 md:px-4">
                            {itemsInCat.map(item => (
                              <div key={item.id} className="flex flex-col-reverse sm:flex-row gap-4 md:gap-6 items-center sm:items-center break-inside-avoid">
                                <div className="flex-1 flex flex-col text-left">
                                  <div className="flex justify-between items-end gap-1 md:gap-4 w-full">
                                    <h3 className="text-lg md:text-xl font-serif font-bold text-[#3d1e0f] tracking-wide">{item.name}</h3>
                                    <div className="flex-1 border-b-[2px] border-dotted border-[#3d1e0f]/50 relative bottom-[6px] md:bottom-[8px]"></div>
                                    <span className="text-lg md:text-xl font-serif font-bold text-[#3d1e0f] whitespace-nowrap">{item.price}</span>
                                  </div>
                                  {item.desc && (
                                    <p className="text-sm md:text-base text-[#3d1e0f]/70 italic mt-0.5">{item.desc}</p>
                                  )}
                                </div>
                                {item.imageUrl && (
                                  <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 shrink-0 relative group">
                                    <div className="absolute inset-[-4px] bg-gradient-to-br from-[#d4af37] to-[#aa8322] rounded-full shadow-md"></div>
                                    <div className="relative rounded-full overflow-hidden border-[3px] border-[#FAF3E0] w-full h-full z-10 shadow-inner">
                                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
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
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* En-Tête du Menu avec Logo & Identité Mouda Palace */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F4C75B]/20 border border-[#F4C75B]/40 flex items-center justify-center overflow-hidden p-2">
            <img src="/mouda-1-1-1.png" alt="Mouda Palace Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#F4C75B] font-semibold">Éditeur de Carte Officiel</span>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-wide">Restaurant Mouda Palace</h1>
            <p className="text-gray-300 text-sm mt-1">Fès, Maroc — Gestion dynamique des menus, tarifs et visuels</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button onClick={() => setIsPrintView(true)} className="flex items-center w-full sm:w-auto gap-2 bg-white/10 text-white border border-white/20 px-5 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors shadow-lg">
            <Printer size={20} />
            <span>Génération du Menu</span>
          </button>
          <button onClick={() => { setEditingItem(null); setName(""); setCategory(categories[0]); setPrice(""); setDesc(""); setImageUrl(""); setVideoUrl(""); setIsAddModalOpen(true); }} className="flex items-center w-full sm:w-auto gap-2 bg-[#F4C75B] text-[#1A1A1A] px-5 py-3 rounded-xl font-medium hover:bg-[#E5B745] transition-colors shadow-lg">
            <Plus size={20} />
            <span>Ajouter un plat</span>
          </button>
        </div>
      </div>

      {categories.map(category => {
        const items = menuItems.filter(item => item.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl font-serif text-[#1A1A1A] border-b border-gray-200 pb-2 flex items-center gap-2">
              <ChefHat size={20} className="text-[#F4C75B]" />
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div
                    className="h-72 relative bg-gray-100 cursor-pointer group/img"
                    onClick={() => setLightboxItem(item)}
                    title="Agrandir"
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Aucune image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn size={28} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow" />
                    </div>
                    {item.videoUrl && (
                      <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white p-1.5 rounded-full" title="Vidéo disponible">
                        <PlayCircle size={18} />
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-[#F4C75B] font-serif font-bold px-3 py-1 rounded-full text-sm">
                      {item.price}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-serif font-semibold text-lg text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{item.desc}</p>
                    {findFicheForDish(item.name) && (
                      <button
                        onClick={() => setIngredientsPreviewItem(item)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#265C6D] hover:underline mb-3 -mt-1"
                      >
                        <ClipboardList size={14} /> Voir les ingrédients
                      </button>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Mouda Palace Fès</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-50" title="Éditer">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setDishToDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-50" title="Supprimer">
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
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <Combobox
                    options={categories}
                    value={category}
                    onChange={val => setCategory(val)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] bg-white"
                    placeholder="Ex: Entrées"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarif (ex: 220 MAD)</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="220"
                    required
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B]"
                  />
                  {matchedRecipeCost && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Coût matière : <span className="font-medium text-gray-700">{matchedRecipeCost.totalCost.toFixed(2)} MAD</span>
                      {' · '}Food Cost : <span className={`font-medium ${matchedRecipeCost.foodCostPct <= 35 ? 'text-green-600' : 'text-red-600'}`}>{matchedRecipeCost.foodCostPct.toFixed(1)}%</span>
                      {' · '}Marge : <span className="font-medium text-gray-700">{matchedRecipeCost.margin.toFixed(2)} MAD</span>
                      <span className="text-gray-400"> (info, d'après la fiche technique)</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  placeholder="Ingrédients, préparation, traditions..." 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] resize-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visuel (Image)</label>
                <div className="space-y-4">
                  <div className="relative w-full group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#F4C75B]/60 bg-[#FAF3E0]/50 rounded-2xl p-6 text-sm text-[#F4C75B] group-hover:bg-[#FAF3E0] group-hover:border-[#F4C75B] transition-all cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#F4C75B] group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <div className="text-center">
                        <span className="block font-bold text-[#5c2d16] text-base mb-1">Télécharger une nouvelle image</span>
                        <span className="block text-xs text-[#5c2d16]/70">Cliquez ou glissez une image ici pour l'intégrer au menu</span>
                      </div>
                    </div>
                  </div>
                  {imageUrl && imageUrl.startsWith('data:image') && (
                    <div className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                      <Sparkles size={14} /> Image importée avec succès
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Ou choisir de la bibliothèque</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <select
                      value={availableImages.includes(imageUrl) ? imageUrl : ""}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] bg-white text-gray-700"
                    >
                      <option value="">Sélectionner depuis la bibliothèque</option>
                      {availableImages.map(img => (
                        <option key={img} value={img}>{img.split('/').pop()}</option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Ou coller une URL d'image existante"
                      className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] text-sm text-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Video size={14} /> Vidéo (URL YouTube ou lien direct .mp4) — optionnel
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou https://.../plat.mp4"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] text-sm text-gray-700"
                />
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
                  className="flex-1 bg-[#F4C75B] text-[#1A1A1A] py-3 rounded-xl font-medium hover:bg-[#E5B745] transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Enregistrer
                </button>
              </div>
              {editingItem && (
                <button 
                  type="button"
                  onClick={() => {
                    setDishToDelete(editingItem.id); 
                    setEditingItem(null);
                    setIsAddModalOpen(false);
                  }}
                  className="w-full mt-2 bg-white text-red-500 border border-red-200 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Supprimer ce plat
                </button>
              )}
            </form>
          </motion.div>
        </div>
      )}

      {/* Lightbox — agrandissement de l'image/vidéo d'un plat, avec accès direct à sa fiche technique */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={() => setLightboxItem(null)}>
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
          <div className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            {lightboxItem.videoUrl ? (
              getVideoEmbedUrl(lightboxItem.videoUrl) ? (
                <iframe
                  src={getVideoEmbedUrl(lightboxItem.videoUrl) as string}
                  title={lightboxItem.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video rounded-xl bg-black"
                />
              ) : (
                <video src={lightboxItem.videoUrl} controls autoPlay className="w-full max-h-[65vh] rounded-xl bg-black" />
              )
            ) : lightboxItem.imageUrl ? (
              <img src={lightboxItem.imageUrl} alt={lightboxItem.name} className="max-w-full max-h-[65vh] object-contain rounded-xl" referrerPolicy="no-referrer" />
            ) : null}
            <div className="text-center text-white">
              <h3 className="text-xl font-serif font-semibold">{lightboxItem.name}</h3>
              <p className="text-white/60 text-sm mt-1">{lightboxItem.desc}</p>
              {findFicheForDish(lightboxItem.name) && (
                <button
                  onClick={() => { setIngredientsPreviewItem(lightboxItem); setLightboxItem(null); }}
                  className="mt-4 inline-flex items-center gap-2 bg-[#F4C75B] text-[#1A1A1A] px-5 py-2.5 rounded-xl font-medium hover:bg-[#E5B745] transition-colors"
                >
                  <ClipboardList size={16} /> Voir les ingrédients
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aperçu "Ingrédients de la portion" — même visuel que la fiche publique WordPress */}
      {ingredientsPreviewItem && (() => {
        const fiche = findFicheForDish(ingredientsPreviewItem.name);
        return (
          <DishIngredientsModal
            name={ingredientsPreviewItem.name}
            portions={fiche?.portions}
            imageUrl={ingredientsPreviewItem.imageUrl}
            ingredients={((fiche?.ingredientsText || '') as string).split('\n').map((l: string) => l.trim()).filter(Boolean)}
            onClose={() => setIngredientsPreviewItem(null)}
            onManage={() => { onOpenFiche?.(ingredientsPreviewItem.name); setIngredientsPreviewItem(null); }}
          />
        );
      })()}

      {/* Template Selection Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Choisir le modèle d'impression</h2>
              <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1: Moderne */}
              <button
                onClick={() => {
                  setPrintTemplate('moderne');
                  setIsTemplateModalOpen(false);
                  setIsPrintView(true);
                }}
                className="flex flex-col items-center text-left border-2 border-gray-100 hover:border-[#F4C75B] rounded-2xl p-6 transition-all hover:shadow-lg group"
              >
                <div className="w-full aspect-[1/1.4] bg-gray-50 rounded-xl mb-4 border border-gray-200 flex flex-col items-center p-4 relative overflow-hidden group-hover:bg-[#fcfaf5] transition-colors">
                   <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center mb-4">
                     <span className="text-[8px] font-bold text-gray-400">LOGO</span>
                   </div>
                   <div className="w-3/4 h-2 bg-gray-300 rounded mb-6"></div>
                   <div className="w-full space-y-3">
                     <div className="flex justify-between w-full"><div className="w-1/2 h-1.5 bg-gray-300 rounded"></div><div className="w-1/4 h-1.5 bg-gray-300 rounded"></div></div>
                     <div className="flex justify-between w-full"><div className="w-1/2 h-1.5 bg-gray-300 rounded"></div><div className="w-1/4 h-1.5 bg-gray-300 rounded"></div></div>
                   </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Moderne</h3>
                <p className="text-sm text-gray-500 text-center">Design épuré et minimaliste, parfait pour une impression standard.</p>
              </button>

              {/* Option 2: Traditionnel */}
              <button
                onClick={() => {
                  setPrintTemplate('traditionnel');
                  setIsTemplateModalOpen(false);
                  setIsPrintView(true);
                }}
                className="flex flex-col items-center text-left border-2 border-gray-100 hover:border-[#7a1c15] rounded-2xl p-6 transition-all hover:shadow-lg group"
              >
                <div className="w-full aspect-[1/1.4] bg-[#FAF3E0] rounded-xl mb-4 border border-[#e8d5a5] flex flex-col items-center p-4 relative overflow-hidden group-hover:bg-[#f5ebd0] transition-colors">
                   <div className="w-10 h-10 rounded-full border border-[#5c2d16]/30 flex items-center justify-center mb-3 bg-white">
                     <img src="/mouda-1-1-1.png" alt="Logo" className="w-6 h-6 object-contain opacity-50" />
                   </div>
                   <div className="w-2/3 h-2 bg-[#5c2d16] rounded mb-1"></div>
                   <div className="w-1/3 h-1.5 bg-[#7a1c15] rounded mb-6"></div>
                   <div className="w-full space-y-4">
                     <div className="flex items-center gap-2">
                       <div className="flex-1 space-y-1.5">
                         <div className="w-full h-1.5 bg-[#5c2d16] rounded"></div>
                         <div className="w-1/2 h-1 bg-[#5c2d16]/50 rounded"></div>
                       </div>
                       <div className="w-6 h-6 rounded-full bg-gray-300 shrink-0"></div>
                     </div>
                   </div>
                </div>
                <h3 className="text-xl font-bold text-[#7a1c15] mb-2">Traditionnel</h3>
                <p className="text-sm text-gray-500 text-center">Inspiré de l'artisanat marocain avec fond texturé et photos des plats.</p>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center"
          >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Confirmer la suppression</h2>
            <p className="text-gray-500 mb-8">
              Êtes-vous sûr de vouloir supprimer ce plat ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <ConfirmModal 
        isOpen={!!dishToDelete}
        title="Supprimer le plat"
        message="Voulez-vous vraiment supprimer ce plat du menu ?"
        onConfirm={async () => {
          if (dishToDelete) {
            try {
              await deleteDoc(doc(db, 'menu_items', dishToDelete));
              showToast('Plat supprimé.');
            } catch (e) {
              showToast('Erreur', 'error');
            } finally {
              setDishToDelete(null);
            }
          }
        }}
        onCancel={() => setDishToDelete(null)}
      />
    </div>
  );
}
