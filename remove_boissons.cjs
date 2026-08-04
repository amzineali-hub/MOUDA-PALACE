const fs = require('fs');
const path = require('path');
const file = path.join('/app/applet/src/App.tsx');
let code = fs.readFileSync(file, 'utf8');

let target1 = `return Array.from(new Set([...defaultCats, ...dbCats, ...dbFournisseurCats]))
      .filter(c => c !== 'Épicerie & Sec' && c !== 'Épicerie & sec' && c !== 'Viandes & Volailles')
      .sort();`;
let replacement1 = `return Array.from(new Set([...defaultCats, ...dbCats, ...dbFournisseurCats]))
      .filter(c => c !== 'Épicerie & Sec' && c !== 'Épicerie & sec' && c !== 'Viandes & Volailles' && c !== 'Boissons & Vins')
      .sort();`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
  console.log('Replaced in categories filter');
} else {
  console.log('Target 1 not found');
}

// Remove the options from datalist
let target2 = `<option value="Boissons & Vins" />`;
if (code.includes(target2)) {
  code = code.split(target2).join('');
  console.log('Removed Boissons & Vins from datalist options in App.tsx');
}

fs.writeFileSync(file, code);
