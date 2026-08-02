const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add state variable
const stateTarget = `const [searchQuery, setSearchQuery] = useState('');
  const [expirationFilter, setExpirationFilter] = useState("Tous");`;
const stateReplacement = `const [searchQuery, setSearchQuery] = useState('');
  const [expirationFilter, setExpirationFilter] = useState("Tous");
  const [stockAlertFilter, setStockAlertFilter] = useState(false);`;

code = code.replace(stateTarget, stateReplacement);

// 2. Update filter logic
const filterTarget = `let matchesExpiration = true;
    if (expirationFilter === 'Expirés' || expirationFilter === 'En attente') {`;
const filterReplacement = `const matchesAlert = stockAlertFilter ? item.quantity <= item.minStock : true;
    
    let matchesExpiration = true;
    if (expirationFilter === 'Expirés' || expirationFilter === 'En attente' || expirationFilter === 'Proche/Expiré') {`;

code = code.replace(filterTarget, filterReplacement);

const filterTarget2 = `} else if (expirationFilter === 'En attente') {
          matchesExpiration = diffDays > 0 && diffDays <= 7;
        }
      }
    }
    
    return matchesSearch && matchesCategory && matchesExpiration;`;
const filterReplacement2 = `} else if (expirationFilter === 'En attente') {
          matchesExpiration = diffDays > 0 && diffDays <= 7;
        } else if (expirationFilter === 'Proche/Expiré') {
          matchesExpiration = diffDays <= 7;
        }
      }
    }
    
    return matchesSearch && matchesCategory && matchesExpiration && matchesAlert;`;

code = code.replace(filterTarget2, filterReplacement2);

// 3. Update expiration options
const optionsTarget = `<option value="Expirés">Expirés</option>
                </select>`;
const optionsReplacement = `<option value="Expirés">Expirés</option>
                  <option value="Proche/Expiré">Proche / Expirés (≤ 7j)</option>
                </select>`;
code = code.replace(optionsTarget, optionsReplacement);

// 4. Update the stats cards to make them clickable
const statsTarget = `{/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">`;

const statsEndTarget = `</h4>
          </div>
        </div>
      </div>`;

const indexOfStatsStart = code.indexOf(statsTarget);
const indexOfStatsEnd = code.indexOf(statsEndTarget, indexOfStatsStart);

if (indexOfStatsStart !== -1 && indexOfStatsEnd !== -1) {
  const oldStats = code.substring(indexOfStatsStart, indexOfStatsEnd + statsEndTarget.length);
  const newStats = `{/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => {
            setActiveTab('stocks');
            setExpirationFilter('Tous');
            setStockAlertFilter(false);
            setSelectedCategory('Tous');
            setSearchQuery('');
          }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#F4C75B] hover:shadow-md transition-all group"
        >
          <div className="p-4 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-[#F4C75B]/10 group-hover:text-[#265C6D] transition-colors">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Références</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{stockItemsData.length}</h4>
          </div>
        </div>
        <div 
          onClick={() => {
            setActiveTab('stocks');
            setStockAlertFilter(true);
            setExpirationFilter('Tous');
            setSelectedCategory('Tous');
            setSearchQuery('');
          }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-red-300 hover:shadow-md transition-all group"
        >
          <div className="p-4 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alertes Stock Bas</p>
            <h4 className="text-2xl font-bold text-red-600 mt-1">
              {stockItemsData.filter(i => i.quantity <= i.minStock).length}
            </h4>
          </div>
        </div>
        <div 
          onClick={() => setActiveTab('suppliers')}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="p-4 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-100 transition-colors">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Fournisseurs Actifs</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{fournisseurs.length}</h4>
          </div>
        </div>
        <div 
          onClick={() => {
            setActiveTab('stocks');
            setExpirationFilter('Proche/Expiré');
            setStockAlertFilter(false);
            setSelectedCategory('Tous');
            setSearchQuery('');
          }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group"
        >
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
            <CalendarClock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Péremption Proche/Expiré</p>
            <h4 className="text-2xl font-bold text-orange-600 mt-1">
              {stockItemsData.filter(i => {
                if (!i.expirationDate) return false;
                const expDate = new Date(i.expirationDate);
                const today = new Date();
                const diffTime = expDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length}
            </h4>
          </div>
        </div>
      </div>`;
  code = code.replace(oldStats, newStats);
} else {
  console.log('Failed to find stats block');
}

// 5. Add a toggle button for stock alert filter next to expiration filter
const filterBarTarget = `<select 
                  value={expirationFilter}`;
const filterBarReplacement = `
              <div className="w-full sm:w-auto">
                <button
                  onClick={() => setStockAlertFilter(!stockAlertFilter)}
                  className={\`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors flex items-center justify-center gap-2 \${stockAlertFilter ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}\`}
                >
                  <AlertTriangle size={16} />
                  <span>{stockAlertFilter ? 'Alertes actives' : 'Stock bas'}</span>
                </button>
              </div>
              <select 
                  value={expirationFilter}`;

code = code.replace(filterBarTarget, filterBarReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated successfully.');
