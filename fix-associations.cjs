const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let counter = 1;
  // Match an input with a list attribute, followed possibly by spaces/newlines, then a datalist with an id
  content = content.replace(/(<input[^>]*?list=")[^"]+("[^>]*?>\s*<datalist[^>]*?id=")[^"]+(")/g, (match, p1, p2, p3) => {
    const newId = `dl-${Math.random().toString(36).substr(2, 6)}-${counter++}`;
    return `${p1}${newId}${p2}${newId}${p3}`;
  });
  
  // Also some inputs might have list and datalist in a different order or not exactly adjacent?
  // Let's check if there are any unmatched lists.
  fs.writeFileSync(filePath, content);
}

fixFile('src/App.tsx');
fixFile('src/AchatsFournisseurs.tsx');
fixFile('src/Recettes.tsx');
fixFile('src/Accounting.tsx');
fixFile('src/MenuGenerator.tsx');

console.log("Fixed associations");
