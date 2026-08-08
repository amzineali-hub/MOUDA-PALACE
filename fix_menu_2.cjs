const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

const search = `onClick={async () => {
                    setDishToDelete(editingItem.id); setEditingItem(null); // if (false) {
                      try { await deleteDoc(doc(db, 'menu_items', editingItem.id)); showToast('Plat supprimé.'); } catch (e) { showToast('Erreur lors de la suppression.', 'error'); }
                      setIsAddModalOpen(false);
                    }
                  }}`;
                  
const replace = `onClick={() => {
                    setDishToDelete(editingItem.id); 
                    setEditingItem(null);
                    setIsAddModalOpen(false);
                  }}`;

code = code.replace(search, replace);
fs.writeFileSync('src/MenuGenerator.tsx', code);
