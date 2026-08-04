const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add tab
code = code.replace(
  "['stocks', 'requirements', 'production', 'waste', 'transactions', 'suppliers', 'price_history']",
  "['stocks', 'requirements', 'semi_finished', 'production', 'waste', 'transactions', 'suppliers', 'price_history']"
);

// 2. Add tab label
code = code.replace(
  "{tab === 'production' && 'Production Journalière'}",
  "{tab === 'semi_finished' && 'Produits Semi-finis'}\n              {tab === 'production' && 'Production Journalière'}"
);

// 3. Add tab content (mock for now, or just an empty container)
const semiFinishedContent = `
          {activeTab === 'semi_finished' && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Produits Semi-finis</h3>
                <button 
                  onClick={() => showToast('Fonctionnalité en cours de développement...')}
                  className="px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Nouveau Produit
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-500 mb-4">
                  <ChefHat size={24} />
                </div>
                <p>La gestion des produits semi-finis sera bientôt disponible.</p>
              </div>
            </div>
          )}
`;
code = code.replace(
  "{activeTab === 'production' && (",
  semiFinishedContent + "\n          {activeTab === 'production' && ("
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched semi_finished tab');
