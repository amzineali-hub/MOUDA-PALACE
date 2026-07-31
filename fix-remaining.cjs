const fs = require('fs');

// Fix Recettes.tsx select
let recettesContent = fs.readFileSync('src/Recettes.tsx', 'utf-8');
const recettesSelectRegex = /<select\s+value=\{categorie\}\s+onChange=\{e => setCategorie\(e\.target\.value\)\}\s+required\s+className="w-full border border-gray-200 rounded-lg p-2\.5 bg-white outline-none focus:border-\[#F4C75B\]"[\s\S]*?<\/select>/;

if (recettesSelectRegex.test(recettesContent)) {
  recettesContent = recettesContent.replace(recettesSelectRegex, 
    `<input
                    list="dl-recettes-cat"
                    value={categorie}
                    onChange={e => setCategorie(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#F4C75B]"
                    placeholder="Ex: Entrées Froides"
                  />
                  <datalist id="dl-recettes-cat">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>`
  );
  fs.writeFileSync('src/Recettes.tsx', recettesContent);
  console.log("Fixed Recettes.tsx select");
}

// Fix MenuGenerator.tsx select
let menuContent = fs.readFileSync('src/MenuGenerator.tsx', 'utf-8');
const menuSelectRegex = /<select\s+value=\{category\}\s+onChange=\{\(e\) => setCategory\(e\.target\.value\)\}\s+className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-\[#F4C75B\] bg-white"[\s\S]*?<\/select>/;

if (menuSelectRegex.test(menuContent)) {
  menuContent = menuContent.replace(menuSelectRegex, 
    `<input
                    list="dl-menu-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B]"
                    placeholder="Ex: Entrées"
                  />
                  <datalist id="dl-menu-cat">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>`
  );
  fs.writeFileSync('src/MenuGenerator.tsx', menuContent);
  console.log("Fixed MenuGenerator.tsx select");
} else {
  // Maybe it was already replaced but didn't match the IDs fix. Let's fix the id.
  menuContent = menuContent.replace(/list="menu-categories-list"/g, 'list="dl-menu-cat"');
  menuContent = menuContent.replace(/id="menu-categories-list"/g, 'id="dl-menu-cat"');
  fs.writeFileSync('src/MenuGenerator.tsx', menuContent);
  console.log("Fixed MenuGenerator.tsx datalist ID");
}

