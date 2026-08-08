const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const searchState = `  const [searchQuery, setSearchQuery] = useState('');`;
const replaceState = `  const [searchQuery, setSearchQuery] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');

  const filteredCommandes = useMemo(() => {
    return commandes.filter((cmd) => {
      const matchesSearch = (cmd.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (cmd.fournisseur || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSupplier = filterSupplier ? cmd.fournisseur === filterSupplier : true;
      return matchesSearch && matchesSupplier;
    });
  }, [commandes, searchQuery, filterSupplier]);`;

code = code.replace(searchState, replaceState);

const searchInput = `          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>`;

const replaceInput = `          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {activeTab === 'commandes' && (
              <select 
                value={filterSupplier} 
                onChange={(e) => setFilterSupplier(e.target.value)}
                className="w-full sm:w-48 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F4C75B] bg-white"
              >
                <option value="">Tous les fournisseurs</option>
                {suppliersList.map((sup, idx) => (
                  <option key={idx} value={sup}>{sup}</option>
                ))}
              </select>
            )}
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>`;

code = code.replace(searchInput, replaceInput);

const searchMap = `{commandes.map((cmd) => (`
const replaceMap = `{filteredCommandes.map((cmd) => (`
code = code.replace(searchMap, replaceMap);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
