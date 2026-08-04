const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(
    'const dbCats = inventoryItems.map((item: any) => item.category?.trim()).filter(Boolean);',
    'const dbCats = inventoryItems.map((item: any) => { let c = item.category?.trim(); if (c === "Produits d\\\'entretien" || c === "Produits de maintenance") return "Hygiène & Entretien"; return c; }).filter(Boolean);'
  );
  content = content.replace(
    'const dbFournisseurCats = fournisseurs.map(f => (f.category || f.categorie)?.trim()).filter(Boolean);',
    'const dbFournisseurCats = fournisseurs.map(f => { let c = (f.category || f.categorie)?.trim(); if (c === "Produits d\\\'entretien" || c === "Produits de maintenance") return "Hygiène & Entretien"; return c; }).filter(Boolean);'
  );
  fs.writeFileSync(file, content);
}

patchFile('src/AchatsFournisseurs.tsx');
console.log("Patched AchatsFournisseurs.tsx");
