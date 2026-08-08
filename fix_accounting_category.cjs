const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

code = code.replace(/category: c\.categorie \|\| 'Achat Marchandises'/g, "category: c.categorie || c.category || 'Achat Marchandises'");

fs.writeFileSync('src/Accounting.tsx', code);
