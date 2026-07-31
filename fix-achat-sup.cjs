const fs = require('fs');

let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

content = content.replace(
  /<select name="supplier" required defaultValue=\{selectedCommande\?\.fournisseurId \|\| ''\} className="w-full border border-gray-200 rounded-lg p-2\.5 focus:outline-none focus:border-\[#F4C75B\] bg-white">\s*<option value="">Sélectionnez un fournisseur<\/option>\s*\{fournisseurs\.map\(f => \(\s*<option key=\{f\.id\} value=\{f\.id\}>\{f\.nom\}<\/option>\s*\)\)\}\s*<\/select>/gs,
  `<input name="supplier" list="dl-achats-suppliers" required defaultValue={selectedCommande?.fournisseurId || ''} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white" placeholder="Nom du fournisseur" />
                <datalist id="dl-achats-suppliers">
                  {suppliersList.map((sup, idx) => (
                    <option key={idx} value={sup} />
                  ))}
                </datalist>`
);

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log("Fixed supplier in AchatsFournisseurs.tsx");
