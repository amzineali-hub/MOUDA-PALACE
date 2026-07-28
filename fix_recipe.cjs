const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const stateInject = `  const [txType, setTxType] = useState<'in' | 'out'>('in');
  const [newRecipeForm, setNewRecipeForm] = useState({ name: '', category: 'Entrée' });
  const [newRecipeIngredients, setNewRecipeIngredients] = useState<any[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [ingredientQty, setIngredientQty] = useState('');`;

code = code.replace("  const [txType, setTxType] = useState<'in' | 'out'>('in');", stateInject);

const modalSearch = `      {isNewRecipeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouvelle Fiche Technique</h3>
              <button onClick={() => setIsNewRecipeModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                  <input type="text" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Tagine de poulet" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]">
                    <option>Entrée</option>
                    <option>Plat Principal</option>
                    <option>Dessert</option>
                    <option>Boisson</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Ingrédients (Nécessite connexion à l'inventaire)</h4>
                  <button onClick={() => showToast && showToast('Action en cours de développement...')} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Action</button>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  showToast("Fiche technique créée avec succès");
                  setIsNewRecipeModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Sauvegarder Fiche Technique
              </button>
            </div>
          </div>
        </div>
      )}`;

const modalReplace = `      {isNewRecipeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouvelle Fiche Technique</h3>
              <button onClick={() => setIsNewRecipeModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                  <input 
                    type="text" 
                    value={newRecipeForm.name}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]" 
                    placeholder="Ex: Tagine de poulet" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select 
                    value={newRecipeForm.category}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, category: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]"
                  >
                    <option>Entrée</option>
                    <option>Plat Principal</option>
                    <option>Dessert</option>
                    <option>Boisson</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Ingrédients depuis l'inventaire</h4>
                </div>
                <div className="flex gap-2 mb-4">
                  <select 
                    value={selectedIngredient}
                    onChange={(e) => setSelectedIngredient(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner un produit...</option>
                    {stockItemsData.map(item => (
                      <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    value={ingredientQty}
                    onChange={(e) => setIngredientQty(e.target.value)}
                    className="w-24 border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]" 
                    placeholder="Qté" 
                  />
                  <button 
                    onClick={() => {
                      if (!selectedIngredient || !ingredientQty) {
                        showToast("Veuillez sélectionner un ingrédient et une quantité", "error");
                        return;
                      }
                      const item = stockItemsData.find(i => i.id === selectedIngredient);
                      if (item) {
                        setNewRecipeIngredients([...newRecipeIngredients, {
                          id: item.id,
                          name: item.name,
                          unit: item.unit,
                          quantity: Number(ingredientQty),
                          costPerUnit: item.price || 0
                        }]);
                        setSelectedIngredient('');
                        setIngredientQty('');
                      }
                    }}
                    className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b]"
                  >
                    Ajouter
                  </button>
                </div>
                
                {newRecipeIngredients.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {newRecipeIngredients.map((ing, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                        <span className="text-sm font-medium">{ing.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{ing.quantity} {ing.unit}</span>
                          <button 
                            onClick={() => {
                              const newArr = [...newRecipeIngredients];
                              newArr.splice(idx, 1);
                              setNewRecipeIngredients(newArr);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => {
                  if (!newRecipeForm.name) {
                    showToast("Veuillez entrer le nom du plat", "error");
                    return;
                  }
                  if (newRecipeIngredients.length === 0) {
                    showToast("Veuillez ajouter au moins un ingrédient", "error");
                    return;
                  }
                  showToast("Fiche technique créée avec succès");
                  setNewRecipeForm({ name: '', category: 'Entrée' });
                  setNewRecipeIngredients([]);
                  setIsNewRecipeModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Sauvegarder Fiche Technique
              </button>
            </div>
          </div>
        </div>
      )}`;

if (code.includes(modalSearch)) {
  code = code.replace(modalSearch, modalReplace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced modal");
} else {
  console.log("Modal not found");
}
