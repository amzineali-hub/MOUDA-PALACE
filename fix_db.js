import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = require('./firebase-applet-config.json');

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
    if (data.category === 'Boulangerie & Pâtisserie' || data.category === 'Boulangerie et Pâtisserie' || data.category === 'Boulangerie' || data.category === 'Patisserie') {
      await updateDoc(doc(db, 'fournisseurs', document.id), { category: 'Pâtisserie' });
    }
    if (data.categorie === 'Boulangerie & Pâtisserie' || data.categorie === 'Boulangerie et Pâtisserie' || data.categorie === 'Boulangerie' || data.categorie === 'Patisserie') {
      await updateDoc(doc(db, 'fournisseurs', document.id), { categorie: 'Pâtisserie' });
    }
  }
  
  console.log('Fixed DB categories');
}
fix().catch(console.error);
