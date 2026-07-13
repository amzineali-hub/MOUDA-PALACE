import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  await setDoc(doc(db, 'inventory', 'item1'), {
    name: 'Safran pur de Taliouine',
    quantity: 15,
    criticalThreshold: 50,
    unit: 'g'
  });
  await setDoc(doc(db, 'inventory', 'item2'), {
    name: 'Huile d\'Argan',
    quantity: 2,
    criticalThreshold: 5,
    unit: 'L'
  });
  await setDoc(doc(db, 'inventory', 'item3'), {
    name: 'Olives vertes',
    quantity: 120,
    criticalThreshold: 20,
    unit: 'kg'
  });
  console.log('Seeded successfully!');
}

seed().catch(console.error);
