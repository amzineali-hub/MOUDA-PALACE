const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const originalBadBlock = `<h4 className="font-medium text-gray-900">Ingrédients (Nécessite connexion à l'inventaire)</h4>
                          <button onClick={() => showToast && showToast('Action en cours de développement...')} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Action</button>
              </div>
            </div>
          </div>
        </div>
      )}`;

const replacement = `<h4 className="font-medium text-gray-900">Ingrédients (Nécessite connexion à l'inventaire)</h4>
                  <button onClick={() => showToast && showToast('Action en cours de développement...')} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Action</button>
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

content = content.replace(originalBadBlock, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log("Did it replace? ", content.includes(replacement));
