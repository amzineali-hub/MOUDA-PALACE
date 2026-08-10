const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

code = code.replace(
  /if \(c === "Boulangerie & Pâtisserie" \|\| c === "Boulangerie et Pâtisserie" \|\| c === "Boulangerie"\) return "Pâtisserie";/g,
  `if (c === "Boulangerie & Pâtisserie" || c === "Boulangerie et Pâtisserie") return "Pâtisserie";`
);

code = code.replace(
  /'Légumes', 'Pâtisserie', 'Produits Laitiers'/g,
  `'Légumes', 'Boulangerie', 'Pâtisserie', 'Produits Laitiers'`
);

code = code.replace(
  /<option value="Pâtisserie" \/>/g,
  `<option value="Boulangerie" />\n                  <option value="Pâtisserie" />`
);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
