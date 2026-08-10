const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /if \(c === 'Viandes' \|\| c === 'Viande'\) return 'Viandes';/g,
  `if (c === 'Viandes' || c === 'Viande') return 'Viandes';
  if (c === 'Boulangerie' || c === 'Boulangerie & Pâtisserie' || c === 'Boulangerie et Pâtisserie') return 'Pâtisserie';`
);
fs.writeFileSync('src/App.tsx', code);
