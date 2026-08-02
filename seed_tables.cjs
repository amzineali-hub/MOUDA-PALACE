const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, addDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

const tables = [
  { tableNo: 1, capacity: 2, status: 'Disponible' },
  { tableNo: 2, capacity: 4, status: 'Disponible' },
  { tableNo: 3, capacity: 4, status: 'Disponible' },
  { tableNo: 4, capacity: 6, status: 'Disponible' },
  { tableNo: 5, capacity: 2, status: 'Disponible' },
  { tableNo: 6, capacity: 8, status: 'Disponible' },
  { tableNo: 7, capacity: 4, status: 'Disponible' },
  { tableNo: 8, capacity: 4, status: 'Disponible' },
  { tableNo: 9, capacity: 2, status: 'Disponible' },
  { tableNo: 10, capacity: 6, status: 'Disponible' }
];

async function seed() {
  console.log('Starting seed tables...');
  try {
    const snap = await getDocs(collection(db, 'tables'));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
    console.log('Cleared tables');

    for (const t of tables) {
      await addDoc(collection(db, 'tables'), t);
    }

    console.log(`Done! Inserted ${tables.length} tables.`);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

seed();
