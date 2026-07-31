const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
let achatsContent = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

// App.tsx
appContent = appContent.replace(
  /const categories = useMemo\(\(\) => \{[\s\S]*?return Array\.from\(new Set\(\[\.\.\.defaultCats, \.\.\.dbCats\]\)\)\.sort\(\);\s*\}, \[stockItemsData\]\);/,
  `const categories = useMemo(() => {
    const defaultCats = ['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes', 'Poissons', 'Légumes', 'Boulangerie', 'Produits Laitiers', 'Boissons', 'Boissons Alcoolisées', 'Sauces', 'Conserves', 'Sirops', "Produits d'entretien", "Matériel", "Services", "Hygiène & Entretien"];
    const dbCats = stockItemsData.map(item => item.category?.trim()).filter(Boolean);
    const dbFournisseurCats = fournisseurs.map(f => (f.category || f.categorie)?.trim()).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats, ...dbFournisseurCats])).sort();
  }, [stockItemsData, fournisseurs]);`
);

appContent = appContent.replace(
  /const suppliersList = useMemo\(\(\) => \{[\s\S]*?return Array\.from\(new Set\(\[\.\.\.dbSuppliers, \.\.\.annuaireFournisseurs\]\)\)\.sort\(\);\s*\}, \[stockItemsData, fournisseurs\]\);/,
  `const suppliersList = useMemo(() => {
    const dbSuppliers = stockItemsData.map(item => item.supplier?.trim()).filter(Boolean).filter(s => s !== 'Non renseigné');
    const annuaireFournisseurs = fournisseurs.map(f => (f.name || f.nom)?.trim()).filter(Boolean);
    return Array.from(new Set([...dbSuppliers, ...annuaireFournisseurs])).sort();
  }, [stockItemsData, fournisseurs]);`
);

// Fix duplicated IDs in App.tsx
appContent = appContent.replace(/id="categories-list"/g, () => 'id="cat-list-' + Math.random().toString(36).substr(2, 9) + '"');
appContent = appContent.replace(/list="categories-list"/g, function(match, offset, string) {
  // We need to match the list attribute with the id. Actually it's easier to use a counter.
  return match; // We'll fix manually below
});

fs.writeFileSync('src/App.tsx', appContent);
