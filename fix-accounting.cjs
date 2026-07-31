const fs = require('fs');
let content = fs.readFileSync('src/Accounting.tsx', 'utf-8');
content = content.replace(
  /<select name="category" className="w-full border border-gray-200 rounded-lg p-2\.5 focus:outline-none focus:border-\[#F4C75B\] bg-white">\s*<option>Marchandise<\/option>\s*<option>Électricité<\/option>\s*<option>Marketing<\/option>\s*<option>Salaires<\/option>\s*<option>Loyer & Charges<\/option>\s*<option>Divers<\/option>\s*<\/select>/gs,
  `<input name="category" list="accounting-categories" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Marchandise" />
                <datalist id="accounting-categories">
                  <option value="Marchandise" />
                  <option value="Électricité" />
                  <option value="Marketing" />
                  <option value="Salaires" />
                  <option value="Loyer & Charges" />
                  <option value="Divers" />
                  <option value="Assurances" />
                  <option value="Frais Bancaires" />
                  <option value="Entretien & Réparations" />
                </datalist>`
);
fs.writeFileSync('src/Accounting.tsx', content);
console.log("Done Accounting");
