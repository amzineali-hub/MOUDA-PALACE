const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const target = `              <button type="submit" className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-black transition-colors">
                Mettre à jour
              </button>`;

const replacement = `              <button type="submit" className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-black transition-colors">
                Mettre à jour
              </button>
              <button 
                type="button"
                onClick={async () => {
                  if (window.confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
                    try {
                      if (selectedFournisseur.id && !selectedFournisseur.id.startsWith('F00')) {
                        await deleteDoc(doc(db, 'fournisseurs', selectedFournisseur.id));
                      } else {
                        setFournisseurs(prev => prev.filter(f => f.id !== selectedFournisseur.id));
                      }
                      showToast("Fournisseur supprimé");
                      setIsEditSupplierModalOpen(false);
                    } catch (e) {
                      console.error(e);
                      showToast("Erreur lors de la suppression", "error");
                    }
                  }
                }}
                className="w-full mt-2 bg-white text-red-500 border border-red-200 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors"
              >
                Supprimer le fournisseur
              </button>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
