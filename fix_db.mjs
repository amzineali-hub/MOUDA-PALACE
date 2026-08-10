import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fix() {
  const inventoryRef = collection(db, 'inventoryItems');
  const snapshot = await getDocs(inventoryRef);
  
  for (const document of snapshot.docs) {
    const data = document.data();
    if (data.category === 'Boulangerie & Pâtisserie' || data.category === 'Boulangerie et Pâtisserie' || data.category === 'Boulangerie' || data.category === 'Patisserie') {
      await updateDoc(doc(db, 'inventoryItems', document.id), { category: 'Pâtisserie' });
    }
  }

  const suppliersRef = collection(db, 'fournisseurs');
  const snap2 = await getDocs(suppliersRef);
  for (const document of snap2.docs) {
    const data = document.data();
    let updated = false;
    let updates = {};
    if (data.category === 'Boulangerie & Pâtisserie' || data.category === 'Boulangerie et Pâtisserie' || data.category === 'Boulangerie' || data.category === 'Patisserie') {
      updates.category = 'Pâtisserie';
      updated = true;
    }
    if (data.categorie === 'Boulangerie & Pâtisserie' || data.categorie === 'Boulangerie et Pâtisserie' || data.categorie === 'Boulangerie' || data.categorie === 'Patisserie') {
      updates.categorie = 'Pâtisserie';
      updated = true;
    }
    if (updated) {
        await updateDoc(doc(db, 'fournisseurs', document.id), updates);
    }
  }
  
  console.log('Fixed DB categories');
}
fix().catch(console.error);
