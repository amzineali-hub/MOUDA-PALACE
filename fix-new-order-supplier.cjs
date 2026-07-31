const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /<select name="supplier" required className="w-full border border-gray-200 rounded-lg p-2\.5 focus:outline-none focus:border-\[#F4C75B\]">\s*<option>Coopérative Taliouine<\/option>\s*<option>Ferme Atlas<\/option>\s*<option>Boucherie Centrale<\/option>\s*<\/select>/gs,
  `<input name="supplier" list="dl-new-order-sup" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Ferme Atlas" />
                <datalist id="dl-new-order-sup">
                  {suppliersList.map((sup, idx) => (
                    <option key={idx} value={sup} />
                  ))}
                </datalist>`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed new order supplier in App.tsx");
