const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

if (!code.includes('const [filterCategory')) {
  code = code.replace(
    "const [searchQuery, setSearchQuery] = useState('');",
    "const [searchQuery, setSearchQuery] = useState('');\n  const [filterCategory, setFilterCategory] = useState('');\n  const [filterSupplier, setFilterSupplier] = useState('');\n  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);"
  );
}

const filterBtnSearch = `<button onClick={() => setSearchQuery('')}  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors" title="Effacer la recherche">
              <Filter size={18} />
              <span className="text-sm font-medium">Filtrer</span>
            </button>`;
const filterBtnReplace = `<button onClick={() => setIsFilterModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors" title="Filtrer">
              <Filter size={18} />
              <span className="text-sm font-medium">Filtrer</span>
            </button>`;
code = code.replace(filterBtnSearch, filterBtnReplace);

const filterExpensesSearch = `{expenses.filter(e => (e.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.category || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.id || '').toLowerCase().includes(searchQuery.toLowerCase())).map((expense, idx) => (`;
const filterExpensesReplace = `{expenses
  .filter(e => (e.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.category || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.id || '').toLowerCase().includes(searchQuery.toLowerCase()))
  .filter(e => filterCategory ? e.category === filterCategory : true)
  .filter(e => filterSupplier ? e.supplier === filterSupplier : true)
  .map((expense, idx) => (`;
code = code.replace(filterExpensesSearch, filterExpensesReplace);

const filterModalCode = `
      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Filtres de recherche</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white">
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white">
                  <option value="">Tous les fournisseurs</option>
                  {suppliersList.map((sup, idx) => (
                    <option key={idx} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => { setFilterCategory(''); setFilterSupplier(''); setSearchQuery(''); setIsFilterModalOpen(false); }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium mt-4 hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('Filtres de recherche')) {
  // inject before the last closing div of the component
  const insertionPoint = `      {/* Receipt Modal */}`;
  code = code.replace(insertionPoint, filterModalCode + "\n" + insertionPoint);
}

fs.writeFileSync('src/Accounting.tsx', code);
