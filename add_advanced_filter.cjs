const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add the state
code = code.replace(
  'const [stockAlertFilter, setStockAlertFilter] = useState(false);',
  'const [stockAlertFilter, setStockAlertFilter] = useState(false);\n  const [advancedAlertFilter, setAdvancedAlertFilter] = useState(false);'
);

// 2. Add the UI button
const btnSearch = `              <div className="w-full sm:w-auto">
                <button
                  onClick={() => setStockAlertFilter(!stockAlertFilter)}
                  className={\`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors flex items-center justify-center gap-2 \${stockAlertFilter ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}\`}
                >
                  <AlertTriangle size={16} />
                  <span>{stockAlertFilter ? 'Alertes actives' : 'Stock bas'}</span>
                </button>
              </div>`;
const btnReplace = `              <div className="w-full sm:w-auto">
                <button
                  onClick={() => {
                    setStockAlertFilter(!stockAlertFilter);
                    if (!stockAlertFilter) setAdvancedAlertFilter(false);
                  }}
                  className={\`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors flex items-center justify-center gap-2 \${stockAlertFilter ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}\`}
                >
                  <AlertTriangle size={16} />
                  <span>{stockAlertFilter ? 'Alertes actives' : 'Stock bas'}</span>
                </button>
              </div>
              <div className="w-full sm:w-auto">
                <button
                  onClick={() => {
                    setAdvancedAlertFilter(!advancedAlertFilter);
                    if (!advancedAlertFilter) setStockAlertFilter(false);
                  }}
                  className={\`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors flex items-center justify-center gap-2 \${advancedAlertFilter ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}\`}
                  title="Stock bas & DLC < 15j"
                >
                  <AlertTriangle size={16} />
                  <span>Priorité Achats</span>
                </button>
              </div>`;
code = code.replace(btnSearch, btnReplace);

// 3. Update the filtering logic
const filterSearch = `    let matchesExpiration = true;
    if (expirationFilter === 'Expirés' || expirationFilter === 'En attente' || expirationFilter === 'Proche/Expiré') {
      if (!item.expirationDate) {
        matchesExpiration = false;
      } else {
        const expDate = new Date(item.expirationDate);
        const today = new Date();
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (expirationFilter === 'Expirés') {
          matchesExpiration = diffDays <= 0;
        } else if (expirationFilter === 'En attente') {
          matchesExpiration = diffDays > 0 && diffDays <= 7;
        } else if (expirationFilter === 'Proche/Expiré') {
          matchesExpiration = diffDays <= 7;
        }
      }
    }

    return matchesSearch && matchesCategory && matchesExpiration && matchesAlert;
  }).sort((a, b) => {`;
const filterReplace = `    let matchesExpiration = true;
    if (expirationFilter === 'Expirés' || expirationFilter === 'En attente' || expirationFilter === 'Proche/Expiré') {
      if (!item.expirationDate) {
        matchesExpiration = false;
      } else {
        const expDate = new Date(item.expirationDate);
        const today = new Date();
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (expirationFilter === 'Expirés') {
          matchesExpiration = diffDays <= 0;
        } else if (expirationFilter === 'En attente') {
          matchesExpiration = diffDays > 0 && diffDays <= 7;
        } else if (expirationFilter === 'Proche/Expiré') {
          matchesExpiration = diffDays <= 7;
        }
      }
    }

    let matchesAdvancedAlert = true;
    if (advancedAlertFilter) {
      if (item.quantity > item.minStock || !item.expirationDate) {
         matchesAdvancedAlert = false;
      } else {
         const expDate = new Date(item.expirationDate);
         const today = new Date();
         const diffTime = expDate.getTime() - today.getTime();
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         if (diffDays >= 15) {
             matchesAdvancedAlert = false;
         }
      }
    }

    return matchesSearch && matchesCategory && matchesExpiration && matchesAlert && matchesAdvancedAlert;
  }).sort((a, b) => {`;
code = code.replace(filterSearch, filterReplace);

// 4. Update the resets
code = code.replace(/setStockAlertFilter\(false\);/g, 'setStockAlertFilter(false);\n            setAdvancedAlertFilter(false);');

// Clean up any double additions
code = code.replace(/setAdvancedAlertFilter\(false\);\n            setAdvancedAlertFilter\(false\);/g, 'setAdvancedAlertFilter(false);');

fs.writeFileSync('src/App.tsx', code);
