const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, addDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

const fournisseurs = [
  { nom: 'Coop Fès Primeurs', contact: 'Ahmed', telephone: '0661234567', categorie: 'Légumes & Fruits', email: 'ahmed@coopfes.ma' },
  { nom: 'Viandes Atlas', contact: 'Rachid', telephone: '0662345678', categorie: 'Viandes', email: 'contact@viandesatlas.ma' },
  { nom: 'Laiterie du Nord', contact: 'Fatima', telephone: '0663456789', categorie: 'Produits Laitiers', email: 'fatima@laiterienord.ma' },
  { nom: 'Epices & Saveurs', contact: 'Youssef', telephone: '0664567890', categorie: 'Épices', email: 'youssef@epices.ma' }
];

async function seed() {
  console.log('Starting seed fournisseurs...');
  try {
    const snap = await getDocs(collection(db, 'fournisseurs'));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }

    for (const f of fournisseurs) {
      await addDoc(collection(db, 'fournisseurs'), f);
    }

    console.log(`Done! Inserted ${fournisseurs.length} fournisseurs.`);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

seed();
