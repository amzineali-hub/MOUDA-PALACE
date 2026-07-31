const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /const suppliersList = useMemo\(\(\) => \{\s*const dbSuppliers = stockItemsData\.map\(item => item\.supplier\?\.trim\(\)\)\.filter\(Boolean\)\.filter\(s => s !== 'Non renseigné'\);\s*return Array\.from\(new Set\(\[\.\.\.dbSuppliers\]\)\)\.sort\(\);\s*\}, \[stockItemsData\]\);/g,
  `const suppliersList = useMemo(() => {
    const dbSuppliers = stockItemsData.map(item => item.supplier?.trim()).filter(Boolean).filter(s => s !== 'Non renseigné');
    const annuaireFournisseurs = fournisseurs.map(f => f.name?.trim()).filter(Boolean);
    return Array.from(new Set([...dbSuppliers, ...annuaireFournisseurs])).sort();
  }, [stockItemsData, fournisseurs]);`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed suppliersList");
