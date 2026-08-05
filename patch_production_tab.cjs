const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import
const importTarget = `import FichesTechniques from "./FichesTechniques";`;
const importReplacement = `import FichesTechniques from "./FichesTechniques";\nimport ProductionJournaliere from "./ProductionJournaliere";`;
content = content.replace(importTarget, importReplacement);

// Add to switch case
const switchTarget = `case 'recettes':
        return <FichesTechniques />;`;
const switchReplacement = `case 'recettes':
        return <FichesTechniques />;
      case 'production_jour':
        return <ProductionJournaliere />;`;
content = content.replace(switchTarget, switchReplacement);

// Add to menu
const menuTarget = `<SubNavItem icon={<UtensilsCrossed size={16} />} label="Fiches Techniques" active={activeTab === 'recettes'} onClick={() => handleTabChange('recettes')} />`;
const menuReplacement = `<SubNavItem icon={<UtensilsCrossed size={16} />} label="Fiches Techniques" active={activeTab === 'recettes'} onClick={() => handleTabChange('recettes')} />
            <SubNavItem icon={<Activity size={16} />} label="Ordres de Fabrication" active={activeTab === 'production_jour'} onClick={() => handleTabChange('production_jour')} />`;
content = content.replace(menuTarget, menuReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx with ProductionJournaliere");
