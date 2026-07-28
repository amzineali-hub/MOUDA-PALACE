const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                <div>
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
                </div>`;

const replacement = `                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input 
                    value={newRecipeForm.category}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, category: e.target.value})}
                    list="fiche-categories-list"
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]"
                    placeholder="Sélectionner ou saisir..."
                  />
                  <datalist id="fiche-categories-list">
                    <option value="Entrée" />
                    <option value="Plat Principal" />
                    <option value="Dessert" />
                    <option value="Boisson" />
                  </datalist>
                </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated App.tsx recipe category select to datalist");
} else {
  console.log("Target not found in App.tsx");
}
