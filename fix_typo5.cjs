const fs = require('fs');

let code1 = fs.readFileSync('src/App.tsx', 'utf8');

// Add Boulangerie image
code1 = code1.replace(
  /'Patisseie': 'https:\/\/images\.unsplash/,
  "'Boulangerie': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80',\n    'Patisseie': 'https://images.unsplash"
);

// Add Boulangerie to defaultCats
code1 = code1.replace(
  /'Patisseie', 'Produits Laitiers'/g,
  "'Boulangerie', 'Patisseie', 'Produits Laitiers'"
);

// Update normalizeCategory
code1 = code1.replace(
  /if \(c === 'Boulangerie' \|\| c === 'Boulangerie & Pâtisserie' \|\| c === 'Boulangerie & Patisserie' \|\| c === 'Boulangerie et Pâtisserie' \|\| c === 'Boulangerie et Patisserie' \|\| c === 'Pâtisserie' \|\| c === 'Patisserie'\) return 'Patisseie';/g,
  "if (c === 'Boulangerie & Pâtisserie' || c === 'Boulangerie & Patisserie' || c === 'Boulangerie et Pâtisserie' || c === 'Boulangerie et Patisserie') return 'Boulangerie';\n  if (c === 'Pâtisserie' || c === 'Patisserie') return 'Patisseie';"
);

// Restore DB items from Patisseie to Boulangerie ? No wait, the db already has Patisseie. 
// I should run a script to restore the DB as well?
// Ah, the user said "restaure le avec ses produits".
// When I previously ran the DB update, I changed everything that was "Boulangerie" or "Boulangerie & Pâtisserie" to "Pâtisserie", and then changed the frontend to Patisseie.
// Now I should restore it. The only issue is I don't know which items were originally Boulangerie and which were originally Pâtisserie. But maybe I should just make both available and we can't revert the DB cleanly without more context. Wait, earlier I only updated DB once. I'll just make both categories available in frontend.

fs.writeFileSync('src/App.tsx', code1);

let code2 = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');
code2 = code2.replace(
  /'Patisseie', 'Produits Laitiers'/g,
  "'Boulangerie', 'Patisseie', 'Produits Laitiers'"
);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code2);
console.log('Done restoring Boulangerie category.');
