const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function check() {
  const snap = await getDocs(collection(db, 'inventoryItems'));
  let found = false;
  snap.forEach(doc => {
    if (doc.data().supplier?.includes('Atacadao')) {
      console.log('Found in inventory:', doc.data().name);
      found = true;
    }
  });
  if (!found) console.log('Not in inventoryItems either.');
  process.exit(0);
}
check();
