const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /if \(c === 'Boulangerie' \|\| c === 'Boulangerie & Patisserie' \|\| c === 'Boulangerie & Patisserie' \|\| c === 'Boulangerie et Patisserie' \|\| c === 'Patisserie' \|\| c === 'Patisserie'\) return 'Patisserie';/,
  "if (c === 'Boulangerie' || c === 'Boulangerie & Pâtisserie' || c === 'Boulangerie & Patisserie' || c === 'Boulangerie et Pâtisserie' || c === 'Boulangerie et Patisserie' || c === 'Pâtisserie' || c === 'Patisserie') return 'Patisseie';"
);
fs.writeFileSync('src/App.tsx', code);
console.log('Normalized category 2.');
