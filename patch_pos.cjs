const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

if (!appContent.includes("import POSTactile from './POSTactile';")) {
    appContent = appContent.replace(
        "import GestionTables from \"./GestionTables\";",
        "import GestionTables from \"./GestionTables\";\nimport POSTactile from \"./POSTactile\";"
    );
}

appContent = appContent.replace(
    "return <TacSystemsPOS />;",
    "return <POSTactile />;"
);

appContent = appContent.replace(
    '<SubNavItem icon={<Wallet size={16} />} label="Finances / Caisse" active={activeTab === \'finance\'} onClick={() => handleTabChange(\'finance\')} />',
    '<SubNavItem icon={<Wallet size={16} />} label="Caisse / POS Tactile" active={activeTab === \'finance\'} onClick={() => handleTabChange(\'finance\')} />'
);

appContent = appContent.replace(
    "text: 'Finances / Caisse', tab: 'finance'",
    "text: 'Caisse / POS Tactile', tab: 'finance'"
);

fs.writeFileSync('src/App.tsx', appContent);
console.log("Done");
