const fs = require('fs');
let code = fs.readFileSync('src/Recettes.tsx', 'utf8');

// Replace the modals with a new component for the form

const newComponent = `
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
                <input value={nom} onChange={e => setNom(e.target.value)} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#DDA956]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input 
                    value={categorie} onChange={e => setCategorie(e.target.value)}
                    required 
                    list="recipe-categories-list"
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#DDA956]" 
                    placeholder="Sélectionner ou saisir..." 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portion</label>
                  <input value={portion} onChange={e => setPortion(e.target.value)} required type="text" placeholder="Ex: 4 personnes" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps</label>
                  <input value={temps} onChange={e => setTemps(e.target.value)} required type="text" placeholder="Ex: 1h" className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                  <select value={difficulte} onChange={e => setDifficulte(e.target.value)} required className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#DDA956]">
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
                    className={\`w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#DDA956] \${ingredients.length > 0 ? 'bg-gray-50 text-gray-500' : ''}\`} 
                  />
                  {ingredients.length > 0 && <p className="text-xs text-gray-500 mt-1">Calculé automatiquement</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="font-medium text-gray-900">Fiche Technique (Ingrédients)</h4>
                <button type="button" onClick={addIngredient} className="text-sm text-[#DDA956] hover:text-[#c4954b] font-medium flex items-center gap-1">
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
                        <input value={ing.nom} onChange={e => updateIngredient(idx, 'nom', e.target.value)} required type="text" placeholder="Nom" className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#DDA956]" />
                      </div>
                      <div className="w-20">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Qté</label>
                        <input value={ing.quantite} onChange={e => updateIngredient(idx, 'quantite', Number(e.target.value))} required type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#DDA956]" />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Unité</label>
                        <input value={ing.unite} onChange={e => updateIngredient(idx, 'unite', e.target.value)} required type="text" placeholder="kg, L..." className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#DDA956]" />
                      </div>
                      <div className="w-28">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Prix Unitaire</label>
                        <input value={ing.coutUnitaire} onChange={e => updateIngredient(idx, 'coutUnitaire', Number(e.target.value))} required type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#DDA956]" />
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
                    Coût Total Fiche Technique: <span className="ml-2 text-[#DDA956] text-lg">{computedCout.toFixed(2)} MAD</span>
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
            className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors"
          >
            {initialData ? 'Sauvegarder' : 'Ajouter la Recette'}
          </button>
        </div>
      </div>
    </div>
  );
}
`;

// Insert the new component right before export default function Recettes() {

code = code.replace("export default function Recettes() {", newComponent + "\nexport default function Recettes() {");

// Now replace the modals inside Recettes
const newModalRegex = /\{isNewRecetteModalOpen && \([\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*\)\}/;
const editModalRegex = /\{isEditRecetteModalOpen && selectedRecette && \([\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*\)\}/;

const newModalReplacement = `{isNewRecetteModalOpen && (
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
      )}`;
      
const editModalReplacement = `{isEditRecetteModalOpen && selectedRecette && (
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
      )}`;

code = code.replace(newModalRegex, newModalReplacement);
code = code.replace(editModalRegex, editModalReplacement);

fs.writeFileSync('src/Recettes.tsx', code);
