const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const targetClass = 'className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 transform ${';
const replacementBlock = `                  className={\`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 \${
                    activeCategory === cat.id && !searchQuery
                      ? 'bg-[#1A1A1A] text-[#DDA956] shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] translate-y-[4px]' 
                      : 'bg-white text-gray-500 hover:text-gray-900 shadow-[0_6px_0_#d1d5db,0_10px_15px_rgba(0,0,0,0.1)] border border-gray-100 -translate-y-[2px] active:translate-y-[4px] active:shadow-[0_0px_0_#d1d5db]'
                  }\`}`;

code = code.replace(/className=\{`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all duration-300 transform \$\{[\s\S]*?\}\`\}/g, replacementBlock);

fs.writeFileSync('src/POSTactile.tsx', code);
console.log("Updated category tabs to have 3D effect");
