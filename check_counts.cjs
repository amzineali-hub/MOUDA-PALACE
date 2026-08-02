const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function run() {
  const iSnap = await getDocs(collection(db, 'inventoryItems'));
  const fSnap = await getDocs(collection(db, 'fournisseurs'));
  console.log("Items:", iSnap.size, "Fournisseurs:", fSnap.size);
  process.exit(0);
}
run();
