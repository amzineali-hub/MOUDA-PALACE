const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

// Add filterDate state
if (!code.includes('const [filterDate')) {
  code = code.replace(
    "const [filterSupplier, setFilterSupplier] = useState('');",
    "const [filterSupplier, setFilterSupplier] = useState('');\n  const [filterDate, setFilterDate] = useState('');"
  );
}

// Update reset filter logic
code = code.replace(
  "onClick={() => { setFilterCategory(''); setFilterSupplier(''); setSearchQuery(''); setIsFilterModalOpen(false); }}",
  "onClick={() => { setFilterCategory(''); setFilterSupplier(''); setFilterDate(''); setSearchQuery(''); setIsFilterModalOpen(false); }}"
);

// Add Date input in the modal
const modalCategoryInput = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>`;
if (!code.includes('Filtre par date')) {
  const dateInput = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white" title="Filtre par date" />
              </div>\n`;
  code = code.replace(modalCategoryInput, dateInput + modalCategoryInput);
}

// Update the filter logic in the expenses table
const expensesFilterSearch = `.filter(e => filterSupplier ? e.supplier === filterSupplier : true)
  .map((expense, idx) => (`;
const expensesFilterReplace = `.filter(e => filterSupplier ? e.supplier === filterSupplier : true)
  .filter(e => filterDate ? e.date === filterDate : true)
  .map((expense, idx) => (`;
code = code.replace(expensesFilterSearch, expensesFilterReplace);

fs.writeFileSync('src/Accounting.tsx', code);
