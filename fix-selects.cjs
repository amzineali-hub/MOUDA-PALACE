const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Nouveau Produit: Category
content = content.replace(
  /<select\s+name="category"\s+required\s+className="w-full border border-gray-200 rounded-lg p\.2\.5 bg-white focus:outline-none focus:border-\[#F4C75B\]"\s*>\s*<option value="">Sélectionner une catégorie<\/option>\s*\{categories\.map\(\(cat, idx\) => \(\s*<option key=\{idx\} value=\{cat\}>\{cat\}<\/option>\s*\)\)\}\s*<\/select>/gs,
  `<input name="category" list="categories-list" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Viandes" />
                  <datalist id="categories-list">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>`
);

// Entrée de Stock: Fournisseur
content = content.replace(
  /<input id="tx-supplier" type="text" className="w-full border border-gray-200 rounded-lg p\.2\.5 focus:outline-none focus:border-\[#F4C75B\]" placeholder="Ex: Marché Central" \/>/g,
  `<input id="tx-supplier" list="suppliers-list" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Marché Central" />
                    <datalist id="suppliers-list">
                      {suppliersList.map((sup, idx) => (
                        <option key={idx} value={sup} />
                      ))}
                    </datalist>`
);

// Paramètres Produit: Catégorie
content = content.replace(
  /<input id="edit-cat" type="text" defaultValue=\{selectedProduct\.category\} className="w-full border border-gray-200 rounded-lg p\.2\.5 focus:outline-none focus:border-\[#F4C75B\]" \/>/g,
  `<input id="edit-cat" list="categories-list" type="text" defaultValue={selectedProduct.category} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                  <datalist id="categories-list">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>`
);

// Paramètres Produit: Fournisseur
content = content.replace(
  /<input id="edit-sup" type="text" defaultValue=\{selectedProduct\.supplier\} className="w-full border border-gray-200 rounded-lg p\.2\.5 focus:outline-none focus:border-\[#F4C75B\]" \/>/g,
  `<input id="edit-sup" list="suppliers-list" type="text" defaultValue={selectedProduct.supplier} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                <datalist id="suppliers-list">
                  {suppliersList.map((sup, idx) => (
                    <option key={idx} value={sup} />
                  ))}
                </datalist>`
);


fs.writeFileSync('src/App.tsx', content);
console.log("Replaced selects");
