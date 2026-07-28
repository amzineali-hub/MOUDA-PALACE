const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');
code = code.replace(
    '{selectedCommande.orderNumber || selectedCommande.id.slice(0,8).toUpperCase()}',
    '{selectedCommande.orderNumber || (selectedCommande.id.startsWith("CMD-") ? selectedCommande.id : "CMD-" + selectedCommande.id.slice(0,4).toUpperCase())}'
);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
console.log("Fixed detail modal ID");
