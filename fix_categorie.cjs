const fs = require('fs');
let code = fs.readFileSync('src/Recettes.tsx', 'utf8');

const regex = /(<label className="block text-sm font-medium text-gray-700 mb-1">Catégorie<\/label>\s*)<input\s*value=\{categorie\} onChange=\{e => setCategorie\(e\.target\.value\)\}\s*required\s*list="recipe-categories-list"\s*className="w-full border border-gray-200 rounded-lg p-2\.5 bg-white outline-none focus:border-\[\#DDA956\]"\s*placeholder="Sélectionner ou saisir\.\.\."\s*\/>/g;

const replacement = `$1<select
                    value={categorie}
                    onChange={e => setCategorie(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Plats">Plats</option>
                    <option value="Entrées">Entrées</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Boissons">Boissons</option>
                  </select>`;

if (!regex.test(code)) {
    console.error("Not found, falling back to manual replacement");
    // Fallback using another regex
    const fallbackRegex = /<label className="block text-sm font-medium text-gray-700 mb-1">Catégorie<\/label>[\s\S]*?<\/div>/;
    
} else {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/Recettes.tsx', code);
    console.log("Done");
}
