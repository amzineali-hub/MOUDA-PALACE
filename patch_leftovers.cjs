const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');
code = code.replace(/if \(window\.confirm\('Voulez-vous vraiment supprimer ce plat du menu \?'\)\) \{/g, `setDishToDelete(editingItem.id); setEditingItem(null); if (false) {`);
fs.writeFileSync('src/MenuGenerator.tsx', code);

code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');
code = code.replace(/if \(window\.confirm\('Voulez-vous vraiment supprimer cette commande \?'\)\) \{/g, `setCommandeToDelete(commande.id); if (false) {`);
code = code.replace(/if \(window\.confirm\('Voulez-vous vraiment supprimer ce fournisseur \?'\)\) \{/g, `setFournisseurToDelete(f.id); if (false) {`);
code = code.replace(/if \(window\.confirm\("Voulez-vous vraiment refuser entièrement cette livraison \?"\)\) \{/g, `setDeliveryToReject(commande.id); if (false) {`);
// Also check selectedItem.id usages if there are any left.
// Actually, I already replaced the one using selectedItem.id, but let's check what's on line 711.
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);

code = fs.readFileSync('src/FichesTechniques.tsx', 'utf8');
code = code.replace(/if \(confirm\('Voulez-vous vraiment supprimer cette fiche technique \?'\)\) \{/g, `setFicheToDelete(id); if (false) {`);
fs.writeFileSync('src/FichesTechniques.tsx', code);

code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/if \(window\.confirm\("Voulez-vous vraiment supprimer ce fournisseur \?"\)\) \{/g, `setIsEditSupplierModalOpen(false); setSupplierToDelete(selectedSupplier.id); if (false) {`);
fs.writeFileSync('src/App.tsx', code);
