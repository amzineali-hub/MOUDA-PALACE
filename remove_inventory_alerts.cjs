const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /function InventoryAlerts\(\) \{[\s\S]*?\}\n\nconst NavCategory/g;
code = code.replace(regex, 'const NavCategory');

fs.writeFileSync('src/App.tsx', code);
