const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const blocks = content.split('Téléchargement de la fiche de ${partner.name}');
console.log(`Found ${blocks.length - 1} blocks.`);
for(let i=0; i<blocks.length-1; i++) {
  // get 100 chars before
  const before = blocks[i].substring(blocks[i].length - 150);
  console.log(`\n--- Block ${i+1} ---`);
  console.log(before);
}
