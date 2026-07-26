const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove it from NavCategory "Gestion comptabilité"
appContent = appContent.replace(
    '<SubNavItem icon={<Wallet size={16} />} label="Caisse / POS Tactile" active={activeTab === \'finance\'} onClick={() => handleTabChange(\'finance\')} />\n',
    ''
);

// 2. Add it right after Vue d'ensemble
const posButton = `          <button
            onClick={() => handleTabChange('finance')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 \${
              activeTab === 'finance'
                ? 'bg-[#DDA956] text-[#1A1A1A] shadow-lg shadow-[#DDA956]/20'
                : 'text-[#DDA956] border border-[#DDA956]/30 hover:border-[#DDA956] hover:bg-[#DDA956]/10'
            }\`}
          >
            <Wallet size={18} />
            <span>Caisse / POS Tactile</span>
          </button>
`;

appContent = appContent.replace(
    '            <span>Vue d\'ensemble</span>\n          </button>\n',
    '            <span>Vue d\'ensemble</span>\n          </button>\n\n' + posButton
);

fs.writeFileSync('src/App.tsx', appContent);
console.log("Done");
