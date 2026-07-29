const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const target = `<td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedCommande(cmd);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-[#DDA956] hover:text-[#C89845] font-medium text-sm flex items-center justify-end gap-1 w-full"
                      >
                        Détails <ChevronRight size={16} />
                      </button>
                    </td>`;

const replacement = `<td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <button 
                          onClick={() => {
                            setSelectedCommande(cmd);
                            setIsDetailsModalOpen(true);
                          }}
                          className="text-[#DDA956] hover:text-[#C89845] font-medium text-sm flex items-center justify-end gap-1"
                        >
                          Détails <ChevronRight size={16} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('Voulez-vous vraiment supprimer cette commande ?')) {
                              try {
                                if (cmd.id && !cmd.id.startsWith('CMD')) {
                                  await deleteDoc(doc(db, 'commandes', cmd.id));
                                } else {
                                  setCommandes(prev => prev.filter(c => c.id !== cmd.id));
                                }
                                showToast("Commande supprimée");
                              } catch (e) {
                                console.error(e);
                                showToast("Erreur lors de la suppression", "error");
                              }
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-medium text-sm"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>`;

content = content.replace(target, replacement);
if (!content.includes('Trash2')) {
  content = content.replace(
    "import { Plus, Search, ShoppingCart, Truck, FileText, CheckCircle, Clock, AlertTriangle, ChevronRight, Store, X, Sparkles, Brain, TrendingUp, Loader2, Calendar } from 'lucide-react';",
    "import { Plus, Search, ShoppingCart, Truck, FileText, CheckCircle, Clock, AlertTriangle, ChevronRight, Store, X, Sparkles, Brain, TrendingUp, Loader2, Calendar, Trash2 } from 'lucide-react';"
  );
}
fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
