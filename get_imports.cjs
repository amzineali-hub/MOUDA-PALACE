const fs = require('fs');
console.log(fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8').split('\n').slice(0, 15).join('\n'));
