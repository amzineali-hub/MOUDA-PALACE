const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetSubnav = `<SubNavItem icon={<BookOpen size={16} />} label="Guide Logiciel" active={activeTab === 'docs'} onClick={() => handleTabChange('docs')} />
            <SubNavItem icon={<Monitor size={16} />} label="Guide Écrans" active={activeTab === 'docs_screens'} onClick={() => handleTabChange('docs_screens')} />`;

const replaceSubnav = `<SubNavItem icon={<BookOpen size={16} />} label="Guide Logiciel" active={activeTab === 'docs'} onClick={() => handleTabChange('docs')} />
            <SubNavItem icon={<Monitor size={16} />} label="Guide Écrans" active={activeTab === 'docs_screens'} onClick={() => handleTabChange('docs_screens')} />
            <SubNavItem icon={<BookOpen size={16} />} label="Procédé de base" active={activeTab === 'docs_procede'} onClick={() => handleTabChange('docs_procede')} />`;

code = code.replace(targetSubnav, replaceSubnav);

const targetRender = `      case 'docs':
        return <Documentation />;
      case 'docs_screens':`;

const replaceRender = `      case 'docs':
        return <Documentation />;
      case 'docs_procede':
        return <Documentation initialGuideId={11} />;
      case 'docs_screens':`;

code = code.replace(targetRender, replaceRender);

fs.writeFileSync('src/App.tsx', code);
