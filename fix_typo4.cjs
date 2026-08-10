const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /'Patisserie': 'https:\/\/images\.unsplash/g,
  "'Patisseie': 'https://images.unsplash"
);
code = code.replace(
  /mer', 'Patisserie', 'Produits Laitiers'/g,
  "mer', 'Patisseie', 'Produits Laitiers'"
);
code = code.replace(
  /<option value="Patisserie" \/>/g,
  "<option value=\"Patisseie\" />"
);
fs.writeFileSync('src/App.tsx', code);

let code2 = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');
code2 = code2.replace(
  /Légumes', 'Patisserie', 'Produits Laitiers'/g,
  "Légumes', 'Patisseie', 'Produits Laitiers'"
);
code2 = code2.replace(
  /<option value="Patisserie" \/>/g,
  "<option value=\"Patisseie\" />"
);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code2);
console.log('Done.');
