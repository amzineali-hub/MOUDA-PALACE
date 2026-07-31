const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix suppliersList and categories logic
content = content.replace(
  /const categories = useMemo\(\(\) => \{[\s\S]*?return Array\.from\(new Set\(\[\.\.\.defaultCats, \.\.\.dbCats\]\)\)\.sort\(\);\s*\}, \[stockItemsData\]\);/,
  `const categories = useMemo(() => {
    const defaultCats = ['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes', 'Poissons', 'Légumes', 'Boulangerie', 'Produits Laitiers', 'Boissons', 'Boissons Alcoolisées', 'Sauces', 'Conserves', 'Sirops', "Produits d'entretien", "Matériel", "Services", "Hygiène & Entretien"];
    const dbCats = stockItemsData.map(item => item.category?.trim()).filter(Boolean);
    const dbFournisseurCats = fournisseurs.map(f => (f.category || f.categorie)?.trim()).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats, ...dbFournisseurCats])).sort();
  }, [stockItemsData, fournisseurs]);`
);

content = content.replace(
  /const suppliersList = useMemo\(\(\) => \{[\s\S]*?return Array\.from\(new Set\(\[\.\.\.dbSuppliers, \.\.\.annuaireFournisseurs\]\)\)\.sort\(\);\s*\}, \[stockItemsData, fournisseurs\]\);/,
  `const suppliersList = useMemo(() => {
    const dbSuppliers = stockItemsData.map(item => item.supplier?.trim()).filter(Boolean).filter(s => s !== 'Non renseigné');
    const annuaireFournisseurs = fournisseurs.map(f => (f.name || f.nom)?.trim()).filter(Boolean);
    return Array.from(new Set([...dbSuppliers, ...annuaireFournisseurs])).sort();
  }, [stockItemsData, fournisseurs]);`
);

// We need to make datalist id and input list unique pairs.

let count = 0;
content = content.replace(/list="([^"]+)"/g, (match, listId) => {
  if (['categories-list', 'suppliers-list', 'fournisseur-categories-list'].includes(listId)) {
    count++;
    return `list="${listId}-${count}"`;
  }
  return match;
});

let count2 = 0;
content = content.replace(/id="([^"]+)"/g, (match, id) => {
  if (['categories-list', 'suppliers-list', 'fournisseur-categories-list'].includes(id)) {
    count2++;
    return `id="${id}-${count2}"`;
  }
  return match;
});

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced App.tsx IDs");

let achatsContent = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

let count3 = 0;
achatsContent = achatsContent.replace(/list="([^"]+)"/g, (match, listId) => {
  if (['cat-achat-list', 'cat-fournisseur-list'].includes(listId)) {
    count3++;
    return `list="${listId}-${count3}"`;
  }
  return match;
});

let count4 = 0;
achatsContent = achatsContent.replace(/id="([^"]+)"/g, (match, id) => {
  if (['cat-achat-list', 'cat-fournisseur-list'].includes(id)) {
    count4++;
    return `id="${id}-${count4}"`;
  }
  return match;
});

// Also add suppliersList and categories to AchatsFournisseurs.tsx
achatsContent = achatsContent.replace(
  /const \[loading, setLoading\] = useState\(true\);/,
  `const [loading, setLoading] = useState(true);
  
  const categories = useMemo(() => {
    const defaultCats = ['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes', 'Poissons', 'Légumes', 'Boulangerie', 'Produits Laitiers', 'Boissons', 'Boissons Alcoolisées', 'Sauces', 'Conserves', 'Sirops', "Produits d'entretien", "Matériel", "Services", "Hygiène & Entretien"];
    const dbCats = inventoryItems.map((item: any) => item.category?.trim()).filter(Boolean);
    const dbFournisseurCats = fournisseurs.map(f => (f.category || f.categorie)?.trim()).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats, ...dbFournisseurCats])).sort();
  }, [inventoryItems, fournisseurs]);

  const suppliersList = useMemo(() => {
    const dbSuppliers = inventoryItems.map((item: any) => item.supplier?.trim()).filter(Boolean).filter(s => s !== 'Non renseigné');
    const annuaireFournisseurs = fournisseurs.map(f => (f.name || f.nom)?.trim()).filter(Boolean);
    return Array.from(new Set([...dbSuppliers, ...annuaireFournisseurs])).sort();
  }, [inventoryItems, fournisseurs]);`
);

// And fix the hardcoded datalists in AchatsFournisseurs.tsx to map over categories
achatsContent = achatsContent.replace(
  /<datalist id="cat-achat-list-\d+">[\s\S]*?<\/datalist>/g,
  `<datalist id="cat-achat-list-1">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>`
);

achatsContent = achatsContent.replace(
  /<datalist id="cat-fournisseur-list-1">[\s\S]*?<\/datalist>/g,
  `<datalist id="cat-fournisseur-list-1">
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} />
                  ))}
                </datalist>`
);
achatsContent = achatsContent.replace(
  /<datalist id="cat-fournisseur-list-2">[\s\S]*?<\/datalist>/g,
  `<datalist id="cat-fournisseur-list-2">
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} />
                  ))}
                </datalist>`
);

// We should also replace the supplier datalist in AchatsFournisseurs.tsx?
// Wait, is there a supplier input in AchatsFournisseurs? Let's check.
// Modal Nouvelle Commande
achatsContent = achatsContent.replace(
  /<input name="fournisseur" (.*?) \/>/g,
  `<input name="fournisseur" list="fournisseur-list-1" $1 />
                <datalist id="fournisseur-list-1">
                  {suppliersList.map((sup, idx) => (
                    <option key={idx} value={sup} />
                  ))}
                </datalist>`
);

fs.writeFileSync('src/AchatsFournisseurs.tsx', achatsContent);
console.log("Replaced AchatsFournisseurs.tsx IDs");

// Now check Recettes.tsx
let recettesContent = fs.readFileSync('src/Recettes.tsx', 'utf-8');
recettesContent = recettesContent.replace(
  /<datalist id="recettes-categories-list">[\s\S]*?<\/datalist>/g,
  `<datalist id="recettes-categories-list">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>`
);

recettesContent = recettesContent.replace(
  /const \[loading, setLoading\] = useState\(true\);/,
  `const [loading, setLoading] = useState(true);
  
  const categories = useMemo(() => {
    const defaultCats = ["Amuse-bouche", "Entrées Froides", "Entrées Chaudes", "Soupes & Potages", "Salades", "Plats Végétariens", "Poissons & Fruits de mer", "Viandes", "Volailles", "Pâtes & Risottos", "Accompagnements", "Fromages", "Desserts", "Pâtisseries", "Glaces & Sorbets", "Sauces & Condiments"];
    const dbCats = recettes.map((item: any) => item.categorie?.trim()).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats])).sort();
  }, [recettes]);`
);
fs.writeFileSync('src/Recettes.tsx', recettesContent);
console.log("Replaced Recettes.tsx IDs");

