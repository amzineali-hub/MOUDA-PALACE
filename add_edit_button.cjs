const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const searchBar = `              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un plat..." 
                  className="w-full pl-12 pr-4 py-3 bg-white border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DDA956] text-gray-700 font-medium transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>`;

const newSearchBar = `              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Rechercher un plat..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DDA956] text-gray-700 font-medium transition-all"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={\`p-3 rounded-2xl transition-colors \${isEditMode ? 'bg-red-100 text-red-600' : 'bg-white text-gray-500 hover:bg-gray-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'}\`}
                  title={isEditMode ? "Désactiver le mode édition" : "Activer le mode édition (suppression)"}
                >
                  <Trash2 size={20} />
                </button>
              </div>`;

code = code.replace(searchBar, newSearchBar);

fs.writeFileSync('src/POSTactile.tsx', code);
