const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import
const importTarget = `import ChambreNegative from "./ChambreNegative";`;
const importReplacement = `import ChambreNegative from "./ChambreNegative";\nimport TableauDeBord from "./TableauDeBord";`;
content = content.replace(importTarget, importReplacement);

// Add to switch case
const switchTarget = `case 'chambre_negative':
        return <ChambreNegative />;`;
const switchReplacement = `case 'chambre_negative':
        return <ChambreNegative />;
      case 'dashboard':
        return <TableauDeBord />;`;
content = content.replace(switchTarget, switchReplacement);

// Add to menu
const menuTarget = `<div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">`;
const menuReplacement = `<div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-1">
            <SubNavItem icon={<LayoutDashboard size={16} />} label="Tableau de Bord" active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} />`;
content = content.replace(menuTarget, menuReplacement);

const activeTarget = `const [activeTab, setActiveTab] = useState('inventory');`;
const activeReplacement = `const [activeTab, setActiveTab] = useState('dashboard');`;
content = content.replace(activeTarget, activeReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx with TableauDeBord");
