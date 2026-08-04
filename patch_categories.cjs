const fs = require('fs');

function patchFile(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
}

// AchatsFournisseurs.tsx
patchFile('src/AchatsFournisseurs.tsx', 
  /const defaultCats = \['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes', 'Poissons', 'Légumes', 'Boulangerie', 'Produits Laitiers', 'Boissons', 'Boissons Alcoolisées', 'Sauces', 'Conserves', 'Sirops', "Produits d'entretien", "Matériel", "Services", "Hygiène & Entretien"\];/,
  `const defaultCats = ['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes', 'Poissons', 'Légumes', 'Boulangerie', 'Produits Laitiers', 'Boissons', 'Boissons Alcoolisées', 'Sauces', 'Conserves', 'Sirops', "Matériel", "Services", "Hygiène & Entretien"];`
);

// App.tsx
patchFile('src/App.tsx', 
  /const defaultCats = \['Épices', 'Épicerie', 'Viandes', 'Volailles', 'Fruits Secs', 'Herbes', 'Fruits & Légumes', 'Poissons & Fruits de mer', 'Boulangerie', 'Produits Laitiers', 'Boissons', 'Boissons Alcoolisées', 'Sauces', 'Conserves', 'Sirops', "Produits d'entretien", "Matériel", "Services", "Hygiène & Entretien"\];/,
  `const defaultCats = ['Épices', 'Épicerie', 'Viandes', 'Volailles', 'Fruits Secs', 'Herbes', 'Fruits & Légumes', 'Poissons & Fruits de mer', 'Boulangerie', 'Produits Laitiers', 'Boissons', 'Boissons Alcoolisées', 'Sauces', 'Conserves', 'Sirops', "Matériel", "Services", "Hygiène & Entretien"];`
);

patchFile('src/App.tsx', 
  /    "Produits d'entretien": 'https:\/\/images.unsplash.com\/photo-1585421514738-01798e348b17\?auto=format&fit=crop&w=150&q=80',\n/,
  ''
);

console.log("Patched categories");
