const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<input\s*name="category"\s*required\s*list="categories-list"\s*className="w-full border border-gray-200 rounded-lg p-2\.5 focus:outline-none focus:border-\[\#DDA956\]"\s*placeholder="Sélectionner ou saisir\.\.\."\s*\/>\s*<datalist id="categories-list">\s*\{categories\.map\(\(cat, idx\) => \(\s*<option key=\{idx\} value=\{cat\} \/>\s*\)\)\}\s*<\/datalist>/g;

const replacement = `<select
                    name="category"
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated product category");
