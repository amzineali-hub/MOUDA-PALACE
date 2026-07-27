const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import GuideEcrans from './GuideEcrans';")) {
  code = code.replace(
    'import Documentation from "./Documentation";',
    'import Documentation from "./Documentation";\nimport GuideEcrans from "./GuideEcrans";'
  );
}

if (!code.includes("<SubNavItem icon={<Monitor size={16} />} label=\"Guide Écrans\"")) {
  code = code.replace(
    '<SubNavItem icon={<BookOpen size={16} />} label="Guide Logiciel" active={activeTab === \'docs\'} onClick={() => handleTabChange(\'docs\')} />',
    '<SubNavItem icon={<BookOpen size={16} />} label="Guide Logiciel" active={activeTab === \'docs\'} onClick={() => handleTabChange(\'docs\')} />\n            <SubNavItem icon={<Monitor size={16} />} label="Guide Écrans" active={activeTab === \'docs_screens\'} onClick={() => handleTabChange(\'docs_screens\')} />'
  );
}

if (!code.includes("case 'docs_screens':")) {
  code = code.replace(
    'case \'docs\':\n        return <Documentation />;',
    'case \'docs\':\n        return <Documentation />;\n      case \'docs_screens\':\n        return <GuideEcrans />;'
  );
}

fs.writeFileSync('src/App.tsx', code);
