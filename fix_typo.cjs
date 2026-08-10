const fs = require('fs');
let code1 = fs.readFileSync('src/App.tsx', 'utf8');
code1 = code1.replace(/Pâtisserie/g, "Patisseie");
fs.writeFileSync('src/App.tsx', code1);

let code2 = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');
code2 = code2.replace(/Pâtisserie/g, "Patisseie");
fs.writeFileSync('src/AchatsFournisseurs.tsx', code2);
console.log('Replaced Pâtisserie with Patisseie.');
