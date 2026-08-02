const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function run() {
  const snap = await getDocs(collection(db, 'recettes'));
  console.log("Total recettes:", snap.size);
  process.exit(0);
}
run();
