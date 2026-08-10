const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const regex1 = /const dbCats = inventoryItems\.map\(\(item: any\) => \{ let c = item\.category\?\.trim\(\); if \(c === "Produits d\\'entretien" \|\| c === "Produits de maintenance"\) return "Hygiène & Entretien"; return c; \}\)\.filter\(Boolean\);/;
const replacement1 = `const dbCats = inventoryItems.map((item: any) => { 
      let c = item.category?.trim(); 
      if (c === "Produits d'entretien" || c === "Produits de maintenance") return "Hygiène & Entretien"; 
      if (c === "Boulangerie & Pâtisserie" || c === "Boulangerie et Pâtisserie" || c === "Boulangerie") return "Pâtisserie";
      return c; 
    }).filter(Boolean);`;

const regex2 = /const dbFournisseurCats = fournisseurs\.map\(f => \{ let c = \(f\.category \|\| f\.categorie\)\?\.trim\(\); if \(c === "Produits d\\'entretien" \|\| c === "Produits de maintenance"\) return "Hygiène & Entretien"; return c; \}\)\.filter\(Boolean\);/;
const replacement2 = `const dbFournisseurCats = fournisseurs.map(f => { 
      let c = (f.category || f.categorie)?.trim(); 
      if (c === "Produits d'entretien" || c === "Produits de maintenance") return "Hygiène & Entretien"; 
      if (c === "Boulangerie & Pâtisserie" || c === "Boulangerie et Pâtisserie" || c === "Boulangerie") return "Pâtisserie";
      return c; 
    }).filter(Boolean);`;

code = code.replace(regex1, replacement1).replace(regex2, replacement2);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
