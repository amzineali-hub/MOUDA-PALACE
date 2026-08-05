const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import
const importTarget = `import TracabiliteHACCP from "./TracabiliteHACCP";`;
const importReplacement = `import TracabiliteHACCP from "./TracabiliteHACCP";\nimport ChambreNegative from "./ChambreNegative";`;
content = content.replace(importTarget, importReplacement);

// Add to switch case
const switchTarget = `case 'haccp':
        return <TracabiliteHACCP />;`;
const switchReplacement = `case 'haccp':
        return <TracabiliteHACCP />;
      case 'chambre_negative':
        return <ChambreNegative />;`;
content = content.replace(switchTarget, switchReplacement);

// Add to menu
const menuTarget = `<SubNavItem icon={<Package size={16} />} label="HACCP & Sous-Vide" active={activeTab === 'haccp'} onClick={() => handleTabChange('haccp')} />`;
const menuReplacement = `<SubNavItem icon={<Package size={16} />} label="HACCP & Sous-Vide" active={activeTab === 'haccp'} onClick={() => handleTabChange('haccp')} />
            <SubNavItem icon={<ThermometerSnowflake size={16} />} label="Chambre Négative" active={activeTab === 'chambre_negative'} onClick={() => handleTabChange('chambre_negative')} />`;
content = content.replace(menuTarget, menuReplacement);

const iconTarget = `import { ChefHat,`;
const iconReplacement = `import { ThermometerSnowflake, ChefHat,`;
content = content.replace(iconTarget, iconReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx with ChambreNegative");
