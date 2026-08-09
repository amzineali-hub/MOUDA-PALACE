const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCaisse = `          <button
            onClick={() => handleTabChange('finance')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 \${
              activeTab === 'finance'
                ? 'bg-[#F4C75B] text-[#265C6D] shadow-lg shadow-[#F4C75B]/20'
                : 'text-[#F4C75B] border border-[#F4C75B]/30 hover:border-[#F4C75B] hover:bg-[#F4C75B]/10'
            }\`}
          >
            <Wallet size={18} />
            <span>Caisse / POS Tactile</span>
          </button>`;

const oldGestionEcrans = `          <button
            onClick={() => handleTabChange('docs_devices')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 \${
              activeTab === 'docs_devices'
                ? 'bg-[#F4C75B] text-[#265C6D] shadow-lg shadow-[#F4C75B]/20'
                : 'text-[#F4C75B] border border-[#F4C75B]/30 hover:border-[#F4C75B] hover:bg-[#F4C75B]/10'
            }\`}
          >
            <Monitor size={18} />
            <span>Gestion Écrans Tactile & Cuisine</span>
          </button>`;

const kdsItem = `            <SubNavItem icon={<AlertCircle size={16} />} label="Écran Cuisine (KDS)" active={activeTab === 'kds'} onClick={() => handleTabChange('kds')} />\n`;

code = code.replace(oldCaisse, '');
code = code.replace(oldGestionEcrans, `
          <NavCategory 
            title="Écrans Tactiles & Cuisine" 
            icon={<Monitor size={18} />}
            isExpanded={expandedCategory === 'ecrans'}
            onClick={() => setExpandedCategory(expandedCategory === 'ecrans' ? null : 'ecrans')}
          >
            <SubNavItem icon={<Wallet size={16} />} label="Caisse / POS Tactile" active={activeTab === 'finance'} onClick={() => handleTabChange('finance')} />
            <SubNavItem icon={<Monitor size={16} />} label="Gestion des Appareils" active={activeTab === 'docs_devices'} onClick={() => handleTabChange('docs_devices')} />
            <SubNavItem icon={<ChefHat size={16} />} label="Écran Cuisine (KDS)" active={activeTab === 'kds'} onClick={() => handleTabChange('kds')} />
          </NavCategory>
`);
code = code.replace(kdsItem, '');

fs.writeFileSync('src/App.tsx', code);
