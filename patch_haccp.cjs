const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import
const importTarget = `import ProductionJournaliere from "./ProductionJournaliere";`;
const importReplacement = `import ProductionJournaliere from "./ProductionJournaliere";\nimport TracabiliteHACCP from "./TracabiliteHACCP";`;
content = content.replace(importTarget, importReplacement);

// Add to switch case
const switchTarget = `case 'production_jour':
        return <ProductionJournaliere />;`;
const switchReplacement = `case 'production_jour':
        return <ProductionJournaliere />;
      case 'haccp':
        return <TracabiliteHACCP />;`;
content = content.replace(switchTarget, switchReplacement);

// Add to menu
const menuTarget = `<SubNavItem icon={<Activity size={16} />} label="Ordres de Fabrication" active={activeTab === 'production_jour'} onClick={() => handleTabChange('production_jour')} />`;
const menuReplacement = `<SubNavItem icon={<Activity size={16} />} label="Ordres de Fabrication" active={activeTab === 'production_jour'} onClick={() => handleTabChange('production_jour')} />
            <SubNavItem icon={<Package size={16} />} label="HACCP & Sous-Vide" active={activeTab === 'haccp'} onClick={() => handleTabChange('haccp')} />`;
content = content.replace(menuTarget, menuReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx with HACCP");
