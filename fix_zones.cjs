const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `      case 'inventory':
        return <Inventory />;`;
const replaceStr = targetStr + `
      case 'zones':
        return <ZonesStockage />;`;

content = content.replace(targetStr, replaceStr);

const sidebarTarget = `<SubNavItem icon={<ShoppingCart size={16} />} label="Achats fournisseurs" active={activeTab === 'achats'} onClick={() => handleTabChange('achats')} />`;
const sidebarReplace = sidebarTarget + `
            <SubNavItem icon={<Package size={16} />} label="Zones & Économat" active={activeTab === 'zones'} onClick={() => handleTabChange('zones')} />`;

content = content.replace(sidebarTarget, sidebarReplace);

fs.writeFileSync('src/App.tsx', content);
