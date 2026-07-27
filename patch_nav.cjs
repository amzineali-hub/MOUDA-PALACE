const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `          <button
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

          <button
            onClick={() => handleTabChange('menu')}`;

const replacement1 = `          <button
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

          <button
            onClick={() => handleTabChange('docs_devices')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 \${
              activeTab === 'docs_devices'
                ? 'bg-[#DDA956] text-[#1A1A1A] shadow-lg shadow-[#DDA956]/20'
                : 'text-[#DDA956] border border-[#DDA956]/30 hover:border-[#DDA956] hover:bg-[#DDA956]/10'
            }\`}
          >
            <Monitor size={18} />
            <span>Gestion Écrans Tactile & Cuisine</span>
          </button>

          <button
            onClick={() => handleTabChange('menu')}`;

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
    console.log("Patched part 1");
} else {
    console.log("Could not find part 1");
}

const target2 = `<NavCategory 
            title="Documentation" 
            icon={<BookOpen size={18} />} 
            isExpanded={expandedCategory === 'docs_cat'} 
            onClick={() => setExpandedCategory(expandedCategory === 'docs_cat' ? null : 'docs_cat')}
          >
            <SubNavItem icon={<BookOpen size={16} />} label="Guide Logiciel" active={activeTab === 'docs'} onClick={() => handleTabChange('docs')} />
            <SubNavItem icon={<Monitor size={16} />} label="Gestion Écrans Tactile & Cuisine" active={activeTab === 'docs_devices'} onClick={() => handleTabChange('docs_devices')} />
          </NavCategory>`;

const replacement2 = `<NavCategory 
            title="Documentation" 
            icon={<BookOpen size={18} />} 
            isExpanded={expandedCategory === 'docs_cat'} 
            onClick={() => setExpandedCategory(expandedCategory === 'docs_cat' ? null : 'docs_cat')}
          >
            <SubNavItem icon={<BookOpen size={16} />} label="Guide Logiciel" active={activeTab === 'docs'} onClick={() => handleTabChange('docs')} />
          </NavCategory>`;

if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
    console.log("Patched part 2");
} else {
    console.log("Could not find part 2");
}

fs.writeFileSync('src/App.tsx', code);
