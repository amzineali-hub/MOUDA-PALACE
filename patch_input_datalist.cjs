const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<input
                  type="text"
                  value={semiFinishedForm.name}
                  onChange={(e) => setSemiFinishedForm({...semiFinishedForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  placeholder="Ex: Pâte à pizza"
                />`;
                
const replacement = `<input
                  list="fiches-list"
                  type="text"
                  value={semiFinishedForm.name}
                  onChange={(e) => setSemiFinishedForm({...semiFinishedForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  placeholder="Ex: Pâte à pizza"
                />
                <datalist id="fiches-list">
                  {Array.from(new Set([...recipes.map(r => r.name), ...fichesTechniques.map(f => f.name)])).map((name: any, idx) => (
                    <option key={idx} value={name} />
                  ))}
                </datalist>`;
                
content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched datalist");
