const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

code = code.replace(
  /if \(cmd\.id\) \{\s*await deleteDoc\(doc\(db, 'commandes', selectedCommande\.id\)\);\s*\} else \{\s*setCommandes\(prev => prev\.filter\(c => c\.id !== selectedCommande\.id\)\);\s*\}/g,
  "if (selectedCommande?.id) { await deleteDoc(doc(db, 'commandes', selectedCommande.id)); }"
);

code = code.replace(
  /if \(fournisseur\.id\) \{\s*await deleteDoc\(doc\(db, 'fournisseurs', selectedFournisseur\.id\)\);\s*\} else \{\s*setFournisseurs\(prev => prev\.filter\(f => f\.id !== selectedFournisseur\.id\)\);\s*\}/g,
  "if (selectedFournisseur?.id) { await deleteDoc(doc(db, 'fournisseurs', selectedFournisseur.id)); }"
);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
