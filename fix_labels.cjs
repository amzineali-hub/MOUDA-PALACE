const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `<SubNavItem icon={<ChefHat size={16} />} label="Production cuisine" active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} />`;
const replaceStr = `<SubNavItem icon={<Package size={16} />} label="État des Stocks" active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} />`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx labels");
