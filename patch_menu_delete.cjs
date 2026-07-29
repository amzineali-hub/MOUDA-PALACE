const fs = require('fs');
let content = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

const target = `                <button 
                  type="submit"
                  className="flex-1 bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Enregistrer
                </button>
              </div>`;

const replacement = `                <button 
                  type="submit"
                  className="flex-1 bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Enregistrer
                </button>
              </div>
              {editingItem && (
                <button 
                  type="button"
                  onClick={() => {
                    if (window.confirm('Voulez-vous vraiment supprimer ce plat du menu ?')) {
                      handleDelete(editingItem.id);
                      setIsAddModalOpen(false);
                    }
                  }}
                  className="w-full mt-2 bg-white text-red-500 border border-red-200 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Supprimer ce plat
                </button>
              )}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/MenuGenerator.tsx', content);
