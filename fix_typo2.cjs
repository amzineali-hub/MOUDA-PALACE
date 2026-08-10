const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/Patisseie/g, "Pâtisserie");
fs.writeFileSync('src/App.tsx', code);

let code2 = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');
code2 = code2.replace(/Patisseie/g, "Pâtisserie");
fs.writeFileSync('src/AchatsFournisseurs.tsx', code2);
console.log('Replaced Patisseie with Pâtisserie.');
