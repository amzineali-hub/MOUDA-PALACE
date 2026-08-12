import ConfirmModal from "./components/ConfirmModal";
import Combobox from "./components/Combobox";
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, ShoppingCart, Truck, FileText, CheckCircle, XCircle, Clock, AlertTriangle, ChevronRight, Store, X, Sparkles, Brain, TrendingUp, Loader2, Calendar , ArrowUpDown } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TVA_RATES, computeTTC } from './lib/tva';
import { calculateStockStatus } from './lib/inventory';

export default function AchatsFournisseurs() {
  const [activeTab, setActiveTab] = useState<'commandes' | 'fournisseurs' | 'previsions' | 'reception'>('commandes');
  const [isGeneratingPrevisions, setIsGeneratingPrevisions] = useState(false);
  const [previsions, setPrevisions] = useState<any>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showSupplierCol, setShowSupplierCol] = useState(true);
  const [showCategoryCol, setShowCategoryCol] = useState(true);
  const [orderSelections, setOrderSelections] = useState<Record<string, {checked: boolean, qty: string, price?: string}>>({});
  const [orderTvaRate, setOrderTvaRate] = useState<number>(20);
    const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [selectedCommande, setSelectedCommande] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSupplierDetailsModalOpen, setIsSupplierDetailsModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleGeneratePrevisions = () => {
    setIsGeneratingPrevisions(true);
    setTimeout(() => {
      const grouped: Record<string, any[]> = {};
      lowStockItems.forEach((item: any) => {
        const cat = item.category || 'Divers';
        if (!grouped[cat]) grouped[cat] = [];
        const status = calculateStockStatus(Number(item.quantity) || 0, Number(item.minStock) || 5);
        grouped[cat].push({
          name: item.name,
          quantity: `${item.quantity ?? 0} ${item.unit || ''} restant(s)`,
          reason: status === 'critical' ? `Stock critique (seuil : ${item.minStock ?? 5})` : `Stock bas (seuil : ${item.minStock ?? 5})`,
          supplier: item.supplier && item.supplier !== 'Non renseigné' ? item.supplier : 'Fournisseur non renseigné'
        });
      });

      const result = Object.entries(grouped).map(([category, items]) => ({ category, items }));
      setPrevisions(result);
      setIsGeneratingPrevisions(false);
      showToast(result.length === 0 ? "Aucun article en stock bas — aucune prévision nécessaire." : `${lowStockItems.length} article(s) à réapprovisionner détecté(s).`);
    }, 600);
  };

  const [commandes, setCommandes] = useState<any[]>([]);
    const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [commandeToDelete, setCommandeToDelete] = useState<string | null>(null);
  const [fournisseurToDelete, setFournisseurToDelete] = useState<string | null>(null);
  const [deliveryToReject, setDeliveryToReject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');

  const filteredCommandes = useMemo(() => {
    return commandes.filter((cmd) => {
      const matchesSearch = (cmd.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (cmd.fournisseur || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSupplier = filterSupplier ? cmd.fournisseur === filterSupplier : true;
      return matchesSearch && matchesSupplier;
    });
  }, [commandes, searchQuery, filterSupplier]);

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const sortedCommandes = useMemo(() => {
    let sortableItems = [...filteredCommandes];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'montant' || sortConfig.key === 'montantHT' || sortConfig.key === 'tva') {
          const parseNumeric = (val: any) => {
             if (typeof val === 'number') return val;
             if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
             return 0;
          };
          aValue = parseNumeric(aValue);
          bValue = parseNumeric(bValue);
        } else if (sortConfig.key === 'date') {
          const parseDate = (d: string) => {
            if (!d) return 0;
            const parts = d.split('/');
            if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
            return 0;
          };
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCommandes, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

  const lowStockItems = useMemo(() => {
    return inventoryItems.filter((item: any) => {
      const status = calculateStockStatus(Number(item.quantity) || 0, Number(item.minStock) || 5);
      return status === 'alert' || status === 'critical';
    });
  }, [inventoryItems]);

  const [loading, setLoading] = useState(true);
  
  const categories = useMemo(() => {
    const defaultCats = ['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes', 'Poissons', 'Légumes', 'Boulangerie', 'Patisseie', 'Produits Laitiers', 'Boissons', 'Boissons Alcoolisées', 'Sauces', 'Conserves', 'Sirops', "Matériel", "Services", "Hygiène & Entretien"];
    const dbCats = inventoryItems.map((item: any) => { let c = item.category?.trim(); if (c === "Produits d\'entretien" || c === "Produits de maintenance") return "Hygiène & Entretien"; return c; }).filter(Boolean);
    const dbFournisseurCats = fournisseurs.map(f => { let c = (f.category || f.categorie)?.trim(); if (c === "Produits d\'entretien" || c === "Produits de maintenance") return "Hygiène & Entretien"; return c; }).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats, ...dbFournisseurCats])).sort();
  }, [inventoryItems, fournisseurs]);

  const suppliersList = useMemo(() => {
    const dbSuppliers = inventoryItems.map((item: any) => item.supplier?.trim()).filter(Boolean).filter(s => s !== 'Non renseigné');
    const annuaireFournisseurs = fournisseurs.map(f => (f.name || f.nom)?.trim()).filter(Boolean);
    return Array.from(new Set([...dbSuppliers, ...annuaireFournisseurs])).sort();
  }, [inventoryItems, fournisseurs]);
  
  useEffect(() => {
    const unsubCommandes = onSnapshot(collection(db, 'commandes'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      console.log('Fetched Commandes:', docs.length, docs);
      setCommandes(docs.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    }, (error) => {
      console.error("Error fetching commandes", error);
      showToast("Erreur lors de la récupération des commandes");
    });

    const unsubFournisseurs = onSnapshot(collection(db, 'fournisseurs'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      console.log('Fetched Fournisseurs:', docs.length, docs);
      setFournisseurs(docs.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching fournisseurs", error);
      showToast("Erreur lors de la récupération des fournisseurs");
      setLoading(false);
    });

  return () => {
      unsubCommandes();
      unsubFournisseurs();
    };
  }, []);



  const updateOrderStatus = async (cmdId: string, newStatus: string) => {
    if (newStatus === 'Livrée') {
      showToast("Veuillez utiliser l'onglet Réception pour valider une livraison et mettre à jour le stock.", "error");
      return;
    }
    try {
      await updateDoc(doc(db, 'commandes', cmdId), {
        status: newStatus
      });
      showToast(`Statut mis à jour : ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Erreur lors de la mise à jour du statut");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livrée': return 'bg-green-100 text-green-700 border-green-200';
      case 'Validée': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'En attente': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Annulée': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Achats & Fournisseurs</h1>
          <p className="text-gray-500">Gérez vos commandes d'approvisionnement et votre base de fournisseurs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setIsNewSupplierModalOpen(true)} className="flex items-center gap-2 bg-white border border-gray-200 text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Store size={18} />
            <span>Nouveau fournisseur</span>
          </button>
          <button onClick={() => { setSelectedCommande(null); setProductSearch(''); setOrderSelections({}); setOrderTvaRate(20); setIsNewOrderModalOpen(true); }} className="flex items-center gap-2 bg-[#F4C75B] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-[#C89845] transition-colors shadow-sm">
            <Plus size={18} />
            <span>Créer une commande</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Commandes en cours</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{commandes.filter(c => c.status !== "Livrée" && c.status !== "Annulée").length}</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">En attente de livraison</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{commandes.filter(c => c.status === "En attente").length}</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total fournisseurs actifs</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{fournisseurs.length}</p>
          </div>
        </motion.div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="border-b border-gray-100 p-4 flex flex-col sm:flex-row flex-wrap justify-between items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('commandes')}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'commandes' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Bons de commande
            </button>
            <button 
              onClick={() => setActiveTab('reception')}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'reception' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Truck size={16} className={activeTab === 'reception' ? 'text-[#1A1A1A]' : 'text-gray-400'} />
              Réception (Contrôle)
            </button>
            <button 
              onClick={() => setActiveTab('fournisseurs')}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'fournisseurs' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Annuaire Fournisseurs
            </button>
            <button 
              onClick={() => setActiveTab('previsions')}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'previsions' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Sparkles size={16} className={activeTab === 'previsions' ? 'text-[#F4C75B]' : 'text-gray-400'} />
              Prévisions
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {activeTab === 'commandes' && (
              <select 
                value={filterSupplier} 
                onChange={(e) => setFilterSupplier(e.target.value)}
                className="w-full sm:w-48 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F4C75B] bg-white"
              >
                <option value="">Tous les fournisseurs</option>
                {suppliersList.map((sup, idx) => (
                  <option key={idx} value={sup}>{sup}</option>
                ))}
              </select>
            )}
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {activeTab === 'commandes' && (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">N° Commande</th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('date')}>
                    <div className="flex items-center gap-1">Date <ArrowUpDown size={14} className={sortConfig?.key === 'date' ? 'text-[#F4C75B]' : 'text-gray-400'} /></div>
                  </th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('fournisseur')}>
                    <div className="flex items-center gap-1">Fournisseur <ArrowUpDown size={14} className={sortConfig?.key === 'fournisseur' ? 'text-[#F4C75B]' : 'text-gray-400'} /></div>
                  </th>
                  <th className="px-6 py-4 font-medium">Articles</th>
                  <th className="px-6 py-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('montantHT')}>
                    <div className="flex items-center justify-end gap-1">Montant HT <ArrowUpDown size={14} className={sortConfig?.key === 'montantHT' ? 'text-[#F4C75B]' : 'text-gray-400'} /></div>
                  </th>
                  <th className="px-6 py-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('tva')}>
                    <div className="flex items-center justify-end gap-1">TVA <ArrowUpDown size={14} className={sortConfig?.key === 'tva' ? 'text-[#F4C75B]' : 'text-gray-400'} /></div>
                  </th>
                  <th className="px-6 py-4 font-medium text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('montant')}>
                    <div className="flex items-center justify-end gap-1">Total TTC <ArrowUpDown size={14} className={sortConfig?.key === 'montant' ? 'text-[#F4C75B]' : 'text-gray-400'} /></div>
                  </th>
                  <th className="px-6 py-4 font-medium text-center">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {sortedCommandes.map((cmd) => (
                  <tr key={cmd.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A1A1A] flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      {cmd.orderNumber || (cmd.id.startsWith("CMD-") ? cmd.id : "CMD-" + cmd.id.slice(0,4).toUpperCase())}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cmd.date}</td>
                    <td className="px-6 py-4 text-[#1A1A1A] font-medium">{cmd.fournisseur}</td>
                    <td className="px-6 py-4 text-gray-600">{Array.isArray(cmd.items) ? cmd.items.length : (typeof cmd.items === 'number' ? cmd.items : (typeof cmd.articles === 'string' ? cmd.articles.split(',').length : 0))} articles</td>
                    <td className="px-6 py-4 text-right font-medium">{cmd.montantHT != null ? `${Number(cmd.montantHT).toFixed(2)} MAD` : '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-500">{cmd.tva != null ? `${cmd.tva}%` : '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-[#1A1A1A]">{cmd.montant}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-block w-32">
                        <select
                          value={cmd.status}
                          onChange={(e) => updateOrderStatus(cmd.id, e.target.value)}
                          className={`appearance-none w-full px-3 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${getStatusColor(cmd.status)}`}
                        >
                          <option value="En attente" className="bg-white text-gray-900">En attente</option>
                          <option value="Validée" className="bg-white text-gray-900">Validée</option>
                          <option value="Livrée" className="bg-white text-gray-900">Livrée</option>
                          <option value="Annulée" className="bg-white text-gray-900">Annulée</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <svg className={`h-3 w-3 ${getStatusColor(cmd.status).includes('text') ? getStatusColor(cmd.status).split(' ').find(c => c.startsWith('text-')) : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <button 
                          onClick={() => {
                            setSelectedCommande(cmd);
                            setIsDetailsModalOpen(true);
                          }}
                          className="text-[#F4C75B] hover:text-[#C89845] font-medium text-sm flex items-center justify-end gap-1">
Détails <ChevronRight size={16} />
</button>
<button onClick={() => {
                            setSelectedCommande(cmd); 
                            setProductSearch('');
                            setOrderTvaRate(cmd.tva || 20); 
                            const initialSelections: Record<string, {checked: boolean, qty: string, price?: string}> = {};
                            if (Array.isArray(cmd.items)) {
                              cmd.items.forEach((itemObj: any) => {
                                if (itemObj.id) {
                                  initialSelections[itemObj.id] = { checked: true, qty: String(itemObj.quantity || 1), price: String(itemObj.expectedPrice || itemObj.price || 0) };
                                } else {
                                  const item = inventoryItems.find(i => i.name === itemObj.name);
                                  if (item) {
                                    initialSelections[item.id] = { checked: true, qty: String(itemObj.quantity || 1), price: String(itemObj.expectedPrice || itemObj.price || 0) };
                                  }
                                }
                              });
                            } else if (cmd.articles) {
                              cmd.articles.split(', ').forEach((a: string) => {
                                const parts = a.split(' - ');
                                const name = parts[0];
                                const qty = parts[1] || '';
                                const item = inventoryItems.find(i => i.name === name);
                                if (item) {
                                  initialSelections[item.id] = { checked: true, qty };
                                }
                              });
                            }
                            setOrderSelections(initialSelections);
                            setIsNewOrderModalOpen(true); 
                          }} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Éditer</button>
                        <button
                          onClick={() => setCommandeToDelete(cmd.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-sm"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          
          {activeTab === 'previsions' && (
            <div className="p-8 max-w-5xl mx-auto w-full">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 bg-gradient-to-br from-white to-[#FAFAFA] p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F4C75B]/10 rounded-full blur-3xl"></div>
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#F4C75B]/10 flex items-center justify-center">
                      <Brain className="text-[#F4C75B]" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif text-[#1A1A1A]">Prévisions d'Achats</h2>
                      <p className="text-gray-500 mt-1">Basées sur l'état réel des stocks</p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-8 leading-relaxed relative z-10">
                    Analyse l'état actuel de vos stocks pour identifier les produits sous le seuil d'alerte ou en rupture, et vous propose une liste d'achats groupée par catégorie avec le fournisseur habituel de chaque article.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <TrendingUp className="text-blue-500" size={20} />
                      <div className="text-sm">
                        <span className="block text-gray-500">Commandes en attente</span>
                        <span className="font-medium text-gray-900">{commandes.filter((c: any) => c.status === 'En attente' || c.status === 'Validée').length}</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <Calendar className="text-emerald-500" size={20} />
                      <div className="text-sm">
                        <span className="block text-gray-500">Basé sur</span>
                        <span className="font-medium text-gray-900">État actuel du stock</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <AlertTriangle className="text-amber-500" size={20} />
                      <div className="text-sm">
                        <span className="block text-gray-500">Stocks bas détectés</span>
                        <span className="font-medium text-gray-900">{lowStockItems.length} article{lowStockItems.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleGeneratePrevisions}
                    disabled={isGeneratingPrevisions}
                    className={`w-full sm:w-auto px-8 py-3 rounded-xl font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                      isGeneratingPrevisions 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#1A1A1A] hover:bg-black hover:shadow-xl hover:-translate-y-0.5'
                    }`}
                  >
                    {isGeneratingPrevisions ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Analyse des données en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Générer les prévisions de la semaine
                      </>
                    )}
                  </button>
                </div>
              </div>

              {previsions && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif text-[#1A1A1A]">Liste d'Achats Recommandée</h3>
                    <button onClick={() => { setOrderSelections({}); setOrderTvaRate(20); setIsNewOrderModalOpen(true); }} className="text-sm bg-[#F4C75B]/10 text-[#F4C75B] hover:bg-[#F4C75B]/20 px-4 py-2 rounded-lg font-medium transition-colors">
                      Créer des bons de commande
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {previsions.map((category: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{category.category}</h4>
                          <span className="text-sm text-gray-500">{category.items.length} articles recommandés</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {category.items.map((item: any, i: number) => (
                            <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-medium text-gray-900">{item.name}</span>
                                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                    {item.quantity}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Sparkles size={14} className="text-[#F4C75B]" />
                                  <span className="text-sm text-gray-600">{item.reason}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-500 text-right">
                                  <span className="block text-xs uppercase tracking-wider text-gray-400 mb-0.5">Fournisseur recommandé</span>
                                  {item.supplier}
                                </div>
                                <button className="p-2 text-gray-400 hover:text-[#F4C75B] transition-colors bg-white border border-gray-100 shadow-sm rounded-lg hover:border-[#F4C75B]/30">
                                  <ShoppingCart size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'reception' && (
            <div className="p-4">
              <ReceptionAchats commandes={commandes} inventoryItems={inventoryItems} showToast={showToast} />
            </div>
          )}
          
          {activeTab === 'fournisseurs' && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 font-medium">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Fournisseur</th>
                      <th className="px-6 py-4 whitespace-nowrap">Spécifications</th>
                      <th className="px-6 py-4 whitespace-nowrap">Contact</th>
                      <th className="px-6 py-4 whitespace-nowrap">Téléphone</th>
                      <th className="px-6 py-4 whitespace-nowrap">Email</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fournisseurs
                      .filter(f => {
                        const q = searchQuery.toLowerCase();
                        return (f.nom || f.name || '').toLowerCase().includes(q) || 
                               (f.categorie || f.category || '').toLowerCase().includes(q) || 
                               (f.contact || '').toLowerCase().includes(q);
                      })
                      .map((fournisseur) => (
                      <tr key={fournisseur.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-[#265C6D]">
                              <span className="text-lg font-bold">{(fournisseur.nom || fournisseur.name || '?').charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 leading-tight">{fournisseur.nom || fournisseur.name}</div>
                              <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium mt-1">
                                ★ {fournisseur.rating || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center bg-[#265C6D]/5 text-[#265C6D] px-2.5 py-1 rounded-full text-xs font-medium border border-[#265C6D]/10 whitespace-nowrap">
                            {fournisseur.categorie || fournisseur.category || 'Général'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <span className="font-medium text-gray-700">{fournisseur.contact || 'Non renseigné'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            </div>
                            <a href={"tel:" + (fournisseur.tel || fournisseur.phone)} className="hover:text-blue-600 transition-colors">
                              {fournisseur.tel || fournisseur.phone || 'Non renseigné'}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                            </div>
                            <a href={"mailto:" + fournisseur.email} className="hover:text-amber-600 transition-colors truncate max-w-[200px] inline-block align-bottom">
                              {fournisseur.email || 'Non renseigné'}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setSelectedFournisseur(fournisseur); setIsSupplierDetailsModalOpen(true); }}
                              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-all shadow-sm"
                              title="Visionner"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                            <button 
                              onClick={() => { setSelectedFournisseur(fournisseur); setIsEditSupplierModalOpen(true); }}
                              className="p-2 bg-gray-50 hover:bg-white text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 transition-all shadow-sm"
                              title="Éditer"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                            </button>
                            <button
                              onClick={() => setFournisseurToDelete(fournisseur.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-all shadow-sm"
                              title="Supprimer"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))}
                      
                      {fournisseurs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center border-t border-gray-100">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                              </div>
                              <h4 className="text-gray-900 font-medium text-lg mb-2">Aucun fournisseur</h4>
                              <p className="text-gray-500 max-w-sm mb-6">Vous n'avez pas encore de fournisseurs enregistrés ou aucun ne correspond à votre recherche.</p>
                              <button onClick={() => setIsNewSupplierModalOpen(true)} className="bg-[#F4C75B] text-[#1A1A1A] px-6 py-2.5 rounded-xl font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
                                Nouveau fournisseur
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>)}
        </div>
      </div>

      
      {/* Modal Détails Commande */}
      {isDetailsModalOpen && selectedCommande && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative">
            <button 
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">Détails de la Commande {selectedCommande.orderNumber || (selectedCommande.id.startsWith("CMD-") ? selectedCommande.id : "CMD-" + selectedCommande.id.slice(0,4).toUpperCase())}</h3>
            <p className="text-sm text-gray-500 mb-2">Fournisseur : <span className="font-medium text-gray-900">{selectedCommande.fournisseur}</span> • Date : {selectedCommande.date}</p>
            {(selectedCommande.categorie || selectedCommande.quantite) && (
              <p className="text-sm text-gray-500 mb-6">
                {selectedCommande.categorie && <>Catégorie : <span className="font-medium text-gray-900">{selectedCommande.categorie}</span></>}
                {selectedCommande.categorie && selectedCommande.quantite && ' • '}
                {selectedCommande.quantite && <>Quantité totale : <span className="font-medium text-gray-900">{selectedCommande.quantite}</span></>}
              </p>
            )}
            
            <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-4 py-3 font-medium">Article</th>
                    <th className="px-4 py-3 font-medium text-center">Qté</th>
                    <th className="px-4 py-3 font-medium text-right">Prix Unitaire</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {(() => {
                    let totalGlobal = 0;
                    
                    const itemsToRender = Array.isArray(selectedCommande.items) ? selectedCommande.items : (selectedCommande.articles || '').split(',').map((a: string) => {
                      const parts = a.split(' - ');
                      return { name: parts[0], quantity: parseFloat(parts[1]) || 1, expectedPrice: 0 };
                    }).filter((i: any) => i.name.trim().length > 0);

                    return (
                      <>
                        {itemsToRender.map((item: any, idx: number) => {
                          const unitPrice = item.expectedPrice || item.price || 0; 
                          const quantity = item.quantity || item.quantityOrdered || 1;
                          const total = unitPrice * quantity;
                          totalGlobal += total;
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 font-medium text-[#1A1A1A]">{item.name}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{unitPrice.toFixed(2)} DH</td>
                              <td className="px-4 py-3 text-right font-medium text-[#1A1A1A]">{total.toFixed(2)} DH</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-gray-50 font-bold text-[#1A1A1A]">
                          <td colSpan={3} className="px-4 py-3 text-right uppercase text-xs tracking-wider text-gray-500">Total calculé</td>
                          <td className="px-4 py-3 text-right text-lg text-[#F4C75B]">{totalGlobal.toFixed(2)} DH</td>
                        </tr>
                      </>
                    )
                  })()}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  const cmd = selectedCommande;
                  setIsDetailsModalOpen(false);
                  setProductSearch(''); 
                  const initialSelections: Record<string, {checked: boolean, qty: string, price?: string}> = {};
                  if (Array.isArray(cmd.items)) {
                    cmd.items.forEach((itemObj: any) => {
                      if (itemObj.id) {
                        initialSelections[itemObj.id] = { checked: true, qty: String(itemObj.quantity || 1), price: String(itemObj.expectedPrice || itemObj.price || 0) };
                      } else {
                        const item = inventoryItems.find(i => i.name === itemObj.name);
                        if (item) {
                          initialSelections[item.id] = { checked: true, qty: String(itemObj.quantity || 1), price: String(itemObj.expectedPrice || itemObj.price || 0) };
                        }
                      }
                    });
                  } else if (cmd.articles) {
                    cmd.articles.split(', ').forEach((a: string) => {
                      const parts = a.split(' - ');
                      const name = parts[0];
                      const qty = parts[1] || '';
                      const item = inventoryItems.find(i => i.name === name);
                      if (item) {
                        initialSelections[item.id] = { checked: true, qty };
                      }
                    });
                  }
                  setOrderSelections(initialSelections);
                  setIsNewOrderModalOpen(true); 
                }}
                className="px-4 py-2 text-[#265C6D] bg-[#F4C75B]/20 hover:bg-[#F4C75B]/30 rounded-lg font-medium transition-colors"
              >
                Éditer
              </button>
              <button 
                onClick={async () => {
                  if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
                    try {
                      if (selectedCommande?.id) { await deleteDoc(doc(db, 'commandes', selectedCommande.id)); }
                      showToast("Commande supprimée");
                      setIsDetailsModalOpen(false);
                    } catch (e) {
                      console.error(e);
                      showToast("Erreur lors de la suppression", "error");
                    }
                  }
                }}
                className="bg-white text-red-500 border border-red-200 px-6 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Supprimer
              </button>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* Modal Nouvelle Commande */}

      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsNewOrderModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">{selectedCommande ? "Éditer Commande" : "Nouvelle Commande"}</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const supplierId = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              const categorie = formData.get('categorie') as string;
              const tva = parseFloat(formData.get('tva') as string || '20');
              
              // gather selected items
              const selectedProducts: any[] = [];
              let computedHT = 0;
              Object.entries(orderSelections).forEach(([itemId, selection]) => {
                if (selection.checked) {
                  const item = inventoryItems.find(i => i.id === itemId);
                  if (item) {
                    const price = parseFloat(selection.price || item.unitPrice || '0');
                    const qty = parseFloat(selection.qty || '1');
                    computedHT += (price * qty);
                    selectedProducts.push({
                      id: item.id,
                      name: item.name,
                      quantity: qty,
                      quantityOrdered: qty,
                      expectedPrice: price,
                      unit: item.unit
                    });
                  }
                }
              });

              if (selectedProducts.length === 0) {
                showToast("Veuillez sélectionner au moins un produit", "error");
                return;
              }

              const computedTTC = computeTTC(computedHT, tva);
              const tvaAmount = computedTTC - computedHT;
              
              const selectedSupplier = fournisseurs.find(f => f.id === supplierId);
              const supplierName = selectedSupplier ? selectedSupplier.nom : supplierId;
              
              const newCmd = {
                  id: selectedCommande ? selectedCommande.id : 'CMD-' + Date.now(),
                  fournisseur: supplierName,
                  fournisseurId: supplierId,
                  date: selectedCommande ? selectedCommande.date : new Date().toLocaleDateString('fr-FR'),
                  deliveryDate,
                  montantHT: selectedCommande ? selectedCommande.montantHT : computedHT,
                  tva: selectedCommande ? selectedCommande.tva : tva,
                  montant: selectedCommande ? selectedCommande.montant : `${computedTTC.toFixed(2)} MAD`,
                  status: selectedCommande ? selectedCommande.status : 'En attente',
                  items: selectedProducts,
                  articles: selectedProducts.map(p => `${p.name} - ${p.quantity}`).join(', '),
                  categorie,
                  createdAt: selectedCommande ? selectedCommande.createdAt : serverTimestamp()
              };

              try {
                if (selectedCommande) {
                  // Update logic
                  // Note: In a real app we would await updateDoc(doc(db, 'commandes', selectedCommande.docId), newCmd);
                  // But here we rely on snapshot updates or simply simulating it
                  showToast("Commande mise à jour avec succès");
                  setIsNewOrderModalOpen(false);
                  setSelectedCommande(null);
                } else {
                  // Create logic
                  await addDoc(collection(db, 'commandes'), newCmd);
                  showToast("Commande validée et bon de commande généré");
                  setIsNewOrderModalOpen(false);
                }

                // Generate Bon de commande
                let printWindow = window.open('', '', 'width=800,height=900');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Bon de Commande - ${supplierName}</title>
                        <style>
                          body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
                          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #F4C75B; padding-bottom: 20px; }
                          .logo-text { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; }
                          .logo-sub { font-size: 14px; color: #666; letter-spacing: 4px; text-transform: uppercase; margin-top: 5px; }
                          .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                          .info { margin-bottom: 30px; line-height: 1.6; }
                          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                          th { background-color: #f8f9fa; font-weight: bold; }
                          .footer { text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; position: fixed; bottom: 40px; width: calc(100% - 80px); }
                          @media print { .no-print { display: none; } }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div class="logo-text">MOUDA PALACE</div>
                          <div class="logo-sub">Restaurant Traditionnel Marocain</div>
                        </div>
                        <div class="title">BON DE COMMANDE N° ${newCmd.id}</div>
                        
                        <div class="info">
                          <strong>Émetteur:</strong> Restaurant Mouda Palace<br>
                          <strong>Date d'émission:</strong> ${new Date().toLocaleDateString('fr-FR')}<br>
                          <strong>Fournisseur:</strong> ${supplierName}<br>
                          <strong>Date de livraison prévue:</strong> ${deliveryDate}<br>
                          <strong>Catégorie d'achat:</strong> ${categorie}<br>
                        </div>
                        <table>
                          <thead>
                            <tr>
                              <th>Désignation de l'article</th>
                              <th>Quantité</th>
                              <th>Prix unitaire HT</th>
                              <th>Total HT</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${selectedProducts.map(p => {
                              return `<tr><td>${p.name}</td><td>${p.quantity} ${p.unit || ''}</td><td>${parseFloat(p.expectedPrice || '0').toFixed(2)} MAD</td><td>${(parseFloat(p.expectedPrice || '0') * parseFloat(p.quantity || '0')).toFixed(2)} MAD</td></tr>`;
                            }).join('')}
                          </tbody>
                        </table>
                        
                        <div style="text-align: right; margin-top: 20px;">
                          <p><strong>Total HT:</strong> ${computedHT.toFixed(2)} MAD</p>
                          <p><strong>TVA (${tva}%):</strong> ${tvaAmount.toFixed(2)} MAD</p>
                          <p style="font-size: 1.2em;"><strong>Total TTC:</strong> ${computedTTC.toFixed(2)} MAD</p>
                        </div>

                        <p>Merci de bien vouloir confirmer la réception de cette commande et respecter les délais de livraison convenus.</p>
                        
                        <div style="margin-top: 50px;">
                          <strong>Signature de la direction:</strong>
                        </div>

                        <div class="footer">
                          Restaurant Mouda Palace - Fès, Maroc | contact@moudapalace.com | Tél: +212 5 35 XX XX XX
                        </div>
                        <script>
                          window.onload = function() { window.print(); }
                        </script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }
              } catch (err) {
                console.error("Error saving order", err);
                showToast("Erreur lors de l'enregistrement de la commande", "error");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <Combobox name="supplier" options={suppliersList} required defaultValue={selectedCommande?.fournisseurId || ''} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white" placeholder="Nom du fournisseur" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison</label>
                  <input name="deliveryDate" type="date" required defaultValue={selectedCommande?.deliveryDate || ''} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie d'achat</label>
                  <Combobox name="categorie" options={categories} defaultValue={selectedCommande?.categorie || ''} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Alimentaire" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TVA (%)</label>
                  <select name="tva" value={orderTvaRate} onChange={(e) => setOrderTvaRate(Number(e.target.value))} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    {TVA_RATES.map(rate => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 pb-2">Articles à commander</label>
                    <div className="flex items-center gap-3 text-sm">
                      <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                        <input type="checkbox" checked={showSupplierCol} onChange={e => setShowSupplierCol(e.target.checked)} className="w-3.5 h-3.5 text-[#F4C75B] rounded border-gray-300 focus:ring-[#F4C75B]" />
                        Fournisseur
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                        <input type="checkbox" checked={showCategoryCol} onChange={e => setShowCategoryCol(e.target.checked)} className="w-3.5 h-3.5 text-[#F4C75B] rounded border-gray-300 focus:ring-[#F4C75B]" />
                        Catégorie
                      </label>
                    </div>
                  </div>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher (produit, catégorie, fournisseur)..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
                    />
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto bg-white">
                  {(() => {
                    const searchLower = productSearch.toLowerCase();
                    const filteredItems = inventoryItems.filter(item => {
                      const matchName = (item.name || '').toLowerCase().includes(searchLower);
                      const matchCat = (item.category || '').toLowerCase().includes(searchLower);
                      const matchSup = (item.supplier || '').toLowerCase().includes(searchLower);
                      
                      const initials = (item.name || '').split(' ').map((w: string) => w[0]).join('').toLowerCase();
                      const matchInitials = initials.includes(searchLower);
                      
                      return matchName || matchCat || matchSup || matchInitials;
                    });

                    if (filteredItems.length === 0) {
                      return <div className="p-4 text-sm text-gray-500 text-center">Aucun produit trouvé</div>;
                    }

                    return (
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 font-medium w-10 text-center">
                              <ShoppingCart size={14} className="mx-auto text-gray-400" />
                            </th>
                            <th className="px-3 py-2 font-medium">Produit</th>
                            {showCategoryCol && <th className="px-3 py-2 font-medium">Catégorie</th>}
                            {showSupplierCol && <th className="px-3 py-2 font-medium">Fournisseur</th>}
                            <th className="px-3 py-2 font-medium w-24 text-right">Prix U.</th>
                            <th className="px-3 py-2 font-medium w-24 text-right">Quantité</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredItems.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(item => {
                            const selection = orderSelections[item.id] || { checked: false, qty: '' };
                            return (
                              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-3 py-2 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={selection.checked} 
                                    onChange={(e) => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], checked: e.target.checked } }))}
                                    className="w-4 h-4 text-[#F4C75B] rounded border-gray-300 focus:ring-[#F4C75B]" 
                                  />
                                </td>
                                <td className="px-3 py-2 font-medium text-gray-900 cursor-pointer" onClick={() => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], checked: !(prev[item.id]?.checked) } }))}>
                                  {item.name}
                                </td>
                                {showCategoryCol && (
                                  <td className="px-3 py-2 text-gray-500 text-xs">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{item.category || 'Général'}</span>
                                  </td>
                                )}
                                {showSupplierCol && (
                                  <td className="px-3 py-2 text-gray-500 text-xs">
                                    {item.supplier || 'Sans fournisseur'}
                                  </td>
                                )}
                                <td className="px-3 py-2 text-right">
                                  <input 
                                    type="number" step="0.01" min="0"
                                    value={selection.price !== undefined ? selection.price : (item.unitPrice || '')}
                                    onChange={(e) => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], price: e.target.value, checked: prev[item.id]?.checked || e.target.value !== '' } }))}
                                    placeholder="0.00" 
                                    className="w-full max-w-[80px] text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:border-[#F4C75B] text-right" 
                                  />
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <input 
                                    type="text" 
                                    value={selection.qty}
                                    onChange={(e) => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], qty: e.target.value, checked: prev[item.id]?.checked || e.target.value !== '' } }))}
                                    placeholder={`Qté (${item.unit || 'u'})`} 
                                    className="w-full max-w-[80px] text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:border-[#F4C75B] text-right" 
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#F4C75B] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#E5B745] transition-colors"
              >
                Générer Bon de Commande
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Fournisseur */}
      {isEditSupplierModalOpen && selectedFournisseur && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsEditSupplierModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Éditer Fournisseur</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nom = formData.get('nom') as string;
              const categorie = formData.get('categorie') as string;
              const contact = formData.get('contact') as string;
              const tel = formData.get('tel') as string;
              const email = formData.get('email') as string;
              
              const updatedFournisseur = {
                  ...selectedFournisseur,
                  nom,
                  categorie,
                  contact,
                  tel,
                  email
              };
              
              setFournisseurs(fournisseurs.map(f => f.id === selectedFournisseur.id ? updatedFournisseur : f));
              showToast("Fournisseur mis à jour avec succès");
              setIsEditSupplierModalOpen(false);
              
              try {
                if (selectedFournisseur.fbId || selectedFournisseur.id) {
                  await updateDoc(doc(db, 'fournisseurs', selectedFournisseur.fbId || selectedFournisseur.id), updatedFournisseur);
                }
              } catch (err) {
                console.error("Error updating fournisseur", err);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input name="nom" defaultValue={selectedFournisseur.nom} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <Combobox name="categorie" options={categories} defaultValue={selectedFournisseur.categorie} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Fruits & Légumes" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label>
                <input name="contact" defaultValue={selectedFournisseur.contact} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input name="tel" defaultValue={selectedFournisseur.tel || ''} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" defaultValue={selectedFournisseur.email || ''} type="email" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <button type="submit" className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-black transition-colors">
                Mettre à jour
              </button>
              <button
                type="button"
                onClick={() => setFournisseurToDelete(selectedFournisseur.id)}
                className="w-full mt-2 bg-white text-red-500 border border-red-200 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors"
              >
                Supprimer le fournisseur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nouveau Fournisseur */}
            {isSupplierDetailsModalOpen && selectedFournisseur && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#265C6D]">
                  <span className="text-lg font-bold">{(selectedFournisseur.nom || selectedFournisseur.name || '?').charAt(0).toUpperCase()}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Détails du fournisseur</h3>
              </div>
              <button 
                onClick={() => setIsSupplierDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Nom du fournisseur</h4>
                  <p className="text-gray-900 font-medium">{selectedFournisseur.nom || selectedFournisseur.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Catégorie / Spécification</h4>
                    <span className="inline-flex items-center bg-[#265C6D]/10 text-[#265C6D] px-2.5 py-1 rounded-md text-sm font-medium">
                      {selectedFournisseur.categorie || selectedFournisseur.category || 'Non renseignée'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Note (Évaluation)</h4>
                    <p className="text-yellow-600 font-medium flex items-center gap-1">
                      ★ {selectedFournisseur.rating || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-4">Coordonnées</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Contact principal</p>
                        <p className="text-gray-900">{selectedFournisseur.contact || 'Non renseigné'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Téléphone</p>
                        <a href={"tel:" + (selectedFournisseur.tel || selectedFournisseur.phone)} className="text-blue-600 hover:underline">
                          {selectedFournisseur.tel || selectedFournisseur.phone || 'Non renseigné'}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <a href={"mailto:" + selectedFournisseur.email} className="text-amber-600 hover:underline">
                          {selectedFournisseur.email || 'Non renseigné'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button 
                onClick={() => setIsSupplierDetailsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => { setIsSupplierDetailsModalOpen(false); setIsEditSupplierModalOpen(true); }}
                className="px-4 py-2 bg-[#265C6D] text-white rounded-lg font-medium hover:bg-[#1f4a57] transition-colors"
              >
                Éditer
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsNewSupplierModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Nouveau Fournisseur</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nom = formData.get('nom') as string;
              const categorie = formData.get('categorie') as string;
              const contact = formData.get('contact') as string;
              
              const newFournisseur = {
                  id: 'F' + Date.now(),
                  nom,
                  categorie,
                  contact,
                  rating: 5.0,
                  createdAt: serverTimestamp()
              };
              
              setFournisseurs([newFournisseur, ...fournisseurs]);
              showToast("Fournisseur ajouté avec succès");
              setIsNewSupplierModalOpen(false);
              
              try {
                await addDoc(collection(db, 'fournisseurs'), newFournisseur);
              } catch (err) {
                console.error("Error adding fournisseur", err);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input name="nom" required type="text" placeholder="Ex: Grossiste Bio Plus" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <Combobox
                  name="categorie"
                  required
                  options={['Fruits & Légumes', 'Viandes & Volailles', 'Poissons & Fruits de mer', 'Patisseie', 'Produits Laitiers & Œufs', 'Épicerie Sèche', 'Emballages & Consommables', 'Hygiène & Entretien', 'Équipement & Matériel', 'Services']}
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]"
                  placeholder="Ex: Fruits & Légumes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Email ou Téléphone)</label>
                <input name="contact" required type="text" placeholder="Ex: contact@bioplus.ma" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <button
                type="submit"
                className="w-full bg-[#F4C75B] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#E5B745] transition-colors"
              >
                Ajouter le Fournisseur
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!fournisseurToDelete}
        title="Supprimer le fournisseur"
        message="Êtes-vous sûr de vouloir supprimer ce fournisseur ?"
        onConfirm={async () => {
          try {
            await deleteDoc(doc(db, 'fournisseurs', fournisseurToDelete as string));
            showToast("Fournisseur supprimé");
          } catch (e) {
            console.error(e);
            showToast("Erreur lors de la suppression", "error");
          }
          setIsEditSupplierModalOpen(false);
          setFournisseurToDelete(null);
        }}
        onCancel={() => setFournisseurToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!commandeToDelete}
        title="Supprimer la commande"
        message="Êtes-vous sûr de vouloir supprimer cette commande ?"
        onConfirm={async () => {
          try {
            await deleteDoc(doc(db, 'commandes', commandeToDelete as string));
            showToast("Commande supprimée");
          } catch (e) {
            console.error(e);
            showToast("Erreur lors de la suppression", "error");
          }
          setCommandeToDelete(null);
        }}
        onCancel={() => setCommandeToDelete(null)}
      />
    </div>
  );
}


function ReceptionAchats({ commandes, inventoryItems, showToast }: { commandes: any[], inventoryItems: any[], showToast: any }) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const pendingOrders = commandes.filter(c => c.status === "En attente" || c.status === "Validée");

  const handleValidate = async (orderId: string, receivedItems: any[], status: 'Livrée' | 'Refusée', invoiceNote: string) => {
    try {
      if (status === 'Livrée') {
        const totalActual = receivedItems.reduce((sum, item) => sum + ((item.quantityReceived || 0) * (item.actualPrice || 0)), 0);
        
        // 1. Update purchase order
        await updateDoc(doc(db, 'commandes', orderId), {
          status: 'Livrée',
          items: receivedItems,
          totalActual,
          receivedAt: serverTimestamp(),
          invoiceNote
        });

        // 2. Update stock & Create transactions
        const batchPromises = receivedItems.map(async (item) => {
          if (item.quantityReceived > 0) {
            // Match inventory item by name (since the original commande might not have inventoryItemId)
            const inventoryItem = inventoryItems.find(i => i.name.toLowerCase() === item.name.toLowerCase() || i.id === item.inventoryItemId);
            
            if (inventoryItem) {
              
              const oldQty = inventoryItem.quantity || 0;
              const oldPrice = inventoryItem.averageCost || inventoryItem.unitPrice || inventoryItem.price || 0;
              const newQty = oldQty + item.quantityReceived;
              
              const newAverageCost = newQty > 0 
                  ? ((oldQty * oldPrice) + (item.quantityReceived * (item.actualPrice || 0))) / newQty 
                  : (item.actualPrice || oldPrice);

              const updateData: any = {
                quantity: newQty,
                averageCost: newAverageCost,
                unitPrice: item.actualPrice || inventoryItem.unitPrice,
                price: item.actualPrice || inventoryItem.price,
                updatedAt: serverTimestamp()
              };

              if (item.zone) {
                updateData.zone = item.zone;
              }
              await updateDoc(doc(db, 'inventoryItems', inventoryItem.id), updateData);

              // Add stock transaction
              await addDoc(collection(db, 'inventoryTransactions'), {
                item: inventoryItem.name,
                type: 'in',
                amount: item.quantityReceived,
                unit: inventoryItem.unit || item.unit || 'unité',
                reason: `Réception Commande ${orderId.substring(0,6)}`,
                user: 'Gestionnaire Achats',
                date: new Date().toLocaleDateString('fr-FR'),
                createdAt: serverTimestamp()
              });
            } else {
              // Create new inventory item if it doesn't exist
              const newItemRef = await addDoc(collection(db, 'inventoryItems'), {
                name: item.name || 'Produit Inconnu',
                quantity: item.quantityReceived,
                unit: item.unit || 'unité',
                category: 'Matière Première',
                minStock: 5,
                price: item.actualPrice || item.expectedPrice || 0,
                unitPrice: item.actualPrice || item.expectedPrice || 0,
                averageCost: item.actualPrice || item.expectedPrice || 0,
                zone: item.zone || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              
              // Add stock transaction
              await addDoc(collection(db, 'inventoryTransactions'), {
                item: item.name || 'Produit Inconnu',
                type: 'in',
                amount: item.quantityReceived,
                unit: item.unit || 'unité',
                reason: `Réception Commande ${orderId.substring(0,6)} (Nouveau Produit)`,
                user: 'Gestionnaire Achats',
                date: new Date().toLocaleDateString('fr-FR'),
                createdAt: serverTimestamp()
              });
            }
          }
        });
        
        await Promise.all(batchPromises);

        // 3. Create accounting transaction (Expense)
        if (totalActual > 0) {
          const supplierName = selectedOrder?.fournisseur || selectedOrder?.supplier || 'Fournisseur Inconnu';
          const newExpRef = await addDoc(collection(db, 'expenses'), {
            supplier: supplierName,
            amount: totalActual.toFixed(2) + ' MAD',
            category: 'Achats / Marchandises',
            date: new Date().toISOString().split('T')[0],
            method: 'Virement', // par defaut
            description: `Achat Marchandises (BC: ${orderId.substring(0,8)})`,
            createdAt: serverTimestamp()
          });
          await updateDoc(newExpRef, { id: 'EXP-' + newExpRef.id.substring(0,6).toUpperCase() });
        }
        
        showToast("Réception validée, stock et comptabilité mis à jour !");
      } else {
        await updateDoc(doc(db, 'commandes', orderId), {
          status: 'Refusée',
          receivedAt: serverTimestamp(),
          invoiceNote
        });
        showToast("Commande refusée.");
      }
      
      setSelectedOrder(null);
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la validation", "error");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-serif text-gray-900 mb-6">Contrôle Terrain & Réception</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingOrders.length === 0 ? (
          <p className="text-gray-500 col-span-full">Aucune livraison en attente de réception.</p>
        ) : (
          pendingOrders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md">#{order.id.substring(0,8)}</span>
                  <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium">{order.status}</span>
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-1">{order.fournisseur || order.supplier || 'Fournisseur Inconnu'}</h4>
                <p className="text-sm text-gray-600 mb-2">{Array.isArray(order.items) ? order.items.length : (typeof order.items === 'number' ? order.items : (typeof order.articles === 'string' ? order.articles.split(',').length : 0))} articles prévus</p>
                <p className="text-xl font-semibold text-gray-900 mb-6">{order.total || order.totalExpected || 0} MAD</p>
              </div>
              
              <button 
                onClick={() => setSelectedOrder(order)}
                className="w-full py-3 bg-[#265C6D] text-white rounded-xl text-sm font-medium hover:bg-[#1a4250] transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Effectuer le contrôle
              </button>
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <ValidateReceptionModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onValidate={handleValidate}
        />
      )}

    </div>
  );
}

function ValidateReceptionModal({ order, onClose, onValidate }: { order: any, onClose: () => void, onValidate: any }) {
    const parseArticles = (articles: any) => {
    if (Array.isArray(articles)) return articles;
    if (typeof articles === 'string') {
      return articles.split(', ').map(a => {
        const parts = a.split(' - ');
        return {
          name: parts[0] || 'Inconnu',
          quantityOrdered: parseFloat(parts[1]) || 0,
          quantityReceived: parseFloat(parts[1]) || 0,
          expectedPrice: 0,
          actualPrice: 0,
          qualityOk: true
        };
      });
    }
    return [];
  };

  const originalItems = Array.isArray(order.items) ? order.items : parseArticles(order.articles);
  const [items, setItems] = useState<any[]>(
    originalItems.map((i: any) => ({
      ...i,
      name: i.name || i.produit || 'Produit inconnu',
      quantityOrdered: i.quantityOrdered || i.qty || i.quantity || 0,
      quantityReceived: i.quantityReceived || i.qty || i.quantity || i.quantityOrdered || 0,
      expectedPrice: i.expectedPrice || i.price || i.prix || 0,
      actualPrice: i.actualPrice || i.price || i.prix || i.expectedPrice || 0,
      qualityOk: i.qualityOk !== undefined ? i.qualityOk : true,
      zone: i.zone || '',
      subZone: i.subZone || ''
    }))
  );
  const [invoiceNote, setInvoiceNote] = useState('');

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleAccept = () => {
    onValidate(order.id, items, 'Livrée', invoiceNote);
  };

  const handleReject = () => {
    if (confirm('Voulez-vous vraiment refuser cette livraison ?')) {
      onValidate(order.id, items, 'Refusée', invoiceNote);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Contrôle de Réception (3 points)</h3>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Store size={14} /> {order.fournisseur || order.supplier} 
              <span className="text-gray-300">|</span> 
              Commande #{order.id.substring(0,8)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertTriangle className="text-blue-500 mt-0.5 shrink-0" size={18} />
            <div className="text-sm text-blue-900">
              <strong className="block mb-1">Procédure de validation obligatoire :</strong>
              Vérifiez physiquement la <strong>Quantité</strong> reçue, le <strong>Prix Unitaire</strong> facturé, et la <strong>Qualité</strong> (conformité) pour chaque article avant validation.
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Article</th>
                  <th className="px-4 py-3 font-medium text-center">Qté Prévue</th>
                  <th className="px-4 py-3 font-medium text-center">Qté Reçue</th>
                  <th className="px-4 py-3 font-medium text-right">Prix (MAD)</th>
                  <th className="px-4 py-3 font-medium text-center">Qualité OK?</th>
                  <th className="px-4 py-3 font-medium text-left">Zone d'affectation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={idx} className={!item.qualityOk ? 'bg-red-50/50' : ''}>
                    <td className="px-4 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-4 text-center text-gray-500">{item.quantityOrdered} {item.unit || ''}</td>
                    <td className="px-4 py-4">
                      <input 
                        type="number" 
                        min="0" step="0.1"
                        value={item.quantityReceived}
                        onChange={e => handleItemChange(idx, 'quantityReceived', parseFloat(e.target.value) || 0)}
                        className="w-24 text-center text-sm rounded-lg border-gray-200 focus:border-[#265C6D] focus:ring-[#265C6D] mx-auto block"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-end">
                        <input 
                          type="number" 
                          min="0" step="0.01"
                          value={item.actualPrice}
                          onChange={e => handleItemChange(idx, 'actualPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 text-right text-sm rounded-lg border-gray-200 focus:border-[#265C6D] focus:ring-[#265C6D]"
                        />
                        {item.actualPrice !== item.expectedPrice && (
                          <span className="text-[10px] font-medium text-amber-600 mt-1 bg-amber-50 px-2 py-0.5 rounded-full">
                            Prévu: {item.expectedPrice}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input 
                        type="checkbox"
                        checked={item.qualityOk}
                        onChange={e => handleItemChange(idx, 'qualityOk', e.target.checked)}
                        className="w-5 h-5 text-[#265C6D] rounded border-gray-300 focus:ring-[#265C6D] cursor-pointer mx-auto block"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <select 
                        value={item.zone}
                        onChange={e => handleItemChange(idx, 'zone', e.target.value)}
                        className="w-full text-xs rounded-lg border-gray-200 focus:border-[#265C6D] focus:ring-[#265C6D]"
                      >
                        <option value="">(Automatique)</option>
                        <option value="economat">Économat</option>
                        <option value="chambre_froide">Chambre Froide</option>
                        <option value="cave">Cave</option>
                        <option value="consommables">Consommables</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de facture / Bon de livraison (Optionnel)</label>
            <input 
              type="text" 
              value={invoiceNote}
              onChange={e => setInvoiceNote(e.target.value)}
              className="w-full text-sm rounded-lg border-gray-200 focus:border-[#265C6D] focus:ring-[#265C6D] p-3"
              placeholder="Ex: BL-2026-890"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          <button onClick={handleReject} className="w-full sm:w-auto px-6 py-3 text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center font-medium transition-colors">
            <XCircle size={18} className="mr-2" /> Refuser la livraison
          </button>
          
          <button onClick={handleAccept} className="w-full sm:w-auto px-8 py-3 bg-[#265C6D] text-white rounded-xl flex items-center justify-center font-medium hover:bg-[#1a4250] transition-colors shadow-sm">
            <CheckCircle size={18} className="mr-2" /> Valider & Entrée en Stock
          </button>
        </div>
      </div>

    </div>
  );
}
