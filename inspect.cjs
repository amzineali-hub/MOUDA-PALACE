const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function run() {
  const itemsSnap = await getDocs(collection(db, 'inventoryItems'));
  let items = [];
  itemsSnap.forEach(d => items.push({ id: d.id, ...d.data() }));
  
  const fs = require('fs');
  fs.writeFileSync('db_dump.json', JSON.stringify({ items }, null, 2));
  console.log("Dumped", items.length, "items");
  process.exit(0);
}
run();
