const fs = require('fs');
let content = fs.readFileSync('src/Recettes.tsx', 'utf8');

// Also remove " MAD" from cout and prix in default states
content = content.replace(
  "defaultValue={selectedRecette.cout}",
  "defaultValue={typeof selectedRecette.cout === 'string' ? selectedRecette.cout.replace(/[^0-9.]/g, '') : selectedRecette.cout}"
);
content = content.replace(
  "defaultValue={selectedRecette.prix}",
  "defaultValue={typeof selectedRecette.prix === 'string' ? selectedRecette.prix.replace(/[^0-9.]/g, '') : selectedRecette.prix}"
);

fs.writeFileSync('src/Recettes.tsx', content);
