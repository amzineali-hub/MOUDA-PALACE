const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const searchCommandes = `    const unsubCommandes = onSnapshot(collection(db, 'commandes'), (snapshot) => {
      setCommandes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    }, (error) => {`;

const replaceCommandes = `    const unsubCommandes = onSnapshot(collection(db, 'commandes'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      console.log('Fetched Commandes:', docs.length, docs);
      setCommandes(docs.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    }, (error) => {`;

code = code.replace(searchCommandes, replaceCommandes);

const searchFournisseurs = `    const unsubFournisseurs = onSnapshot(collection(db, 'fournisseurs'), (snapshot) => {
      setFournisseurs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      setLoading(false);
    }, (error) => {`;

const replaceFournisseurs = `    const unsubFournisseurs = onSnapshot(collection(db, 'fournisseurs'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      console.log('Fetched Fournisseurs:', docs.length, docs);
      setFournisseurs(docs.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      setLoading(false);
    }, (error) => {`;

code = code.replace(searchFournisseurs, replaceFournisseurs);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
