const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target1 = `<th className="px-6 py-4">Article à préparer</th>`;
const rep1 = `<th className="px-6 py-4">Plats semi finis</th>`;
content = content.replace(target1, rep1);

const target2 = `<label className="block text-sm font-medium text-gray-700 mb-1">Article à préparer</label>
                <input 
                  type="text" 
                  value={prodTaskForm.item}
                  onChange={e => setProdTaskForm({...prodTaskForm, item: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                  placeholder="Ex: Pigeons (Désossage)"
                />`;
const rep2 = `<label className="block text-sm font-medium text-gray-700 mb-1">Plats semi finis</label>
                <select 
                  value={prodTaskForm.item}
                  onChange={e => setProdTaskForm({...prodTaskForm, item: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                >
                  <option value="">Sélectionner un plat</option>
                  {Array.from(new Set([
                    ...recipes.map(r => r.name),
                    ...fichesTechniques.map(f => f.nom || f.name),
                    ...semiFinished.map(s => s.name)
                  ])).filter(Boolean).map((name: any, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ))}
                </select>`;
content = content.replace(target2, rep2);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched Prod task modal");
