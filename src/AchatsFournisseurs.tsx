import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, ShoppingCart, Truck, FileText, CheckCircle, Clock, AlertTriangle, ChevronRight, Store, X, Sparkles, Brain, TrendingUp, Loader2, Calendar } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function AchatsFournisseurs() {
  const [activeTab, setActiveTab] = useState<'commandes' | 'fournisseurs' | 'previsions'>('commandes');
  const [isGeneratingPrevisions, setIsGeneratingPrevisions] = useState(false);
  const [previsions, setPrevisions] = useState<any>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [selectedCommande, setSelectedCommande] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleGeneratePrevisions = () => {
    setIsGeneratingPrevisions(true);
    setTimeout(() => {
      setIsGeneratingPrevisions(false);
      showToast("Prévisions générées avec succès ! (Simulation)");
    }, 1500);
  };
  
  const [commandes, setCommandes] = useState<any[]>([]);
    const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubCommandes = onSnapshot(query(collection(db, 'commandes'), orderBy('createdAt', 'desc')), (snapshot) => {
      setCommandes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      console.error("Error fetching commandes", error);
      showToast("Erreur lors de la récupération des commandes");
    });

    const unsubFournisseurs = onSnapshot(query(collection(db, 'fournisseurs'), orderBy('createdAt', 'desc')), (snapshot) => {
      setFournisseurs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching fournisseurs", error);
      showToast("Erreur lors de la récupération des fournisseurs");
      setLoading(false);
    });

  
  const handleGeneratePrevisions = () => {
    setIsGeneratingPrevisions(true);
    setTimeout(() => {
      setPrevisions([
        {
          category: 'Produits Frais',
          items: [
            { name: 'Tomates (Catégorie 1)', quantity: '50 kg', supplier: 'Marché Central', reason: 'Forte demande prévue pour les salades (Hausse de 20% des réservations)' },
            { name: 'Poulet Fermier', quantity: '120 kg', supplier: 'Ferme Atlas', reason: 'Menu spécial du weekend' },
            { name: 'Saumon Frais', quantity: '30 kg', supplier: 'Marée Bleue', reason: 'Stock actuel critique (Reste 5 kg)' }
          ]
        },
        {
          category: 'Épicerie & Secs',
          amount: '15 items',
          items: [
            { name: 'Riz Basmati', quantity: '100 kg', supplier: 'Atlas Food', reason: 'Réapprovisionnement mensuel optimal' },
            { name: 'Huile d\'olive extra vierge', quantity: '40 L', supplier: 'Huileries du Sud', reason: 'Consommation accrue observée' }
          ]
        },
        {
          category: 'Boissons',
          amount: '8 items',
          items: [
            { name: 'Eau Minérale (Plate)', quantity: '200 packs', supplier: 'Distributeur Boissons', reason: 'Prévision de fortes chaleurs cette semaine' },
            { name: 'Jus d\'orange frais', quantity: '50 L', supplier: 'Marché Central', reason: 'Consommation matinale au buffet en hausse' }
          ]
        }
      ]);
      setIsGeneratingPrevisions(false);
      showToast('Prévisions générées avec succès par l\'IA');
    }, 2500);
  };

  return () => {
      unsubCommandes();
      unsubFournisseurs();
    };
  }, []);



  const updateOrderStatus = async (cmdId: string, newStatus: string) => {
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
          <button onClick={() => setIsNewOrderModalOpen(true)} className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-[#C89845] transition-colors shadow-sm">
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
        <div className="border-b border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('commandes')}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'commandes' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Bons de commande
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
              <Sparkles size={16} className={activeTab === 'previsions' ? 'text-[#DDA956]' : 'text-gray-400'} />
              Prévisions
            </button>
          </div>
          
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DDA956] focus:border-transparent"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {activeTab === 'commandes' && (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">N° Commande</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Fournisseur</th>
                  <th className="px-6 py-4 font-medium">Articles</th>
                  <th className="px-6 py-4 font-medium text-right">Montant</th>
                  <th className="px-6 py-4 font-medium text-center">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {commandes.map((cmd) => (
                  <tr key={cmd.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A1A1A] flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      {cmd.orderNumber || (cmd.id.startsWith("CMD-") ? cmd.id : "CMD-" + cmd.id.slice(0,4).toUpperCase())}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cmd.date}</td>
                    <td className="px-6 py-4 text-[#1A1A1A] font-medium">{cmd.fournisseur}</td>
                    <td className="px-6 py-4 text-gray-600">{cmd.items} articles</td>
                    <td className="px-6 py-4 text-right font-medium">{cmd.montant}</td>
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
                          className="text-[#DDA956] hover:text-[#C89845] font-medium text-sm flex items-center justify-end gap-1">
Détails <ChevronRight size={16} />
</button>
<button onClick={() => { setSelectedCommande(cmd); setIsEditOrderModalOpen(true); }} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Éditer</button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('Voulez-vous vraiment supprimer cette commande ?')) {
                              try {
                                if (cmd.id) {
                                  await deleteDoc(doc(db, 'commandes', cmd.id));
                                } else {
                                  setCommandes(prev => prev.filter(c => c.id !== cmd.id));
                                }
                                showToast("Commande supprimée");
                              } catch (e) {
                                console.error(e);
                                showToast("Erreur lors de la suppression", "error");
                              }
                            }
                          }}
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
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#DDA956]/10 rounded-full blur-3xl"></div>
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#DDA956]/10 flex items-center justify-center">
                      <Brain className="text-[#DDA956]" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif text-[#1A1A1A]">Prévisions d'Achats Intelligentes</h2>
                      <p className="text-gray-500 mt-1">Générées par l'IA de Mouda Palace</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed relative z-10">
                    L'intelligence artificielle analyse en temps réel l'état de vos stocks, l'historique de consommation des 3 derniers mois, ainsi que les réservations et événements prévus pour la semaine à venir afin de vous proposer une liste d'achats optimisée.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <TrendingUp className="text-blue-500" size={20} />
                      <div className="text-sm">
                        <span className="block text-gray-500">Tendance Réservations</span>
                        <span className="font-medium text-gray-900">+15% vs semaine dernière</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <Calendar className="text-emerald-500" size={20} />
                      <div className="text-sm">
                        <span className="block text-gray-500">Période d'analyse</span>
                        <span className="font-medium text-gray-900">Prochains 7 jours</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <AlertTriangle className="text-amber-500" size={20} />
                      <div className="text-sm">
                        <span className="block text-gray-500">Stocks bas détectés</span>
                        <span className="font-medium text-gray-900">12 articles critiques</span>
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
                    <button className="text-sm bg-[#DDA956]/10 text-[#DDA956] hover:bg-[#DDA956]/20 px-4 py-2 rounded-lg font-medium transition-colors">
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
                                  <Sparkles size={14} className="text-[#DDA956]" />
                                  <span className="text-sm text-gray-600">{item.reason}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-500 text-right">
                                  <span className="block text-xs uppercase tracking-wider text-gray-400 mb-0.5">Fournisseur recommandé</span>
                                  {item.supplier}
                                </div>
                                <button className="p-2 text-gray-400 hover:text-[#DDA956] transition-colors bg-white border border-gray-100 shadow-sm rounded-lg hover:border-[#DDA956]/30">
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

          {activeTab === 'fournisseurs' && (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Fournisseur</th>
                  <th className="px-6 py-4 font-medium">Catégorie</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Téléphone</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium text-center">Évaluation</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {fournisseurs.map((fournisseur) => (
                  <tr key={fournisseur.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A1A1A]">{fournisseur.nom}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs border border-gray-200">
                        {fournisseur.categorie}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{fournisseur.contact}</td>
                    <td className="px-6 py-4 text-gray-600">{fournisseur.tel}</td>
                    <td className="px-6 py-4 text-gray-600">{fournisseur.email}</td>
                    <td className="px-6 py-4 text-center text-yellow-500 font-medium flex justify-center items-center gap-1">
                      ★ {fournisseur.rating}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <button 
                          onClick={() => { setSelectedFournisseur(fournisseur); setIsEditSupplierModalOpen(true); }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Éditer
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
                              try {
                                if (fournisseur.id) {
                                  await deleteDoc(doc(db, 'fournisseurs', fournisseur.id));
                                } else {
                                  setFournisseurs(prev => prev.filter(f => f.id !== fournisseur.id));
                                }
                                showToast("Fournisseur supprimé");
                              } catch (e) {
                                console.error(e);
                                showToast("Erreur lors de la suppression", "error");
                              }
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-medium text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                    const articlesList = (selectedCommande.articles || '').split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0);
                    let totalGlobal = 0;
                    return (
                      <>
                        {articlesList.map((article: string, idx: number) => {
                          // Génération d'un prix unitaire mocké basé sur le nom de l'article pour avoir des données cohérentes
                          const unitPrice = (article.length * 5.5) + 15; 
                          const quantity = 1;
                          const total = unitPrice * quantity;
                          totalGlobal += total;
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 font-medium text-[#1A1A1A]">{article}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{unitPrice.toFixed(2)} DH</td>
                              <td className="px-4 py-3 text-right font-medium text-[#1A1A1A]">{total.toFixed(2)} DH</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-gray-50 font-bold text-[#1A1A1A]">
                          <td colSpan={3} className="px-4 py-3 text-right uppercase text-xs tracking-wider text-gray-500">Total calculé</td>
                          <td className="px-4 py-3 text-right text-lg text-[#DDA956]">{totalGlobal.toFixed(2)} DH</td>
                        </tr>
                      </>
                    )
                  })()}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={async () => {
                  if (window.confirm('Voulez-vous vraiment supprimer cette commande ?')) {
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

      
      {/* Modal Éditer Commande */}
      {isEditOrderModalOpen && selectedCommande && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsEditOrderModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Éditer Commande</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const supplierId = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              
              // gather selected items
              const selectedProducts: string[] = [];
              document.querySelectorAll('.product-checkbox:checked').forEach((el: any) => {
                const qtyInput = document.getElementById(`qty-${el.value}`) as HTMLInputElement;
                selectedProducts.push(`${el.dataset.name} - ${qtyInput?.value || '1'}`);
              });

              if (selectedProducts.length === 0) {
                showToast("Veuillez sélectionner au moins un produit", "error");
                return;
              }

              const articles = selectedProducts.join(', ');
              
              const selectedSupplier = fournisseurs.find(f => f.id === supplierId);
              const supplierName = selectedSupplier ? selectedSupplier.nom : supplierId;

              const newCmd = {
                  id: 'CMD-' + Date.now(),
                  fournisseur: supplierName,
                  fournisseurId: supplierId,
                  date: new Date().toLocaleDateString('fr-FR'),
                  deliveryDate,
                  montant: '0 MAD',
                  status: 'En attente',
                  items: selectedProducts.length,
                  articles,
                  categorie: 'Multi-catégories',
                  createdAt: serverTimestamp()
              };
              
              setIsNewOrderModalOpen(false);
              showToast("Génération du bon de commande...");

              try {
                await addDoc(collection(db, 'commandes'), newCmd);

                // Generate HTML content for the Bon de Commande
                let printWindow = window.open('', '', 'width=800,height=900');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Bon de Commande - ${supplierName}</title>
                        <style>
                          body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
                          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #DDA956; padding-bottom: 20px; }
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
                        </div>

                        <table>
                          <thead>
                            <tr>
                              <th>Désignation de l'article</th>
                              <th>Quantité</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${selectedProducts.map(p => {
                              const parts = p.split(' - ');
                              return `<tr><td>${parts[0]}</td><td>${parts[1] || ''}</td></tr>`;
                            }).join('')}
                          </tbody>
                        </table>

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
                console.error("Error adding order", err);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select name="supplier" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option value="">Sélectionnez un fournisseur</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison prévue</label>
                <input name="deliveryDate" type="date" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Articles à commander</label>
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100 bg-gray-50/50">
                  {inventoryItems.map(item => (
                    <div key={item.id} className="p-3 hover:bg-white transition-colors flex items-center justify-between gap-3">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input type="checkbox" value={item.id} data-name={item.name} className="product-checkbox w-4 h-4 text-[#DDA956] rounded border-gray-300 focus:ring-[#DDA956]" />
                        <span className="text-sm font-medium text-gray-900">{item.name} <span className="text-xs text-gray-500 font-normal ml-1">({item.category || 'Général'})</span></span>
                      </label>
                      <input type="text" id={`qty-${item.id}`} placeholder={`Qté (${item.unit || 'u'})`} className="w-24 text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:border-[#DDA956]" />
                    </div>
                  ))}
                  {inventoryItems.length === 0 && (
                     <div className="p-4 text-sm text-gray-500 text-center">Aucun produit dans l'inventaire</div>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Générer Bon de Commande
              </button>
            </form>
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
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Nouvelle Commande</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const supplierId = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              const articles = formData.get('articles') as string;
              const quantite = formData.get('quantite') as string;
              const categorie = formData.get('categorie') as string;
              
              const selectedSupplier = fournisseurs.find(f => f.id === supplierId);
              const supplierName = selectedSupplier ? selectedSupplier.nom : supplierId;

              const newCmd = {
                  id: 'CMD-' + Date.now(),
                  fournisseur: supplierName,
                  fournisseurId: supplierId,
                  date: new Date().toLocaleDateString('fr-FR'),
                  deliveryDate,
                  montant: '0 MAD',
                  status: 'En attente',
                  items: articles.split(',').length,
                  articles,
                  quantite,
                  categorie,
                  createdAt: serverTimestamp()
              };

              setCommandes([newCmd, ...commandes]);
              showToast("Commande validée et bon de commande généré");
              setIsNewOrderModalOpen(false);

              try {
                await addDoc(collection(db, 'commandes'), newCmd);

                
                let printWindow = window.open('', '', 'width=800,height=900');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Bon de Commande - ${supplierName}</title>
                        <style>
                          body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
                          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #DDA956; padding-bottom: 20px; }
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
                            </tr>
                          </thead>
                          <tbody>
                            ${articles.split(',').map(a => `<tr><td>${a.trim()}</td></tr>`).join('')}
                          </tbody>
                        </table>

                        <p><strong>Quantité Totale estimée :</strong> ${quantite}</p>
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
                console.error("Error adding order", err);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select name="supplier" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option value="">Sélectionnez un fournisseur</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison prévue</label>
                <input name="deliveryDate" type="date" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie d'achat</label>
                  <select name="categorie" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Alimentaire">Alimentaire</option>
                    <option value="Boissons">Boissons</option>
                    <option value="Matériel">Matériel</option>
                    <option value="Fournitures">Fournitures</option>
                    <option value="Services">Services</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Totale</label>
                  <input name="quantite" type="text" placeholder="Ex: 50 kg" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Articles</label>
                <textarea name="articles" required rows={3} placeholder="Ex: Safran 500g, Huile d'olive 20L..." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none"></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Valider la Commande
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
                <input name="nom" defaultValue={selectedFournisseur.nom} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select name="categorie" defaultValue={selectedFournisseur.categorie} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white max-h-48 overflow-y-auto">
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="Fruits & Légumes">Fruits & Légumes</option>
                  <option value="Viandes & Volailles">Viandes & Volailles</option>
                  <option value="Poissons & Fruits de mer">Poissons & Fruits de mer</option>
                  <option value="Épices & Safran">Épices & Safran</option>
                  <option value="Épicerie & Sec">Épicerie & Sec</option>
                  <option value="Produits Laitiers">Produits Laitiers</option>
                  <option value="Boissons">Boissons</option>
                  <option value="Nettoyage & Hygiène">Nettoyage & Hygiène</option>
                  <option value="Emballages">Emballages</option>
                  <option value="Matériel Cuisine">Matériel Cuisine</option>
                  <option value="Services Extérieurs">Services Extérieurs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label>
                <input name="contact" defaultValue={selectedFournisseur.contact} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input name="tel" defaultValue={selectedFournisseur.tel || ''} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" defaultValue={selectedFournisseur.email || ''} type="email" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button type="submit" className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-black transition-colors">
                Mettre à jour
              </button>
              <button 
                type="button"
                onClick={async () => {
                  if (window.confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
                    try {
                      if (selectedFournisseur?.id) { await deleteDoc(doc(db, 'fournisseurs', selectedFournisseur.id)); }
                      showToast("Fournisseur supprimé");
                      setIsEditSupplierModalOpen(false);
                    } catch (e) {
                      console.error(e);
                      showToast("Erreur lors de la suppression", "error");
                    }
                  }
                }}
                className="w-full mt-2 bg-white text-red-500 border border-red-200 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors"
              >
                Supprimer le fournisseur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nouveau Fournisseur */}
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
                <input name="nom" required type="text" placeholder="Ex: Grossiste Bio Plus" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select name="categorie" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white max-h-48 overflow-y-auto">
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="Fruits & Légumes">Fruits & Légumes</option>
                  <option value="Viandes & Volailles">Viandes & Volailles</option>
                  <option value="Poissons & Fruits de mer">Poissons & Fruits de mer</option>
                  <option value="Épices & Safran">Épices & Safran</option>
                  <option value="Épicerie & Sec">Épicerie & Sec</option>
                  <option value="Produits Laitiers">Produits Laitiers</option>
                  <option value="Boissons">Boissons</option>
                  <option value="Emballages & Consommables">Emballages & Consommables</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Email ou Téléphone)</label>
                <input name="contact" required type="text" placeholder="Ex: contact@bioplus.ma" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Ajouter le Fournisseur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
