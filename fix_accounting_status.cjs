const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

code = code.replace(/c\.status === 'Reçue' \|\| c\.status === 'Validée'/g, "c.status === 'Livrée' || c.status === 'Validée'");

fs.writeFileSync('src/Accounting.tsx', code);
