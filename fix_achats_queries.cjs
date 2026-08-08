const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// Fix commandes query
code = code.replace(
  "onSnapshot(query(collection(db, 'commandes'), orderBy('createdAt', 'desc')), (snapshot) => {",
  "onSnapshot(collection(db, 'commandes'), (snapshot) => {"
);
code = code.replace(
  "setCommandes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));",
  "setCommandes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));"
);

// Fix fournisseurs query
code = code.replace(
  "onSnapshot(query(collection(db, 'fournisseurs'), orderBy('createdAt', 'desc')), (snapshot) => {",
  "onSnapshot(collection(db, 'fournisseurs'), (snapshot) => {"
);
code = code.replace(
  "setFournisseurs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));",
  "setFournisseurs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));"
);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
