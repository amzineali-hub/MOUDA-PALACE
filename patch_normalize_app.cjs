const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  "if (c === 'Viandes') return 'Viandes';",
  "if (c === 'Viandes') return 'Viandes';\n  if (c === 'Produits d\\'entretien' || c === 'Produits de maintenance' || c === 'Hygiène & Entretien') return 'Hygiène & Entretien';"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched normalizeCategory in App.tsx");
