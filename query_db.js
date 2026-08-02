const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

async function run() {
  const itemsSnap = await getDocs(collection(db, 'inventoryItems'));
  let items = [];
  itemsSnap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
  
  const suppliersSnap = await getDocs(collection(db, 'fournisseurs'));
  let suppliers = [];
  suppliersSnap.forEach(doc => suppliers.push({ id: doc.id, ...doc.data() }));

  console.log("Total items:", items.length);
  // group items by creation date or some pattern
  let demoCount = 0;
  let nonDemoCount = 0;
  items.forEach(i => {
    if (i.id.startsWith('INV-')) demoCount++;
    else nonDemoCount++;
  });
  console.log(`Items starting with INV-: ${demoCount}, other: ${nonDemoCount}`);
  
  console.log("Sample non-INV items:", items.filter(i => !i.id.startsWith('INV-')).slice(0, 3).map(i => i.name));
  
  console.log("Total suppliers:", suppliers.length);
  process.exit(0);
}
run();
