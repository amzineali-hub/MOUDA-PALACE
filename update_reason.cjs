const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /(<div>\s*)<label className="block text-sm font-medium text-gray-700 mb-1">Raison \/ Commentaire<\/label>\s*<input id="tx-reason" type="text" className="w-full border border-gray-200 rounded-lg p-2\.5 focus:outline-none focus:border-\[\#DDA956\]" placeholder=\{txType === 'in' \? "Ex: Achat du jour" : "Ex: Service Cuisine"\} \/>(\s*<\/div>)/;

const newSection = `$1<label className="block text-sm font-medium text-gray-700 mb-1">
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
                )}$2`;

if (!regex.test(code)) {
    console.log("Could not find match");
} else {
    code = code.replace(regex, newSection);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Done!");
}
