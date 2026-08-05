const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `<button
            onClick={() => handleTabChange('overview')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 \${
              activeTab === 'overview'
                ? 'bg-[#F4C75B] text-[#265C6D] shadow-lg shadow-[#F4C75B]/20'
                : 'text-[#F4C75B] border border-[#F4C75B]/30 hover:border-[#F4C75B] hover:bg-[#F4C75B]/10'
            }\`}
          >
            <TrendingUp size={18} />
            <span>Vue d'ensemble</span>
          </button>`;

const replaceStr = targetStr + `

          <button
            onClick={() => handleTabChange('dashboard')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 \${
              activeTab === 'dashboard'
                ? 'bg-[#F4C75B] text-[#265C6D] shadow-lg shadow-[#F4C75B]/20'
                : 'text-[#F4C75B] border border-[#F4C75B]/30 hover:border-[#F4C75B] hover:bg-[#F4C75B]/10'
            }\`}
          >
            <LayoutDashboard size={18} />
            <span>Tableau de Bord Exécutif</span>
          </button>`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/App.tsx', content);
