const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, addDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

const dates = [
  new Date(Date.now() - 86400000 * 2).toLocaleDateString('fr-FR'), // 2 days ago
  new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'), // yesterday
  new Date().toLocaleDateString('fr-FR'), // today
];

const transactions = [
  { item: 'Tomates', type: 'in', quantity: 50, unit: 'kg', amount: 500, date: dates[0], reason: 'Livraison hebdomadaire', user: 'Admin', supplier: 'Coop Fès Primeurs', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { item: 'Viande de boeuf', type: 'in', quantity: 20, unit: 'kg', amount: 2000, date: dates[1], reason: 'Livraison boucherie', user: 'Admin', supplier: 'Viandes Atlas', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { item: 'Tomates', type: 'out', quantity: 5, unit: 'kg', amount: 50, date: dates[2], reason: 'Production Harira', user: 'Chef', createdAt: new Date().toISOString() },
  { item: 'Huile d\'olive', type: 'in', quantity: 10, unit: 'L', amount: 400, date: dates[2], reason: 'Réapprovisionnement', user: 'Admin', supplier: 'Marché', createdAt: new Date().toISOString() },
];

const productionTasks = [
  { item: 'Préparation Harira', qty: 20, priority: 'Haute', status: 'En cours', progress: 50, date: dates[2], createdAt: new Date().toISOString() },
  { item: 'Cuisson Pain Burger', qty: 50, priority: 'Moyenne', status: 'Terminé', progress: 100, date: dates[2], createdAt: new Date(Date.now() - 3600000).toISOString() },
  { item: 'Marinade Poulet', qty: 15, priority: 'Haute', status: 'À faire', progress: 0, date: dates[2], createdAt: new Date().toISOString() },
];

const wasteRecords = [
  { item: 'Tomates', quantity: 2, unit: 'kg', cost: 20, reason: 'Produit abîmé/oxydé', date: dates[1], user: 'Chef', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { item: 'Pain burger', quantity: 5, unit: 'pièce', cost: 15, reason: 'Date d\'expiration dépassée', date: dates[0], user: 'Commis', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
];

async function seed() {
  console.log('Starting seed others...');
  try {
    for (const c of ['inventoryTransactions', 'productionTasks', 'wasteRecords']) {
      const snap = await getDocs(collection(db, c));
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    }

    for (const t of transactions) await addDoc(collection(db, 'inventoryTransactions'), t);
    for (const p of productionTasks) await addDoc(collection(db, 'productionTasks'), p);
    for (const w of wasteRecords) await addDoc(collection(db, 'wasteRecords'), w);

    console.log(`Done seeding transactions, production, waste.`);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

seed();
