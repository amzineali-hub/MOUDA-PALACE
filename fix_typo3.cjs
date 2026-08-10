const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/Pâtisserie/g, "Patisserie");
fs.writeFileSync('src/App.tsx', code);

let code2 = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');
code2 = code2.replace(/Pâtisserie/g, "Patisserie");
fs.writeFileSync('src/AchatsFournisseurs.tsx', code2);
console.log('Replaced Pâtisserie with Patisserie.');
