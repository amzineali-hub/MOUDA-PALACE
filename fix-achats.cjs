const fs = require('fs');

let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

// Replace categorie in Modal Nouvelle/Modifier Commande
content = content.replace(
  /<select name="categorie" (required(?: defaultValue=\{.*?\})?|defaultValue=\{.*?\} required) className="w-full border border-gray-200 rounded-lg p-2\.5 focus:outline-none focus:border-\[#F4C75B\] bg-white">\s*<option value="">.*?<\/option>\s*<option value="Alimentaire">.*?<\/select>/gs,
  (match, p1) => {
    const val = p1.includes('defaultValue') ? p1.match(/defaultValue=\{.*?\}/)[0] : '';
    return `<input name="categorie" list="cat-achat-list" ${val} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Alimentaire" />
                  <datalist id="cat-achat-list">
                    <option value="Alimentaire" />
                    <option value="Boissons" />
                    <option value="Matériel" />
                    <option value="Consommables" />
                    <option value="Services" />
                    <option value="Équipement" />
                  </datalist>`;
  }
);

// Replace categorie in Modal Nouveau/Modifier Fournisseur
content = content.replace(
  /<select name="categorie" (required(?: defaultValue=\{.*?\})?|defaultValue=\{.*?\} required) className="w-full border border-gray-200 rounded-lg p-2\.5 focus:outline-none focus:border-\[#F4C75B\] bg-white max-h-48 overflow-y-auto">\s*<option value="">.*?<\/option>\s*<option value="Fruits & Légumes">.*?<\/select>/gs,
  (match, p1) => {
    const val = p1.includes('defaultValue') ? p1.match(/defaultValue=\{.*?\}/)[0] : '';
    return `<input name="categorie" list="cat-fournisseur-list" ${val} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Fruits & Légumes" />
                <datalist id="cat-fournisseur-list">
                  <option value="Fruits & Légumes" />
                  <option value="Viandes & Volailles" />
                  <option value="Poissons & Fruits de mer" />
                  <option value="Boulangerie & Pâtisserie" />
                  <option value="Produits Laitiers & Œufs" />
                  <option value="Épicerie Sèche" />
                  <option value="Boissons & Vins" />
                  <option value="Emballages & Consommables" />
                  <option value="Hygiène & Entretien" />
                  <option value="Équipement & Matériel" />
                  <option value="Services" />
                </datalist>`;
  }
);

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log("Done AchatsFournisseurs");
