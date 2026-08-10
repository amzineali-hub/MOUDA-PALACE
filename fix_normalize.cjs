const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /if \(c === 'Produits d\\'entretien' \|\| c === 'Produits de maintenance' \|\| c === 'Hygiène & Entretien'\) return 'Hygiène & Entretien';\n  return c;\n};/,
  "if (c === 'Produits d\\'entretien' || c === 'Produits de maintenance' || c === 'Hygiène & Entretien') return 'Hygiène & Entretien';\n  if (c === 'Boulangerie' || c === 'Boulangerie & Pâtisserie' || c === 'Boulangerie & Patisseie' || c === 'Boulangerie et Pâtisserie' || c === 'Pâtisserie' || c === 'Patisserie') return 'Patisseie';\n  return c;\n};"
);
fs.writeFileSync('src/App.tsx', code);
console.log('Normalized category.');
