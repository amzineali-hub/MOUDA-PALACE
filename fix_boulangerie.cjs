const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/Boulangerie & Pâtisserie/g, "Patisserie");
  content = content.replace(/Boulangerie et Pâtisserie/g, "Patisserie");
  content = content.replace(/'Boulangerie'/g, "'Patisserie'");
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/App.tsx');
replaceInFile('src/AchatsFournisseurs.tsx');
console.log('Replaced');
