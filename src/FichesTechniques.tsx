import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useToast } from './context/ToastContext';
import { Plus, X, Search, Edit3, Trash2, Tag, UtensilsCrossed, AlertCircle, ChefHat } from 'lucide-react';
import { query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';

// Define calculateCost outside so it can be reused
const calculateCost = (qty: number, unit: string, price: number, priceUnit: string, forceCost?: number) => {
  if (forceCost !== undefined && forceCost !== null && !price) return forceCost;
  if (!qty || !price) return 0;
  let adjustedQty = qty;
  if (unit === 'g' && priceUnit === 'kg') adjustedQty = qty / 1000;
  if (unit === 'kg' && priceUnit === 'g') adjustedQty = qty * 1000;
  if (unit === 'ml' && priceUnit === 'L') adjustedQty = qty / 1000;
  if (unit === 'L' && priceUnit === 'ml') adjustedQty = qty * 1000;
  return adjustedQty * price;
};

export default function FichesTechniques() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const { showToast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'fiches_techniques'), (snapshot) => {
      setRecipes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsubInv = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsub(); unsubInv(); };
  }, []);

  const openNew = () => {
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  const openEdit = (recipe: any) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette fiche technique ?')) {
      try {
        await deleteDoc(doc(db, 'fiches_techniques', id));
        showToast('Fiche technique supprimée', 'success');
      } catch (err) {
        showToast('Erreur lors de la suppression', 'error');
      }
    }
  };

  const categories = ['Toutes', ...Array.from(new Set(recipes.map(r => r.categorie).filter(Boolean)))];
  
  const filteredRecipes = recipes.filter(r => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
                          (r.nom || '').toLowerCase().includes(searchLower) || 
                          (r.categorie || '').toLowerCase().includes(searchLower) ||
                          (r.ingredients && r.ingredients.some((ing: any) => (ing.nom || '').toLowerCase().includes(searchLower)));
    const matchesCategory = selectedCategory === 'Toutes' || r.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-[#265C6D]">Fiches Techniques & Marges</h2>
          <p className="text-gray-500 mt-1">Gérez vos recettes, coûts matières et rentabilité</p>
        </div>
        <button 
          onClick={openNew}
          className="bg-[#265C6D] text-[#F4C75B] px-6 py-2.5 rounded-xl font-medium hover:bg-[#1D4A58] transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nouvelle Fiche
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher une fiche (nom, ingrédient)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#265C6D] focus:ring-1 focus:ring-[#265C6D] transition-all bg-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  selectedCategory === cat 
                    ? 'bg-[#265C6D] text-white border-[#265C6D]' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Plat</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium">Coût Matière</th>
                <th className="px-6 py-4 font-medium">Prix Vente</th>
                <th className="px-6 py-4 font-medium">Food Cost</th>
                <th className="px-6 py-4 font-medium">Marge Brute</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecipes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucune fiche technique trouvée
                  </td>
                </tr>
              ) : filteredRecipes.map(recipe => {
                let dynamicCoutMatiere = recipe.coutMatiere || 0;
                if (recipe.ingredients && recipe.ingredients.length > 0) {
                  dynamicCoutMatiere = recipe.ingredients.reduce((sum: number, ing: any) => {
                    const matchedItem = inventoryItems.find(i => i.name?.toLowerCase() === ing.nom?.toLowerCase());
                    const currentPrice = matchedItem ? Number(matchedItem.averageCost || matchedItem.price) || Number(ing.prixUnitaire) : Number(ing.prixUnitaire);
                    const currentPriceUnit = matchedItem ? (matchedItem.unit || ing.unitePrix) : ing.unitePrix;
                    return sum + calculateCost(Number(ing.quantite), ing.unite, currentPrice, currentPriceUnit, ing.forceCost);
                  }, 0);
                } else if (recipe.coutMatiere) {
                  dynamicCoutMatiere = recipe.coutMatiere;
                }

                const pv = Number(recipe.prixVente) || 0;
                const dynamicFoodCost = pv > 0 ? (dynamicCoutMatiere / pv) * 100 : 0;
                const dynamicMarge = pv > 0 ? pv - dynamicCoutMatiere : 0;

                return (
                <tr key={recipe.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{recipe.nom}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      {recipe.categorie || 'Non classé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-red-600">{Number(dynamicCoutMatiere).toFixed(2)} DH</td>
                  <td className="px-6 py-4 font-medium text-green-600">{Number(pv).toFixed(2)} DH</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                      dynamicFoodCost <= 25 ? 'bg-green-50 text-green-700' : 
                      dynamicFoodCost <= 35 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {Number(dynamicFoodCost).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#265C6D]">{Number(dynamicMarge).toFixed(2)} DH</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(recipe)} className="text-gray-400 hover:text-blue-500 p-2"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(recipe.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <FicheTechniqueForm 
          initialData={editingRecipe} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

function FicheTechniqueForm({ initialData, onClose }: { initialData: any, onClose: () => void }) {
  const { showToast } = useToast();
  const [nom, setNom] = useState(initialData?.nom || '');
  const [categorie, setCategorie] = useState(initialData?.categorie || '');
  const [portions, setPortions] = useState(initialData?.portions || 1);
  const [prixVente, setPrixVente] = useState(initialData?.prixVente || '');
  const [ingredients, setIngredients] = useState<any[]>(initialData?.ingredients || []);
  const [manualCoutMatiere, setManualCoutMatiere] = useState(initialData?.coutMatiere || '');
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    const unsubInv = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(d => ({...d.data(), id: d.id})));
    });
    const unsubMenu = onSnapshot(query(collection(db, 'menu_items')), (snapshot) => {
      setMenuItems(snapshot.docs.map(d => ({...d.data(), id: d.id})));
    });
    return () => {
      unsubInv();
      unsubMenu();
    };
  }, []);

  const UNITES = ['g', 'kg', 'ml', 'L', 'pièce', 'pincée', 'c.à.s', 'c.à.c', 'portion'];
  const [newIng, setNewIng] = useState({
    nom: '',
    quantite: '',
    unite: 'g',
    prixUnitaire: '',
    unitePrix: 'kg'
  });



  const calculatedCoutMatiere = ingredients.reduce((sum, ing) => {
    const matchedItem = inventoryItems.find(i => i.name?.toLowerCase() === ing.nom?.toLowerCase());
    const currentPrice = matchedItem ? Number(matchedItem.averageCost || matchedItem.price) || Number(ing.prixUnitaire) : Number(ing.prixUnitaire);
    const currentPriceUnit = matchedItem ? (matchedItem.unit || ing.unitePrix) : ing.unitePrix;
    return sum + calculateCost(Number(ing.quantite), ing.unite, currentPrice, currentPriceUnit, ing.forceCost);
  }, 0);
  
  const coutMatiere = ingredients.length > 0 ? calculatedCoutMatiere : (Number(manualCoutMatiere) || 0);

  const pv = Number(prixVente) || 0;
  const foodCost = pv > 0 ? (coutMatiere / pv) * 100 : 0;
  const margeBrute = pv > 0 ? pv - coutMatiere : 0;

  const handleSave = async () => {
    if (!nom || !categorie || !prixVente) {
      showToast('Veuillez remplir tous les champs obligatoires (Nom, Catégorie, Prix)', 'error');
      return;
    }

    const payload = {
      nom,
      categorie,
      portions,
      prixVente: pv,
      coutMatiere,
      foodCost,
      margeBrute,
      ingredients,
      updatedAt: new Date().toISOString()
    };

    try {
      if (initialData?.id) {
        await updateDoc(doc(db, 'fiches_techniques', initialData.id), payload);
        showToast('Fiche technique mise à jour', 'success');
      } else {
        await addDoc(collection(db, 'fiches_techniques'), { ...payload, createdAt: new Date().toISOString() });
        showToast('Fiche technique créée', 'success');
      }
      onClose();
    } catch (error) {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const addIngredient = () => {
    if (!newIng.nom || !newIng.quantite) return;
    const q = Number(newIng.quantite);
    const p = Number(newIng.prixUnitaire) || 0;
    const c = calculateCost(q, newIng.unite, p, newIng.unitePrix, undefined);

    setIngredients([
      ...ingredients, 
      {
        id: Date.now().toString(),
        nom: newIng.nom,
        quantite: q,
        unite: newIng.unite,
        prixUnitaire: p,
        unitePrix: newIng.unitePrix,
        coutCalculated: c
      }
    ]);
    
    setNewIng({ nom: '', quantite: '', unite: 'g', prixUnitaire: '', unitePrix: 'kg' });
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const updateIngredient = (id: string, field: string, value: any) => {
    setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-serif font-semibold text-gray-900">
            {initialData ? 'Modifier la Fiche Technique' : 'Nouvelle Fiche Technique'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                <select
                  value={menuItems.some(m => m.name === nom) ? nom : (nom ? 'autre' : '')}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'autre') {
                      setNom('');
                    } else if (val) {
                      setNom(val);
                      const matchedMenu = menuItems.find(m => m.name === val);
                      if (matchedMenu) {
                        setCategorie(matchedMenu.category || '');
                        setPrixVente(matchedMenu.price ? String(matchedMenu.price).replace(/[^0-9.]/g, '') : '');
                      }
                    } else {
                      setNom('');
                    }
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B] mb-2 bg-gray-50"
                >
                  <option value="">-- Sélectionner depuis le menu --</option>
                  {menuItems.map((m, idx) => (
                    <option key={idx} value={m.name}>{m.name} ({m.price} DH)</option>
                  ))}
                  <option value="autre">+ Nouveau plat (hors menu)</option>
                </select>
                {(!menuItems.some(m => m.name === nom)) && (
                  <input 
                    type="text" 
                    value={nom} 
                    onChange={e => setNom(e.target.value)} 
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                    placeholder="Saisir le nom du plat..."
                    autoFocus={nom === ''}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={Array.from(new Set([...menuItems.map(m => m.category).filter(Boolean), 'Entrées', 'Plats Principaux', 'Desserts', 'Boissons', 'Supplément'])).includes(categorie) ? categorie : (categorie ? 'autre' : '')}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'autre') {
                        setCategorie('');
                      } else {
                        setCategorie(val);
                      }
                    }}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B] bg-white mb-2"
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {Array.from(new Set([...menuItems.map(m => m.category).filter(Boolean), 'Entrées', 'Plats Principaux', 'Desserts', 'Boissons', 'Supplément'])).map((cat: any, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                    <option value="autre">Autre catégorie...</option>
                  </select>
                  {(!Array.from(new Set([...menuItems.map(m => m.category).filter(Boolean), 'Entrées', 'Plats Principaux', 'Desserts', 'Boissons', 'Supplément'])).includes(categorie)) && (
                    <input 
                      type="text" 
                      value={categorie} 
                      onChange={e => setCategorie(e.target.value)} 
                      className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                      placeholder="Saisir la catégorie..."
                      autoFocus={categorie === ''}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portions</label>
                  <input 
                    type="number" step="any" 
                    min="1"
                    value={portions} 
                    onChange={e => setPortions(Number(e.target.value))} 
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                  />
                </div>
              </div>
            </div>
            
            <div className="col-span-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
              <h4 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Récapitulatif Financier</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Prix de vente conseillé</span>
                  <div className="relative w-24">
                    <input 
                      type="number" step="any" 
                      value={prixVente}
                      onChange={e => setPrixVente(e.target.value)}
                      className="w-full border-b border-gray-300 text-right pr-6 focus:outline-none focus:border-[#F4C75B] font-medium text-gray-900"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 text-sm">DH</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-600 text-sm">Coût matière</span>
                  <div className="relative w-24">
                    <input 
                      type="number" step="any" 
                      value={ingredients.length > 0 ? Number(coutMatiere || 0).toFixed(2) : manualCoutMatiere}
                      onChange={e => setManualCoutMatiere(e.target.value)}
                      disabled={ingredients.length > 0}
                      className="w-full border-b border-gray-300 text-right pr-6 focus:outline-none focus:border-[#F4C75B] font-semibold text-gray-900 bg-transparent disabled:opacity-70"
                    />
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 text-sm">DH</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Food Cost</span>
                  <span className={`font-semibold ${foodCost <= 25 ? 'text-green-600' : foodCost <= 35 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {Number(foodCost || 0).toFixed(1)} %
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Marge brute</span>
                  <span className="font-bold text-[#265C6D]">{Number(margeBrute || 0).toFixed(2)} DH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions for Stock Integration */}
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex gap-3 items-start mb-6 border border-blue-100">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium mb-1">Gestion du stock automatisée</h4>
              <p className="text-sm text-blue-700/80 leading-relaxed">
                Cette fiche déduit automatiquement les ingrédients de l'économat à chaque vente du plat. Le coût matière est mis à jour en temps réel selon vos achats, assurant un calcul automatique du Food Cost et une marge précise liée directement au POS.
              </p>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <ChefHat size={18} className="text-[#F4C75B]" /> Ingrédients
              </h4>
              <span className="text-sm font-medium text-gray-500">Coût total: <span className="text-red-600 font-bold">{Number(coutMatiere || 0).toFixed(2)} DH</span></span>
            </div>
            
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Ingrédient</th>
                  <th className="px-4 py-3 font-medium">Quantité</th>
                  <th className="px-4 py-3 font-medium">Unité</th>
                  <th className="px-4 py-3 font-medium">Prix Unitaire</th>
                  <th className="px-4 py-3 font-medium text-right">Coût</th>
                  <th className="px-4 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ingredients.map((ing) => {
                  const matchedItem = inventoryItems.find(i => i.name?.toLowerCase() === ing.nom?.toLowerCase());
                  const currentPrice = matchedItem ? Number(matchedItem.averageCost || matchedItem.price) || Number(ing.prixUnitaire) : Number(ing.prixUnitaire);
                  const currentPriceUnit = matchedItem ? (matchedItem.unit || ing.unitePrix) : ing.unitePrix;
                  const currentCost = calculateCost(Number(ing.quantite), ing.unite, currentPrice, currentPriceUnit, ing.forceCost);

                  return (
                  <tr key={ing.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {ing.nom}
                      {matchedItem && <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">Stock</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <input 
                        type="number" step="any"
                        value={ing.quantite}
                        onChange={e => updateIngredient(ing.id, 'quantite', e.target.value)}
                        className="w-20 border border-gray-200 rounded p-1 text-sm focus:outline-none focus:border-[#F4C75B]"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <select 
                        value={ing.unite}
                        onChange={e => updateIngredient(ing.id, 'unite', e.target.value)}
                        className="w-full border border-gray-200 rounded p-1 text-sm focus:outline-none focus:border-[#F4C75B] bg-white"
                      >
                        {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-600 flex items-center gap-1">
                      {matchedItem ? (
                        <span>{currentPrice ? `${Number(currentPrice).toFixed(2)} DH / ${currentPriceUnit}` : '-'}</span>
                      ) : (
                        <>
                          <input 
                            type="number" step="any"
                            value={ing.prixUnitaire}
                            onChange={e => updateIngredient(ing.id, 'prixUnitaire', e.target.value)}
                            className="w-16 border border-gray-200 rounded p-1 text-sm focus:outline-none focus:border-[#F4C75B]"
                          />
                          <span className="text-gray-500 text-xs">DH /</span>
                          <select 
                            value={ing.unitePrix}
                            onChange={e => updateIngredient(ing.id, 'unitePrix', e.target.value)}
                            className="w-16 border border-gray-200 rounded p-1 text-sm focus:outline-none focus:border-[#F4C75B] bg-white"
                          >
                            {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {Number(currentCost || 0).toFixed(2)} DH
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeIngredient(ing.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
                })}
                
                {/* Add new row */}
                <tr className="bg-gray-50/30">
                  <td className="px-4 py-2">
                    <select
                      className="w-full border border-gray-200 rounded p-1.5 text-sm focus:outline-none focus:border-[#F4C75B] bg-gray-50 mb-1"
                      value={(newIng as any).isCustom ? 'autre' : (inventoryItems.some(i => i.name === newIng.nom) ? newIng.nom : (newIng.nom ? 'autre' : ''))}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'autre') {
                          setNewIng({...newIng, nom: '', isCustom: true} as any);
                        } else if (val) {
                          const matchedItem = inventoryItems.find(i => i.name === val);
                          if (matchedItem) {
                            setNewIng({
                              ...newIng,
                              nom: val,
                              unite: matchedItem.unit || 'g',
                              unitePrix: matchedItem.unit || 'kg',
                              prixUnitaire: matchedItem.averageCost ? String(matchedItem.averageCost) : (matchedItem.price ? String(matchedItem.price) : ''),
                              isCustom: false
                            } as any);
                          }
                        } else {
                          setNewIng({...newIng, nom: '', isCustom: false} as any);
                        }
                      }}
                    >
                      <option value="">-- Depuis l'inventaire --</option>
                      {inventoryItems.map((item, idx) => (
                        <option key={idx} value={item.name}>{item.name} ({item.averageCost || item.price} DH/{item.unit})</option>
                      ))}
                      <option value="autre">+ Nouvel ingrédient</option>
                    </select>
                    {((newIng as any).isCustom || (!inventoryItems.some(i => i.name === newIng.nom) && newIng.nom !== '')) && (
                      <input 
                        type="text" 
                        placeholder="Nom (ex: Sel)" 
                        className="w-full border border-gray-200 rounded p-1.5 text-sm focus:outline-none focus:border-[#F4C75B]"
                        value={newIng.nom}
                        onChange={e => setNewIng({...newIng, nom: e.target.value})}
                        autoFocus
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" step="any" 
                      placeholder="Qté" 
                      className="w-20 border border-gray-200 rounded p-1.5 text-sm focus:outline-none focus:border-[#F4C75B]"
                      value={newIng.quantite}
                      onChange={e => setNewIng({...newIng, quantite: e.target.value})}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select 
                      className="w-20 border border-gray-200 rounded p-1.5 text-sm focus:outline-none focus:border-[#F4C75B] bg-white"
                      value={newIng.unite}
                      onChange={e => setNewIng({...newIng, unite: e.target.value})}
                    >
                      {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2 flex items-center gap-1">
                    <input 
                      type="number" step="any" 
                      placeholder="Prix" 
                      className="w-16 border border-gray-200 rounded p-1.5 text-sm focus:outline-none focus:border-[#F4C75B]"
                      value={newIng.prixUnitaire}
                      onChange={e => setNewIng({...newIng, prixUnitaire: e.target.value})}
                    />
                    <span className="text-gray-500 text-xs">DH /</span>
                    <select 
                      className="w-16 border border-gray-200 rounded p-1.5 text-sm focus:outline-none focus:border-[#F4C75B] bg-white"
                      value={newIng.unitePrix}
                      onChange={e => setNewIng({...newIng, unitePrix: e.target.value})}
                    >
                      {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-500 text-sm font-medium">
                    {calculateCost(Number(newIng.quantite), newIng.unite, Number(newIng.prixUnitaire), newIng.unitePrix).toFixed(2)} DH
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button 
                      onClick={addIngredient}
                      disabled={!newIng.nom || !newIng.quantite}
                      className="bg-[#265C6D] text-white p-1.5 rounded hover:bg-[#1D4A58] disabled:opacity-50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-[#265C6D] hover:bg-[#1D4A58] transition-colors"
          >
            Sauvegarder la Fiche
          </button>
        </div>
      </div>
    </div>
  );
}
