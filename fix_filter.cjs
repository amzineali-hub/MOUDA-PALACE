const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const search = `{expenses.map((expense, idx) => (`;
const replace = `{expenses.filter(e => e.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) || e.category?.toLowerCase().includes(searchQuery.toLowerCase()) || e.id?.toLowerCase().includes(searchQuery.toLowerCase())).map((expense, idx) => (`;
code = code.replace(search, replace);

const receiptsSearch = `{receipts.map((receipt, idx) => (`;
const receiptsReplace = `{receipts.filter(r => r.displayId?.toLowerCase().includes(searchQuery.toLowerCase()) || r.id?.toLowerCase().includes(searchQuery.toLowerCase()) || r.method?.toLowerCase().includes(searchQuery.toLowerCase())).map((receipt, idx) => (`;
code = code.replace(receiptsSearch, receiptsReplace);

const filterBtnSearch = `<button onClick={() => showToast && showToast('Action en cours de développement...')}  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter size={18} />
              <span className="text-sm font-medium">Filtrer</span>
            </button>`;
const filterBtnReplace = `<button onClick={() => setSearchQuery('')}  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors" title="Effacer la recherche">
              <Filter size={18} />
              <span className="text-sm font-medium">Filtrer</span>
            </button>`;
code = code.replace(filterBtnSearch, filterBtnReplace);

fs.writeFileSync('src/Accounting.tsx', code);
