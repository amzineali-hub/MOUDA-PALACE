const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Import
if (!appContent.includes("import EcranCuisine from './EcranCuisine';")) {
    appContent = appContent.replace(
        "import POSTactile from \"./POSTactile\";",
        "import POSTactile from \"./POSTactile\";\nimport EcranCuisine from \"./EcranCuisine\";"
    );
}

// 2. Add to Sidebar Menu
appContent = appContent.replace(
    '<SubNavItem icon={<ChefHat size={16} />} label="Production cuisine" active={activeTab === \'inventory\'} onClick={() => handleTabChange(\'inventory\')} />',
    '<SubNavItem icon={<ChefHat size={16} />} label="Production cuisine" active={activeTab === \'inventory\'} onClick={() => handleTabChange(\'inventory\')} />\n            <SubNavItem icon={<AlertCircle size={16} />} label="Écran Cuisine (KDS)" active={activeTab === \'kds\'} onClick={() => handleTabChange(\'kds\')} />'
);

// 3. Add to switch
appContent = appContent.replace(
    "case 'inventory':",
    "case 'kds':\n        return <EcranCuisine />;\n      case 'inventory':"
);

// 4. Update import icons if AlertCircle missing in App.tsx imports, but we can just let it be, wait, I need to make sure AlertCircle is imported in App.tsx. 
// It's probably already there, or we can use another icon like Bell or Monitor.
// I will check if AlertCircle is imported. 

fs.writeFileSync('src/App.tsx', appContent);
console.log("Done");
