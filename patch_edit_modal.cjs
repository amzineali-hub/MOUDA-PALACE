const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/defaultValue={selectedSupplier\.name}/g, 'defaultValue={selectedSupplier.name || selectedSupplier.nom}');
code = code.replace(/defaultValue={selectedSupplier\.category}/g, 'defaultValue={selectedSupplier.category || selectedSupplier.categorie}');
code = code.replace(/defaultValue={selectedSupplier\.phone}/g, 'defaultValue={selectedSupplier.phone || selectedSupplier.telephone}');
// Contact, email, city should be fine if they were the same, but let's check what was in the seed script
// contact: 'Samir', telephone: '0661112233', email: 'samir@domaines.ma', city wasn't in seed.
// so contact and email were the same.

fs.writeFileSync('src/App.tsx', code);
console.log('Successfully patched edit modal defaults');
