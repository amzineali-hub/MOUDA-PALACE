const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<button 
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsSettingsModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                            title="Historique & Paramètres"
                          >
                            <Settings size={18} />
                          </button>
                        </div>`;

const replacement = `<button 
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsSettingsModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                            title="Historique & Paramètres"
                          >
                            <Settings size={18} />
                          </button>
                          <button 
                            onClick={async () => {
                              if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
                                try {
                                  if (item.id && !item.id.startsWith('INV00')) {
                                    await deleteDoc(doc(db, 'inventoryItems', item.id));
                                  }
                                  showToast("Produit supprimé");
                                } catch (e) {
                                  console.error(e);
                                  showToast("Erreur lors de la suppression", "error");
                                }
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
