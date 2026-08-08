const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

code = code.replace(/setOrderSelections\(\{\}\); setIsNewOrderModalOpen\(true\);/g, "setOrderSelections({}); setOrderTvaRate(20); setIsNewOrderModalOpen(true);");

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
