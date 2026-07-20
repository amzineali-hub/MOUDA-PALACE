const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetBtn = `        <button 
          onClick={handleTranslate}
          disabled={isTranslating}
          className={\`whitespace-nowrap px-5 py-2.5 bg-white text-[#1A1A1A] rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2 \${isTranslating ? 'opacity-70 cursor-not-allowed' : ''}\`}
        >
          {isTranslating ? <Loader2 size={16} className="text-[#DDA956] animate-spin" /> : <Sparkles size={16} className="text-[#DDA956]" />}
          {isTranslating ? 'Traduction en cours...' : 'Traduire les plats non traduits'}
        </button>`;

const replaceBtn = `        <button 
          onClick={handleTranslate}
          disabled={isTranslating || menuItems.filter(i => !i.translated).length === 0}
          className={\`whitespace-nowrap px-5 py-2.5 bg-white text-[#1A1A1A] rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2 \${(isTranslating || menuItems.filter(i => !i.translated).length === 0) ? 'opacity-70 cursor-not-allowed' : ''}\`}
        >
          {isTranslating ? <Loader2 size={16} className="text-[#DDA956] animate-spin" /> : <Sparkles size={16} className={menuItems.filter(i => !i.translated).length === 0 ? "text-gray-400" : "text-[#DDA956]"} />}
          {isTranslating ? 'Traduction en cours...' : menuItems.filter(i => !i.translated).length === 0 ? 'Tous les plats sont traduits' : \`Traduire \${menuItems.filter(i => !i.translated).length} plat(s) non traduit(s)\`}
        </button>`;

content = content.replace(targetBtn, replaceBtn);

fs.writeFileSync('src/App.tsx', content);
