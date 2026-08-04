const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                <input
                  list="fiches-list"
                  type="text"
                  value={semiFinishedForm.name}
                  onChange={(e) => setSemiFinishedForm({...semiFinishedForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  placeholder="Ex: Pâte à pizza"
                />
                <datalist id="fiches-list">
                  {Array.from(new Set([
                    "Pâte à pizza", "Sauce tomate", "Pâte brisée", "Pâte feuilletée", 
                    "Fond de veau", "Bouillon de volaille", "Crème pâtissière", "Sauce béchamel",
                    ...recipes.map(r => r.name), ...fichesTechniques.map(f => f.name)
                  ])).map((name: any, idx) => (
                    <option key={idx} value={name} />
                  ))}
                </datalist>`;
                
const rep = `<label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                <select
                  value={semiFinishedForm.name}
                  onChange={(e) => setSemiFinishedForm({...semiFinishedForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                >
                  <option value="">Sélectionner un plat</option>
                  {Array.from(new Set([
                    "Pâte à pizza", "Sauce tomate", "Pâte brisée", "Pâte feuilletée", 
                    "Fond de veau", "Bouillon de volaille", "Crème pâtissière", "Sauce béchamel",
                    ...recipes.map(r => r.name), ...fichesTechniques.map(f => f.nom || f.name)
                  ])).filter(Boolean).map((name: any, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ))}
                </select>`;
                
if (content.includes('list="fiches-list"')) {
    content = content.replace(target, rep);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Patched Semi Finished Modal");
} else {
    console.log("Could not find target in App.tsx");
}
