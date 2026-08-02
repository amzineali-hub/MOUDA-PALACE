const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function run() {
  // Let's check some common backup names
  const collections = ['inventoryItems', 'inventoryItems_backup', 'fournisseurs', 'fournisseurs_backup', 'backup_inventoryItems', 'items_backup'];
  for (const c of collections) {
    try {
      const snap = await getDocs(collection(db, c));
      console.log(c, "has", snap.size, "documents");
    } catch(e) {
      console.log(c, "error");
    }
  }
  process.exit(0);
}
run();
