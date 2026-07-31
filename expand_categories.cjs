const fs = require('fs');

let recettesCode = fs.readFileSync('src/Recettes.tsx', 'utf8');
const recettesRegex = /<select\s*value=\{categorie\}\s*onChange=\{e => setCategorie\(e\.target\.value\)\}\s*required\s*className="w-full border border-gray-200 rounded-lg p-2\.5 bg-white outline-none focus:border-\[\#DDA956\]"\s*>[\s\S]*?<\/select>/;

const expandedSelectRecettes = `<select
                    value={categorie}
                    onChange={e => setCategorie(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Amuse-bouche">Amuse-bouche</option>
                    <option value="Entrées Froides">Entrées Froides</option>
                    <option value="Entrées Chaudes">Entrées Chaudes</option>
                    <option value="Soupes & Potages">Soupes & Potages</option>
                    <option value="Salades">Salades</option>
                    <option value="Plats Principaux">Plats Principaux</option>
                    <option value="Spécialités du Chef">Spécialités du Chef</option>
                    <option value="Grillades & Rôtis">Grillades & Rôtis</option>
                    <option value="Poissons & Fruits de mer">Poissons & Fruits de mer</option>
                    <option value="Pâtes & Risottos">Pâtes & Risottos</option>
                    <option value="Accompagnements">Accompagnements</option>
                    <option value="Sauces & Condiments">Sauces & Condiments</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Pâtisseries">Pâtisseries</option>
                    <option value="Glaces & Sorbets">Glaces & Sorbets</option>
                    <option value="Boissons Chaudes">Boissons Chaudes</option>
                    <option value="Boissons Froides">Boissons Froides</option>
                    <option value="Cocktails">Cocktails</option>
                  </select>`;

recettesCode = recettesCode.replace(recettesRegex, expandedSelectRecettes);
fs.writeFileSync('src/Recettes.tsx', recettesCode);


let appCode = fs.readFileSync('src/App.tsx', 'utf8');
const appRegex = /<select\s*value=\{newRecipeForm\.category\}\s*onChange=\{\(e\) => setNewRecipeForm\(\{\.\.\.newRecipeForm, category: e\.target\.value\}\)\}\s*className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:border-\[\#DDA956\]"\s*>[\s\S]*?<\/select>/;

const expandedSelectApp = `<select
                    value={newRecipeForm.category}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, category: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Amuse-bouche">Amuse-bouche</option>
                    <option value="Entrées Froides">Entrées Froides</option>
                    <option value="Entrées Chaudes">Entrées Chaudes</option>
                    <option value="Soupes & Potages">Soupes & Potages</option>
                    <option value="Salades">Salades</option>
                    <option value="Plats Principaux">Plats Principaux</option>
                    <option value="Spécialités du Chef">Spécialités du Chef</option>
                    <option value="Grillades & Rôtis">Grillades & Rôtis</option>
                    <option value="Poissons & Fruits de mer">Poissons & Fruits de mer</option>
                    <option value="Pâtes & Risottos">Pâtes & Risottos</option>
                    <option value="Accompagnements">Accompagnements</option>
                    <option value="Sauces & Condiments">Sauces & Condiments</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Pâtisseries">Pâtisseries</option>
                    <option value="Glaces & Sorbets">Glaces & Sorbets</option>
                    <option value="Boissons Chaudes">Boissons Chaudes</option>
                    <option value="Boissons Froides">Boissons Froides</option>
                    <option value="Cocktails">Cocktails</option>
                  </select>`;

appCode = appCode.replace(appRegex, expandedSelectApp);
fs.writeFileSync('src/App.tsx', appCode);

console.log("Expanded categories in both files.");
