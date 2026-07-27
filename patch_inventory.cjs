const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const stateAdd = `  const [txType, setTxType] = useState<'in' | 'out'>('in');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');`;
code = code.replace("  const [txType, setTxType] = useState<'in' | 'out'>('in');", stateAdd);

const mappedAdd = `  const stockItems = stockItemsData.map(item => ({ ...item, status: calculateStockStatus(item.quantity, item.minStock) }));
  
  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });`;
code = code.replace("  const stockItems = stockItemsData.map(item => ({ ...item, status: calculateStockStatus(item.quantity, item.minStock) }));", mappedAdd);

const uiAdd = `          {activeTab === 'stocks' && (
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                />
              </div>
              <div className="w-full sm:w-64">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                >
                  <option value="Tous">Toutes les catégories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {activeTab === 'stocks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">`;
code = code.replace(`          {activeTab === 'stocks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">`, uiAdd);

const renderAdd = `                <tbody className="divide-y divide-gray-100">
                  {filteredStockItems.map(item => (`;
code = code.replace(`                <tbody className="divide-y divide-gray-100">
                  {stockItems.map(item => (`, renderAdd);

fs.writeFileSync('src/App.tsx', code);
