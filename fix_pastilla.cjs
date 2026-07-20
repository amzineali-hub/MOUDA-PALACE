const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{ id: 4, category: 'Plats Principaux', name: 'Pastilla au Pigeon', price: '240 MAD', desc: 'Tourte sucrée-salée aux amandes, cannelle et fleur d\\'oranger.', active: false, translated: false }`;
const replacement = `{ id: 4, category: 'Plats Principaux', name: 'Pastilla au Pigeon', price: '240 MAD', desc: 'Tourte sucrée-salée aux amandes, cannelle et fleur d\\'oranger.', active: true, translated: false }`;

content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content);
