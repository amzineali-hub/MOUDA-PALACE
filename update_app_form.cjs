const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Catégorie in App.tsx
let catRegex = /<input \s*value=\{newRecipeForm\.category\}\s*onChange=\{\(e\) => setNewRecipeForm\(\{\.\.\.newRecipeForm, category: e\.target\.value\}\)\}\s*list="fiche-categories-list"\s*className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-\[\#DDA956\]"\s*placeholder="Sélectionner ou saisir\.\.\."\s*\/>\s*<datalist id="fiche-categories-list">[\s\S]*?<\/datalist>/g;

let catReplacement = `<select
                    value={newRecipeForm.category}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, category: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Plats">Plats</option>
                    <option value="Entrées">Entrées</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Boissons">Boissons</option>
                  </select>`;

code = code.replace(catRegex, catReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx");
