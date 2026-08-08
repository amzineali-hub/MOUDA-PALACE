const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

// Remove the incorrect date filter from Nouvelle Dépense
const incorrectDateSearch = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white" title="Filtre par date" />
              </div>\n`;

code = code.replace(incorrectDateSearch, '');

// Add it to the Filter Modal
const filterModalSearch = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>`;
const filterModalReplace = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white" title="Filtre par date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>`;

if (!code.includes('Filtre par date')) {
  code = code.replace(filterModalSearch, filterModalReplace);
}

fs.writeFileSync('src/Accounting.tsx', code);
