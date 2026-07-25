import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ShoppingCart, Truck, FileText, CheckCircle, Clock, AlertTriangle, ChevronRight, Store, X } from 'lucide-react';
import { useToast } from './context/ToastContext';

export default function AchatsFournisseurs() {
  const [activeTab, setActiveTab] = useState<'commandes' | 'fournisseurs'>('commandes');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const { showToast } = useToast();
  
  const commandes = [
    { id: 'CMD-2024-089', fournisseur: 'Coopérative Taliouine', date: '24 Juil 2024', montant: '12 400 MAD', status: 'En attente', items: 3 },
    { id: 'CMD-2024-088', fournisseur: 'Marché Central Fès', date: '22 Juil 2024', montant: '4 850 MAD', status: 'Livrée', items: 12 },
    { id: 'CMD-2024-087', fournisseur: 'Boucherie Al Baraka', date: '20 Juil 2024', montant: '8 900 MAD', status: 'Livrée', items: 5 },
    { id: 'CMD-2024-086', fournisseur: 'Primeur Atlas', date: '19 Juil 2024', montant: '3 200 MAD', status: 'Annulée', items: 8 },
  ];

  const fournisseurs = [
    { id: 'F001', nom: 'Coopérative Taliouine', categorie: 'Épices & Safran', contact: 'M. Hassan', tel: '+212 6 00 00 00 01', email: 'contact@taliouine-safran.ma', rating: 4.8 },
    { id: 'F002', nom: 'Marché Central Fès', categorie: 'Fruits & Légumes', contact: 'M. Karim', tel: '+212 6 00 00 00 02', email: 'commandes@marche-fes.ma', rating: 4.5 },
    { id: 'F003', nom: 'Boucherie Al Baraka', categorie: 'Viandes', contact: 'M. Youssef', tel: '+212 6 00 00 00 03', email: 'youssef@albaraka.ma', rating: 4.9 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livrée': return 'bg-green-100 text-green-700 border-green-200';
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
            <p className="text-2xl font-bold text-[#1A1A1A]">12</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">En attente de livraison</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">4</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total fournisseurs actifs</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">28</p>
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
                  <tr key={cmd.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A1A1A] flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      {cmd.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cmd.date}</td>
                    <td className="px-6 py-4 text-[#1A1A1A] font-medium">{cmd.fournisseur}</td>
                    <td className="px-6 py-4 text-gray-600">{cmd.items} articles</td>
                    <td className="px-6 py-4 text-right font-medium">{cmd.montant}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cmd.status)}`}>
                        {cmd.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#DDA956] hover:text-[#C89845] font-medium text-sm flex items-center justify-end gap-1 w-full">
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
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const supplier = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              const articles = formData.get('articles') as string;
              
              let fileContent = `BON DE COMMANDE\n\n`;
              fileContent += `Émetteur : Restaurant Mouda Palace\n`;
              fileContent += `Date d'émission : ${new Date().toLocaleDateString('fr-FR')}\n`;
              fileContent += `Fournisseur : ${supplier}\n`;
              fileContent += `Date de livraison prévue : ${deliveryDate}\n\n`;
              fileContent += `Articles commandés :\n${articles}\n\n`;
              fileContent += `Merci de bien vouloir confirmer la réception de cette commande.\n`;
              
              const encodedUri = encodeURI("data:text/plain;charset=utf-8," + fileContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `Bon_de_commande_${supplier.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.txt`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              
              showToast("Commande validée et bon de commande généré");
              setIsNewOrderModalOpen(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select name="supplier" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                  <option>Coopérative Taliouine</option>
                  <option>Ferme Atlas</option>
                  <option>Boucherie Centrale</option>
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input type="text" placeholder="Ex: Grossiste Bio Plus" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <input type="text" placeholder="Ex: Fruits & Légumes" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Email ou Téléphone)</label>
                <input type="text" placeholder="Ex: contact@bioplus.ma" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                onClick={() => {
                  showToast("Fournisseur ajouté avec succès");
                  setIsNewSupplierModalOpen(false);
                }}
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Ajouter le Fournisseur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
