const fs = require('fs');
let content = fs.readFileSync('src/MenuGenerator.tsx', 'utf-8');
content = content.replace(
  /<select\s+value=\{category\}\s+onChange=\{\(e\) => setCategory\(e\.target\.value\)\}\s+className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-\[#F4C75B\] bg-white"\s*>\s*\{categories\.map\(c => <option key=\{c\} value=\{c\}>\{c\}<\/option>\)\}\s*<\/select>/gs,
  `<input 
                    list="menu-categories-list"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] bg-white"
                    placeholder="Ex: Entrées"
                  />
                  <datalist id="menu-categories-list">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>`
);
fs.writeFileSync('src/MenuGenerator.tsx', content);
console.log("Done MenuGenerator");
