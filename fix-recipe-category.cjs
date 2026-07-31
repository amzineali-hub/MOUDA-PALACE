const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
const recipeSelectRegex = /<select\s+value=\{newRecipeForm\.category\}\s+onChange=\{\(e\) => setNewRecipeForm\(\{\.\.\.newRecipeForm, category: e\.target\.value\}\)\}\s+className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:border-\[#F4C75B\]"[\s\S]*?<\/select>/;
if (recipeSelectRegex.test(appContent)) {
  appContent = appContent.replace(recipeSelectRegex, 
    `<input
                    list="dl-recipe-cat-form"
                    value={newRecipeForm.category}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, category: e.target.value})}
                    placeholder="Ex: Entrées Froides"
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:border-[#F4C75B]"
                  />
                  <datalist id="dl-recipe-cat-form">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>`
  );
  fs.writeFileSync('src/App.tsx', appContent);
  console.log("Fixed App.tsx newRecipeForm category");
}
