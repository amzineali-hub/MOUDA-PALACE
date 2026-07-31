const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = '<label className="block text-sm font-medium text-gray-700 mb-1">Raison / Commentaire</label>\\n                <input id="tx-reason" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder={txType === \\'in\\' ? "Ex: Achat du jour" : "Ex: Service Cuisine"} />';

const targetStrAlt = \`<label className="block text-sm font-medium text-gray-700 mb-1">Raison / Commentaire</label>
                <input id="tx-reason" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder={txType === 'in' ? "Ex: Achat du jour" : "Ex: Service Cuisine"} />\`;

const replacement = \`<label className="block text-sm font-medium text-gray-700 mb-1">
                  {txType === 'out' ? 'Destinataire' : 'Raison / Commentaire'}
                </label>
                {txType === 'out' ? (
                  <select id="tx-reason" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                    <option value="">Sélectionner une destination</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Bar">Bar</option>
                  </select>
                ) : (
                  <input id="tx-reason" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Achat du jour" />
                )}\`;

code = code.replace(targetStrAlt, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Replaced");
