import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useToast } from './context/ToastContext';
import { motion } from 'framer-motion';
import { Search, Plus, ChefHat, Tag, Scale, AlertCircle, ChevronRight, Edit3, X, Trash2 } from 'lucide-react';


function RecetteForm({ initialData, onSubmit, onCancel }: { initialData?: any, onSubmit: (data: any) => void, onCancel: () => void }) {
  const [nom, setNom] = useState(initialData?.nom || '');
  const [categorie, setCategorie] = useState(initialData?.categorie || '');
  const [portion, setPortion] = useState(initialData?.portion || '');
  const [temps, setTemps] = useState(initialData?.temps || '');
  const [difficulte, setDifficulte] = useState(initialData?.difficulte || 'Facile');
  
  const [ingredients, setIngredients] = useState<{nom: string, quantite: number, unite: string, coutUnitaire: number}[]>(initialData?.ingredients || []);
  
  // Calculate total cost automatically based on ingredients
  const computedCout = ingredients.reduce((sum, ing) => sum + (ing.quantite * ing.coutUnitaire), 0);
  
  // If no ingredients, allow manual cost, otherwise use computed cost
  const [manualCout, setManualCout] = useState(
    initialData?.cout ? 
      Number(typeof initialData.cout === 'string' ? initialData.cout.replace(/[^0-9.]/g, '') : initialData.cout) 
      : 0
  );

  const finalCout = ingredients.length > 0 ? computedCout : manualCout;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nom,
      categorie,
      portion,
      temps,
      difficulte,
      cout: finalCout + ' MAD',
      ingredients
    });
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { nom: '', quantite: 1, unite: 'kg', coutUnitaire: 0 }]);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-serif font-medium text-gray-900">{initialData ? 'Modifier Recette' : 'Nouvelle Recette'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form id="recette-form" className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b border-gray-100 pb-2">Informations Générales</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la recette</label>
                <input value={nom} onChange={e => setNom(e.target.value)} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#F4C75B]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input
                    list="dl-recettes-cat"
                    value={categorie}
                    onChange={e => setCategorie(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#F4C75B]"
                    placeholder="Ex: Entrées Froides"
                  />
                  <datalist id="dl-recettes-cat">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portion</label>
                  <select
                    value={portion}
                    onChange={e => setPortion(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#F4C75B]"
                  >
                    <option value="">Sélectionner une portion</option>
                    <option value="1 personne">1 personne</option>
                    <option value="2 personnes">2 personnes</option>
                    <option value="3 personnes">3 personnes</option>
                    <option value="4 personnes">4 personnes</option>
                    <option value="6 personnes">6 personnes</option>
                    <option value="8 personnes">8 personnes</option>
                    <option value="10 personnes">10 personnes</option>
                    <option value="12 pièces">12 pièces</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps</label>
                  <select
                    value={temps}
                    onChange={e => setTemps(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#F4C75B]"
                  >
                    <option value="">Sélectionner un temps</option>
                    <option value="5 min">5 min</option>
                    <option value="10 min">10 min</option>
                    <option value="15 min">15 min</option>
                    <option value="20 min">20 min</option>
                    <option value="30 min">30 min</option>
                    <option value="40 min">40 min</option>
                    <option value="45 min">45 min</option>
                    <option value="1h">1h</option>
                    <option value="1h 30">1h 30</option>
                    <option value="2h">2h</option>
                    <option value="3h">3h</option>
                    <option value="+3h">+3h</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                  <select value={difficulte} onChange={e => setDifficulte(e.target.value)} required className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#F4C75B]">
                    <option value="Facile">Facile</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Difficile">Difficile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coût estimé (MAD)</label>
                  <input 
                    value={ingredients.length > 0 ? computedCout : manualCout} 
                    onChange={e => setManualCout(Number(e.target.value))} 
                    required 
                    type="number" 
                    step="0.01" 
                    disabled={ingredients.length > 0}
                    className={`w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#F4C75B] ${ingredients.length > 0 ? 'bg-gray-50 text-gray-500' : ''}`} 
                  />
                  {ingredients.length > 0 && <p className="text-xs text-gray-500 mt-1">Calculé automatiquement</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="font-medium text-gray-900">Fiche Technique (Ingrédients)</h4>
                <button type="button" onClick={addIngredient} className="text-sm text-[#F4C75B] hover:text-[#E5B745] font-medium flex items-center gap-1">
                  <Plus size={16} /> Ajouter
                </button>
              </div>
              
              {ingredients.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                  Aucun ingrédient ajouté.<br/>Le coût total doit être saisi manuellement.
                </div>
              ) : (
                <div className="space-y-3">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Ingrédient</label>
                        <input value={ing.nom} onChange={e => updateIngredient(idx, 'nom', e.target.value)} required type="text" placeholder="Nom" className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#F4C75B]" />
                      </div>
                      <div className="w-20">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Qté</label>
                        <input value={ing.quantite} onChange={e => updateIngredient(idx, 'quantite', Number(e.target.value))} required type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#F4C75B]" />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Unité</label>
                        <input value={ing.unite} onChange={e => updateIngredient(idx, 'unite', e.target.value)} required type="text" placeholder="kg, L..." className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#F4C75B]" />
                      </div>
                      <div className="w-28">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Prix Unitaire</label>
                        <input value={ing.coutUnitaire} onChange={e => updateIngredient(idx, 'coutUnitaire', Number(e.target.value))} required type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#F4C75B]" />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>
                        <div className="w-full border border-transparent p-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                          {(ing.quantite * ing.coutUnitaire).toFixed(2)}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeIngredient(idx)} className="mt-6 p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2 text-sm font-medium text-gray-700">
                    Coût Total Fiche Technique: <span className="ml-2 text-[#F4C75B] text-lg">{computedCout.toFixed(2)} MAD</span>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-gray-100 shrink-0">
          <button 
            type="submit"
            form="recette-form"
            className="w-full bg-[#F4C75B] text-[#1A1A1A] py-3 rounded-xl font-medium hover:bg-[#E5B745] transition-colors"
          >
            {initialData ? 'Sauvegarder' : 'Ajouter la Recette'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Recettes() {
  const [activeCategory, setActiveCategory] = useState('toutes');
  const [isNewRecetteModalOpen, setIsNewRecetteModalOpen] = useState(false);
  const [isEditRecetteModalOpen, setIsEditRecetteModalOpen] = useState(false);
  const [selectedRecette, setSelectedRecette] = useState<any>(null);
  const { showToast } = useToast();
  
  const [recettes, setRecettes] = useState<any[]>([
    { id: 'R001', nom: 'Pastilla au Pigeon', categorie: 'Plats', cout: '120 MAD', temps: '1h 30m', portion: '4 personnes', difficulte: 'Difficile' },
    { id: 'R002', nom: 'Couscous Royal', categorie: 'Plats', cout: '150 MAD', temps: '2h', portion: '6 personnes', difficulte: 'Moyenne' },
    { id: 'R003', nom: 'Zaalouk d\'Aubergines', categorie: 'Entrées', cout: '25 MAD', temps: '40m', portion: '2 personnes', difficulte: 'Facile' },
    { id: 'R004', nom: 'Tajine d\'Agneau aux Pruneaux', categorie: 'Plats', cout: '110 MAD', temps: '1h 45m', portion: '4 personnes', difficulte: 'Moyenne' },
    { id: 'R005', nom: 'Corne de Gazelle', categorie: 'Desserts', cout: '60 MAD', temps: '2h', portion: '12 pièces', difficulte: 'Difficile' },
    { id: '9wc6rMjP9HguOoYa5Euj', nom: 'seffa', categorie: 'Plats', cout: '20 MAD', temps: '1h', portion: '2 personnes', difficulte: 'Facile' },
    { id: 'R008', nom: 'Briouates aux Amandes', categorie: 'Desserts', cout: '50 MAD', temps: '1h', portion: '10 pièces', difficulte: 'Moyenne' },
  ]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'recettes'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setRecettes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }
    });
    return () => unsub();
  }, []);

  const filteredRecettes = recettes.filter(r => activeCategory === 'toutes' || r.categorie.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="p-4 md:p-8 pt-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Recettes & Menus</h2>
          <p className="text-gray-500">Gérez vos recettes, fiches techniques et coûts</p>
        </div>
        <button 
          onClick={() => setIsNewRecetteModalOpen(true)}
          className="bg-[#F4C75B] text-[#1A1A1A] px-6 py-2.5 rounded-xl font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nouvelle Recette
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['Toutes', 'Plats', 'Entrées', 'Desserts', 'Boissons'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat.toLowerCase())}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.toLowerCase()
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Rechercher une recette..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4C75B]/20 focus:border-[#F4C75B] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FDFBF7] text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium text-left">Nom de la recette</th>
                <th className="px-6 py-4 font-medium text-left">Catégorie</th>
                <th className="px-6 py-4 font-medium text-center">Portion</th>
                <th className="px-6 py-4 font-medium text-center">Temps</th>
                <th className="px-6 py-4 font-medium text-center">Difficulté</th>
                <th className="px-6 py-4 font-medium text-right">Coût estimé</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecettes.map((recette) => (
                <tr key={recette.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                        <ChefHat size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">{recette.nom}</p>
                        <p className="text-xs text-gray-400">ID: {recette.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Tag size={14} className="text-gray-400" />
                      {recette.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{recette.portion}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{recette.temps}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      recette.difficulte === 'Facile' ? 'bg-green-100 text-green-700' :
                      recette.difficulte === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {recette.difficulte}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[#1A1A1A]">{typeof recette.cout === 'number' ? recette.cout + ' MAD' : recette.cout}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedRecette(recette); setIsEditRecetteModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Modifier">
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Voulez-vous vraiment supprimer cette recette ?')) {
                            if (recette.id && !recette.id.startsWith('R00')) {
                              try {
                                await deleteDoc(doc(db, 'recettes', recette.id));
                                showToast("Recette supprimée");
                              } catch (err) {
                                console.error(err);
                                showToast("Erreur de suppression");
                              }
                            } else {
                              setRecettes(prev => prev.filter(r => r.id !== recette.id));
                              showToast("Recette supprimée");
                            }
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isNewRecetteModalOpen && (
        <RecetteForm 
          onSubmit={async (data) => {
            try {
              await addDoc(collection(db, 'recettes'), {
                ...data,
                createdAt: serverTimestamp()
              });
              showToast("Recette ajoutée avec succès");
              setIsNewRecetteModalOpen(false);
            } catch (err) {
              console.error("Error adding recette", err);
              showToast("Erreur lors de l'ajout");
            }
          }} 
          onCancel={() => setIsNewRecetteModalOpen(false)} 
        />
      )}

      {isEditRecetteModalOpen && selectedRecette && (
        <RecetteForm 
          initialData={selectedRecette}
          onSubmit={async (data) => {
            try {
              if (selectedRecette.id && !selectedRecette.id.startsWith('R00')) {
                await updateDoc(doc(db, 'recettes', selectedRecette.id), data);
              } else {
                setRecettes(prev => prev.map(r => r.id === selectedRecette.id ? { ...r, ...data } : r));
              }
              showToast("Recette modifiée avec succès");
              setIsEditRecetteModalOpen(false);
            } catch (err) {
              console.error("Error updating recette", err);
              showToast("Erreur lors de la modification");
            }
          }} 
          onCancel={() => setIsEditRecetteModalOpen(false)} 
        />
      )}
    </div>
  );
}
