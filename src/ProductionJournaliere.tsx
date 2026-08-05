import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs, where, runTransaction, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useToast } from './context/ToastContext';
import { ChefHat, Plus, Activity, Clock, CheckCircle, Package, ArrowRight, X, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductionJournaliere() {
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [quantiteAProduire, setQuantiteAProduire] = useState(1);
  const [chefResponsable, setChefResponsable] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubRecipes = onSnapshot(collection(db, 'fiches_techniques'), snapshot => {
      setRecipes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubOrders = onSnapshot(query(collection(db, 'productionOrders')), snapshot => {
      setProductionOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubInv = onSnapshot(collection(db, 'inventoryItems'), snapshot => {
      setInventoryItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    return () => {
      unsubRecipes();
      unsubOrders();
      unsubInv();
    };
  }, []);

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet ordre de production (l\'historique sera effacé mais le stock restera inchangé) ?')) {
      try {
        await deleteDoc(doc(db, 'productionOrders', id));
        showToast("Ordre de production supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression de l'ordre", error);
        showToast("Erreur lors de la suppression", "error");
      }
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipeId || quantiteAProduire <= 0 || !chefResponsable) {
      showToast("Veuillez remplir tous les champs correctement.", "error");
      return;
    }

    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) {
      showToast("Recette introuvable.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Transaction to decrement inventory and create order
      await runTransaction(db, async (transaction) => {
        const ingredientsUpdates = [];
        
        // 1. Calculate needed quantities and find inventory docs
        for (const ing of recipe.ingredients || []) {
          // Find the corresponding inventory item
          // Normally we'd use an ID, but we match by name as fallback
          const inventoryItem = inventoryItems.find(i => i.name === ing.nom);
          
          if (!inventoryItem) {
            // Optional: warn user that ingredient is not in inventory
            continue; 
          }
          
          // Base quantity needed for the required number of portions
          // If recipe is for N portions, and we want to produce M portions:
          // totalQty = (ing.quantite / recipe.portions) * M
          const baseQty = parseFloat(ing.quantite) || 0;
          const recipePortions = parseFloat(recipe.portions) || 1;
          let neededQty = (baseQty / recipePortions) * quantiteAProduire;
          
          // Convert units if necessary to match inventory unit
          const ingUnit = ing.unite.toLowerCase();
          const invUnit = (inventoryItem.unit || '').toLowerCase();
          
          if (ingUnit === 'g' && invUnit === 'kg') neededQty = neededQty / 1000;
          else if (ingUnit === 'kg' && invUnit === 'g') neededQty = neededQty * 1000;
          else if (ingUnit === 'ml' && (invUnit === 'l' || invUnit === 'litre')) neededQty = neededQty / 1000;
          else if ((ingUnit === 'l' || ingUnit === 'litre') && invUnit === 'ml') neededQty = neededQty * 1000;
          
          const invRef = doc(db, 'inventoryItems', inventoryItem.id);
          const currentQty = parseFloat(inventoryItem.quantity) || 0;
          
          ingredientsUpdates.push({
            ref: invRef,
            newQty: currentQty - neededQty,
            item: inventoryItem,
            neededQty
          });
        }
        
        // 2. Perform updates
        for (const update of ingredientsUpdates) {
          transaction.update(update.ref, { quantity: update.newQty });
        }
        
        // 3. Create production order
        const newOrderRef = doc(collection(db, 'productionOrders'));
        transaction.set(newOrderRef, {
          recipeId: recipe.id,
          recipeName: recipe.nom,
          quantiteProduite: quantiteAProduire,
          chefResponsable,
          status: 'completed',
          coutMatiereEstime: recipe.coutMatiere * quantiteAProduire,
          timestamp: serverTimestamp()
        });
        
        // 4. Optionally credit the produced item in inventory (if it exists)
        const producedItem = inventoryItems.find(i => i.name === recipe.nom);
        if (producedItem) {
           transaction.update(doc(db, 'inventoryItems', producedItem.id), {
             quantity: (parseFloat(producedItem.quantity) || 0) + quantiteAProduire
           });
        }
      });
      
      showToast("Ordre de fabrication créé et stocks mis à jour.");
      setIsModalOpen(false);
      setSelectedRecipeId('');
      setQuantiteAProduire(1);
      setChefResponsable('');
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la création de l'ordre de fabrication.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#265C6D]/10 rounded-xl text-[#265C6D]">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Production Journalière</h1>
            <p className="text-gray-500">Ordres de fabrication et décrémentation automatique des stocks</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#265C6D] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#1a4250] transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Nouvel Ordre
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Historique des Productions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Heure</th>
                <th className="px-6 py-4 font-medium">Recette / Produit</th>
                <th className="px-6 py-4 font-medium">Quantité</th>
                <th className="px-6 py-4 font-medium">Chef Responsable</th>
                <th className="px-6 py-4 font-medium">Coût Matière Total</th>
                <th className="px-6 py-4 font-medium text-center">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productionOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <Package size={32} className="mx-auto text-gray-300 mb-3" />
                    Aucun ordre de production trouvé
                  </td>
                </tr>
              ) : (
                productionOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.timestamp?.toDate ? new Date(order.timestamp.toDate()).toLocaleString('fr-FR') : 'Récent'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#265C6D]">{order.recipeName}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.quantiteProduite} portions</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <ChefHat size={16} className="text-gray-400" />
                      {order.chefResponsable}
                    </td>
                    <td className="px-6 py-4 font-medium">{Number(order.coutMatiereEstime || 0).toFixed(2)} DH</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={14} /> Produit
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ChefHat className="text-[#265C6D]" size={24} />
                Ordre de Fabrication
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Recette (Fiche Technique)</label>
                <select 
                  value={selectedRecipeId}
                  onChange={e => setSelectedRecipeId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#265C6D] focus:ring-1 focus:ring-[#265C6D]"
                  required
                >
                  <option value="">Sélectionner une recette...</option>
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>{r.nom} (Rendement: {r.portions})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantité à produire</label>
                  <input 
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantiteAProduire}
                    onChange={e => setQuantiteAProduire(parseFloat(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#265C6D] focus:ring-1 focus:ring-[#265C6D]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Chef responsable</label>
                  <input 
                    type="text"
                    value={chefResponsable}
                    onChange={e => setChefResponsable(e.target.value)}
                    placeholder="Nom du chef"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#265C6D] focus:ring-1 focus:ring-[#265C6D]"
                    required
                  />
                </div>
              </div>

              {selectedRecipeId && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-2">
                  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1.5">
                    <Package size={16} /> Impacts sur le stock (Estimation)
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1 max-h-32 overflow-y-auto">
                    {recipes.find(r => r.id === selectedRecipeId)?.ingredients?.map((ing: any, idx: number) => {
                      const recipe = recipes.find(r => r.id === selectedRecipeId);
                      const baseQty = parseFloat(ing.quantite) || 0;
                      const recipePortions = parseFloat(recipe.portions) || 1;
                      const neededQty = (baseQty / recipePortions) * quantiteAProduire;
                      return (
                        <li key={idx} className="flex justify-between border-b border-blue-100/50 pb-1">
                          <span>{ing.nom}</span>
                          <span className="font-medium">- {neededQty.toFixed(2)} {ing.unite}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="text-xs text-blue-600 mt-2 italic">
                    La validation décrémentera automatiquement ces quantités des stocks.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-[#265C6D] hover:bg-[#1a4250] transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? 'Validation...' : 'Valider la production'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
