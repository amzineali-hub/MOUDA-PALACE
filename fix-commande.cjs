const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  /<select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-\[#F4C75B\] focus:border-transparent outline-none transition-all">\s*<option value="">Sélectionner un fournisseur régulier<\/option>\s*<option value="f1">Fournisseur Principal \(Marché Central\)<\/option>\s*<option value="f2">Grossiste Viande & Volaille<\/option>\s*<option value="f3">Distributeur Epicerie Fine<\/option>\s*<\/select>/gs,
  `<input list="suppliers-list" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all" placeholder="Ex: Marché Central" />
                  <datalist id="suppliers-list">
                    {suppliersList.map((sup, idx) => (
                      <option key={idx} value={sup} />
                    ))}
                  </datalist>`
);
fs.writeFileSync('src/App.tsx', content);
console.log("Done Commande App");
