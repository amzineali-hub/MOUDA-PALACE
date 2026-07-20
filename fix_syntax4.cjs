const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const fix1 = `              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Ingrédients (Nécessite connexion à l'inventaire)</h4>
                  <button onClick={() => showToast && showToast('Action en cours de développement...')} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Plus size={16} /> Ajouter Ingrédient
                  </button>
                </div>
                {/* Simplified ingredient list for demo */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">Poulet Entier</div>
                      <div className="text-xs text-gray-500">Stock dispo: 15 unités</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" defaultValue={0.5} className="w-20 border border-gray-200 rounded-lg p-1.5 text-center" />
                      <span className="text-sm text-gray-600">Unité</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  showToast("Fiche technique créée avec succès");
                  setIsNewRecipeModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Sauvegarder Fiche Technique
              </button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(
    /Ingrédients \(Nécessite connexion à l'inventaire\)<\/h4>\s*<button onClick=\{\(\) => showToast && showToast\('Action en cours de développement\.\.\.'\)\} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Action<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/,
    fix1
);

fs.writeFileSync('src/App.tsx', content);
