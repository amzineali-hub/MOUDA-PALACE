const fs = require('fs');
let content = fs.readFileSync('src/Recettes.tsx', 'utf-8');
content = content.replace(
  /<select\s+value=\{categorie\}\s+onChange=\{e => setCategorie\(e\.target\.value\)\}\s+required\s+className="w-full border border-gray-200 rounded-lg p\.2\.5 bg-white outline-none focus:border-\[#F4C75B\]"\s*>\s*<option value="">Sélectionner une catégorie<\/option>\s*<option value="Amuse-bouche">Amuse-bouche<\/option>\s*<option value="Entrées Froides">Entrées Froides<\/option>\s*<option value="Entrées Chaudes">Entrées Chaudes<\/option>\s*<option value="Soupes & Potages">Soupes & Potages<\/option>\s*<option value="Salades">Salades<\/option>\s*<option value="Plats Végétariens">Plats Végétariens<\/option>\s*<option value="Poissons & Fruits de mer">Poissons & Fruits de mer<\/option>\s*<option value="Viandes">Viandes<\/option>\s*<option value="Volailles">Volailles<\/option>\s*<option value="Pâtes & Risottos">Pâtes & Risottos<\/option>\s*<option value="Accompagnements">Accompagnements<\/option>\s*<option value="Fromages">Fromages<\/option>\s*<option value="Desserts">Desserts<\/option>\s*<option value="Pâtisseries">Pâtisseries<\/option>\s*<option value="Glaces & Sorbets">Glaces & Sorbets<\/option>\s*<option value="Sauces & Condiments">Sauces & Condiments<\/option>\s*<\/select>/gs,
  `<input
                    list="recettes-categories-list"
                    value={categorie}
                    onChange={e => setCategorie(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#F4C75B]"
                    placeholder="Ex: Entrées Froides"
                  />
                  <datalist id="recettes-categories-list">
                    <option value="Amuse-bouche" />
                    <option value="Entrées Froides" />
                    <option value="Entrées Chaudes" />
                    <option value="Soupes & Potages" />
                    <option value="Salades" />
                    <option value="Plats Végétariens" />
                    <option value="Poissons & Fruits de mer" />
                    <option value="Viandes" />
                    <option value="Volailles" />
                    <option value="Pâtes & Risottos" />
                    <option value="Accompagnements" />
                    <option value="Fromages" />
                    <option value="Desserts" />
                    <option value="Pâtisseries" />
                    <option value="Glaces & Sorbets" />
                    <option value="Sauces & Condiments" />
                  </datalist>`
);
fs.writeFileSync('src/Recettes.tsx', content);
console.log("Done Recettes");
