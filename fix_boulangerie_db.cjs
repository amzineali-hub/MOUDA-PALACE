const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./firebase-applet-config.json');

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

async function fix() {
  const inventoryRef = db.collection('inventoryItems');
  const snapshot = await inventoryRef.get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.category === 'Boulangerie & Pâtisserie' || data.category === 'Boulangerie et Pâtisserie' || data.category === 'Boulangerie') {
      await doc.ref.update({ category: 'Patisserie' });
    }
  }

  const suppliersRef = db.collection('fournisseurs');
  const snap2 = await suppliersRef.get();
  for (const doc of snap2.docs) {
    const data = doc.data();
    if (data.category === 'Boulangerie & Pâtisserie' || data.category === 'Boulangerie et Pâtisserie' || data.category === 'Boulangerie') {
      await doc.ref.update({ category: 'Patisserie' });
    }
  }
  
  console.log('Fixed DB categories');
}
fix().catch(console.error);
