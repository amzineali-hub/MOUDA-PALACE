const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');
code = code.replace(/collection\(db, 'transactions'\)/g, `collection(db, 'expenses')`);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
