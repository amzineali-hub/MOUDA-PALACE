const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const regex = /(<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Articles à commander<\/label>\s*<div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100 bg-gray-50\/50">\s*\{\(\(\) => \{)([\s\S]*?)(const grouped = inventoryItems.reduce\(\(acc, item\) => \{)/;

const replacement = `<div>
                <div className="flex justify-between items-end mb-2 gap-4">
                  <label className="block text-sm font-medium text-gray-700 pb-2">Articles à commander</label>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher (produit, catégorie, fournisseur)..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                    />
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100 bg-gray-50/50">
                  {(() => {
                    const searchLower = productSearch.toLowerCase();
                    const filteredItems = inventoryItems.filter(item => {
                      const matchName = (item.name || '').toLowerCase().includes(searchLower);
                      const matchCat = (item.category || '').toLowerCase().includes(searchLower);
                      const matchSup = (item.supplier || '').toLowerCase().includes(searchLower);
                      
                      // Also check initials (e.g. "FT" for "Farine T55")
                      const initials = (item.name || '').split(' ').map((w: string) => w[0]).join('').toLowerCase();
                      const matchInitials = initials.includes(searchLower);
                      
                      return matchName || matchCat || matchSup || matchInitials;
                    });

                    if (filteredItems.length === 0) {
                      return <div className="p-4 text-sm text-gray-500 text-center">Aucun produit trouvé</div>;
                    }

                    const grouped = filteredItems.reduce((acc, item) => {`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
