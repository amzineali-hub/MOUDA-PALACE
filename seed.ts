import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

const inventoryItems = [
  { id: 'INV-001', name: 'Safran de Taliouine', category: 'Épices', supplier: 'Coopérative Taliouine', quantity: 250, unit: 'g', minStock: 100, requiredQty: 150 },
  { id: 'INV-002', name: 'Huile d\'Olive Vierge Extra', category: 'Épicerie', supplier: 'Ferme Atlas', quantity: 15, unit: 'L', minStock: 20, requiredQty: 25 },
  { id: 'INV-003', name: 'Viande d\'Agneau (Épaule)', category: 'Viandes', supplier: 'Boucherie Médina', quantity: 45, unit: 'kg', minStock: 20, requiredQty: 30 },
  { id: 'INV-004', name: 'Menthe Fraîche', category: 'Herbes', supplier: 'Marché Central', quantity: 2, unit: 'kg', minStock: 5, requiredQty: 5 },
  { id: 'INV-005', name: 'Amandes Émondées', category: 'Fruits Secs', supplier: 'Grossiste Fès', quantity: 12, unit: 'kg', minStock: 10, requiredQty: 15 }
];

const inventoryTransactions = [
  { id: 'TX-1209', type: 'out', item: 'Menthe Fraîche', amount: 0.5, unit: 'kg', reason: 'Service Thé du Soir (Cuisine)', date: 'Aujourd\'hui, 17:30', user: 'Chef Hassan' },
  { id: 'TX-1208', type: 'in', item: 'Viande d\'Agneau (Épaule)', amount: 20, unit: 'kg', reason: 'Livraison Hebdomadaire', date: 'Aujourd\'hui, 09:15', user: 'Réception' },
  { id: 'TX-1207', type: 'out', item: 'Huile d\'Olive Vierge Extra', amount: 2, unit: 'L', reason: 'Préparation Tagines (Cuisine)', date: 'Hier, 11:00', user: 'Chef Hassan' }
];

const productionTasks = [
  { id: 'PT-001', item: "Fonds de volaille", qty: "10 L", progress: 100, status: "Terminé", priority: "Basse" },
  { id: 'PT-002', item: "Légumes taillés (Brunoise)", qty: "5 kg", progress: 60, status: "En cours", priority: "Moyenne" },
  { id: 'PT-003', item: "Pâte à Pastilla", qty: "40 feuilles", progress: 0, status: "À faire", priority: "Haute" }
];

const commandes = [
  { id: 'CMD-101', fournisseur: 'Coopérative Taliouine', date: '25 Nov 2026', deliveryDate: '28 Nov 2026', montant: '1 250 MAD', status: 'En cours', items: 2 },
  { id: 'CMD-102', fournisseur: 'Ferme Atlas', date: '24 Nov 2026', deliveryDate: '26 Nov 2026', montant: '450 MAD', status: 'Livré', items: 1 }
];

const fournisseurs = [
  { id: 'F001', nom: 'Coopérative Taliouine', categorie: 'Épices', contact: '0600112233', rating: 4.8 },
  { id: 'F002', nom: 'Ferme Atlas', categorie: 'Épicerie', contact: '0600445566', rating: 4.5 },
  { id: 'F003', nom: 'Boucherie Médina', categorie: 'Viandes', contact: '0600778899', rating: 4.9 }
];

async function seed() {
  for (const item of inventoryItems) {
    await setDoc(doc(db, 'inventoryItems', item.id), { ...item, createdAt: new Date() });
  }
  for (const tx of inventoryTransactions) {
    await setDoc(doc(db, 'inventoryTransactions', tx.id), { ...tx, createdAt: new Date() });
  }
  for (const pt of productionTasks) {
    await setDoc(doc(db, 'productionTasks', pt.id), { ...pt, createdAt: new Date() });
  }
  for (const c of commandes) {
    await setDoc(doc(db, 'commandes', c.id), { ...c, createdAt: new Date() });
  }
  for (const f of fournisseurs) {
    await setDoc(doc(db, 'fournisseurs', f.id), { ...f, createdAt: new Date() });
  }
  console.log('Seeding complete!');
  process.exit(0);
}

seed();
