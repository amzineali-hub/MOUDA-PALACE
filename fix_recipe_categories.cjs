const fs = require('fs');
let code = fs.readFileSync('src/Recettes.tsx', 'utf8');

const target = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select name="categorie" required className="w-full border border-gray-200 rounded-lg p-2.5 bg-white">
                  <option value="Plats">Plats</option>
                  <option value="Entrées">Entrées</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Boissons">Boissons</option>
                </select>
              </div>`;

const replacement = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <input 
                  name="categorie" 
                  required 
                  list="recipe-categories-list"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-white" 
                  placeholder="Sélectionner ou saisir..." 
                />
                <datalist id="recipe-categories-list">
                  <option value="Plats" />
                  <option value="Entrées" />
                  <option value="Desserts" />
                  <option value="Boissons" />
                </datalist>
              </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/Recettes.tsx', code);
  console.log("Updated Recettes.tsx category select to datalist");
} else {
  console.log("Target not found in Recettes.tsx");
}
