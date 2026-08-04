const fs = require('fs');
const path = require('path');
const file = path.join('/app/applet/src/AchatsFournisseurs.tsx');
let code = fs.readFileSync(file, 'utf8');

let target2 = `<option value="Boissons & Vins" />`;
if (code.includes(target2)) {
  code = code.split(target2).join('');
  console.log('Removed Boissons & Vins from datalist options in AchatsFournisseurs.tsx');
}

fs.writeFileSync(file, code);
