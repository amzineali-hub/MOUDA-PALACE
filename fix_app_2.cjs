const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `onClick={async () => {
                    setIsEditSupplierModalOpen(false); setSupplierToDelete(selectedSupplier.id); if (false) {`;

const replace = `onClick={async () => {
                    setIsEditSupplierModalOpen(false);
                    if (confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
