const fs = require('fs');
let content = fs.readFileSync('src/Recettes.tsx', 'utf8');

content = content.replace(
  "{recette.cout}",
  "{typeof recette.cout === 'number' ? recette.cout + ' MAD' : recette.cout}"
);

fs.writeFileSync('src/Recettes.tsx', content);
