import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ShoppingCart, Truck, FileText, CheckCircle, Clock, AlertTriangle, ChevronRight, Store, X } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function AchatsFournisseurs() {
  const [activeTab, setActiveTab] = useState<'commandes' | 'fournisseurs'>('commandes');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { showToast } = useToast();
  
  const [commandes, setCommandes] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubCommandes = onSnapshot(query(collection(db, 'commandes'), orderBy('createdAt', 'desc')), (snapshot) => {
      setCommandes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching commandes", error);
      showToast("Erreur lors de la récupération des commandes");
    });

    const unsubFournisseurs = onSnapshot(query(collection(db, 'fournisseurs'), orderBy('createdAt', 'desc')), (snapshot) => {
      setFournisseurs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
                  <tr key={cmd.orderNumber || cmd.id.slice(0,8).toUpperCase()} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A1A1A] flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      {cmd.orderNumber || cmd.id.slice(0,8).toUpperCase()}
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
                      <button 
                        onClick={() => {
                          setSelectedCommande(cmd);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-[#DDA956] hover:text-[#C89845] font-medium text-sm flex items-center justify-end gap-1 w-full"
                      >
                        Détails <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Éditer
                      </button>
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
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">Détails de la Commande {selectedCommande.orderNumber || selectedCommande.id.slice(0,8).toUpperCase()}</h3>
            <p className="text-sm text-gray-500 mb-6">Fournisseur : <span className="font-medium text-gray-900">{selectedCommande.fournisseur}</span> • Date : {selectedCommande.date}</p>
            
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
            <div className="flex justify-end">
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
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Nouvelle Commande</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const supplierId = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              const articles = formData.get('articles') as string;
              
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
                  createdAt: serverTimestamp()
              };

              setCommandes([newCmd, ...commandes]);
              showToast("Commande validée et bon de commande généré");
              setIsNewOrderModalOpen(false);

              try {
                await addDoc(collection(db, 'commandes'), newCmd);

                let fileContent = `BON DE COMMANDE\n\n`;
                fileContent += `Émetteur : Restaurant Mouda Palace\n`;
                fileContent += `Date d'émission : ${new Date().toLocaleDateString('fr-FR')}\n`;
                fileContent += `Fournisseur : ${supplierName}\n`;
                fileContent += `Date de livraison prévue : ${deliveryDate}\n\n`;
                fileContent += `Articles commandés :\n${articles}\n\n`;
                fileContent += `Merci de bien vouloir confirmer la réception de cette commande.\n`;
                
                const encodedUri = encodeURI("data:text/plain;charset=utf-8," + fileContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `Bon_de_commande_${supplierName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.txt`);
                document.body.appendChild(link);
                link.click();
                link.remove();
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
