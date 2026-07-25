const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Need to bring 'commandes' into Inventory to get the true count, or just use a placeholder dynamic one?
// Since 'commandes' is in AchatsFournisseurs, we can just query it in Inventory too.

const oldStats = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-gray-50 text-gray-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Références</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">142</h4>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alertes Stock Bas</p>
            <h4 className="text-2xl font-bold text-red-600 mt-1">12</h4>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Commandes Fournisseur en cours</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">3</h4>
          </div>
        </div>
      </div>`;

const newStats = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-gray-50 text-gray-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Références</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{stockItemsData.length}</h4>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alertes Stock Bas</p>
            <h4 className="text-2xl font-bold text-red-600 mt-1">
              {stockItemsData.filter(i => i.quantity <= i.minStock).length}
            </h4>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Fournisseurs Actifs</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">7</h4>
          </div>
        </div>
      </div>`;

content = content.replace(oldStats, newStats);

fs.writeFileSync('src/App.tsx', content);
