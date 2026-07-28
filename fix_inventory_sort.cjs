const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');`;
const replacementState = `  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };`;

const targetFilter = `  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });`;
const replacementFilter = `  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });`;

const targetTableHead = `                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Produit</th>
                    <th className="px-6 py-4">Catégorie</th>
                    <th className="px-6 py-4">Fournisseur</th>
                    <th className="px-6 py-4">Quantité</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>`;
const replacementTableHead = `                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">Produit {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('category')}>
                      <div className="flex items-center gap-1">Catégorie {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('supplier')}>
                      <div className="flex items-center gap-1">Fournisseur {sortConfig.key === 'supplier' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('quantity')}>
                      <div className="flex items-center gap-1">Quantité {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>`;

if (code.includes(targetState) && code.includes(targetFilter) && code.includes(targetTableHead)) {
  code = code.replace(targetState, replacementState);
  code = code.replace(targetFilter, replacementFilter);
  code = code.replace(targetTableHead, replacementTableHead);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated inventory sorting");
} else {
  console.log("Could not find targets");
}
