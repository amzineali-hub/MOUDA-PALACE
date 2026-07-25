import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

const categories = [
  'Épices', 'Épicerie', 'Viandes', 'Poissons', 'Fruits Secs', 
  'Herbes', 'Produits Laitiers', 'Légumes', 'Fruits', 'Boulangerie'
];

const inventoryItems = [
  { id: 'INV-001', name: 'Safran de Taliouine', category: 'Épices', supplier: 'Coopérative Taliouine', quantity: 250, unit: 'g', minStock: 100 },
  { id: 'INV-002', name: 'Huile d\'Olive Vierge Extra', category: 'Épicerie', supplier: 'Ferme Atlas', quantity: 15, unit: 'L', minStock: 20 },
  { id: 'INV-003', name: 'Viande d\'Agneau (Épaule)', category: 'Viandes', supplier: 'Boucherie Al Baraka', quantity: 45, unit: 'kg', minStock: 20 },
  { id: 'INV-004', name: 'Menthe Fraîche', category: 'Herbes', supplier: 'Marché Central', quantity: 2, unit: 'kg', minStock: 5 },
  { id: 'INV-005', name: 'Amandes Émondées', category: 'Fruits Secs', supplier: 'Grossiste Fès', quantity: 12, unit: 'kg', minStock: 10 },
  { id: 'INV-006', name: 'Cumin en poudre', category: 'Épices', supplier: 'Marché Central', quantity: 2, unit: 'kg', minStock: 1 },
  { id: 'INV-007', name: 'Paprika (Felfla Hlouwa)', category: 'Épices', supplier: 'Marché Central', quantity: 3, unit: 'kg', minStock: 1.5 },
  { id: 'INV-008', name: 'Semoule de Blé Dur', category: 'Épicerie', supplier: 'Minoterie Nationale', quantity: 50, unit: 'kg', minStock: 25 },
  { id: 'INV-009', name: 'Poulet Fermier', category: 'Viandes', supplier: 'Boucherie Al Baraka', quantity: 30, unit: 'kg', minStock: 15 },
  { id: 'INV-010', name: 'Filet de Saint-Pierre', category: 'Poissons', supplier: 'Marée Blanche', quantity: 8, unit: 'kg', minStock: 5 },
  { id: 'INV-011', name: 'Calamars', category: 'Poissons', supplier: 'Marée Blanche', quantity: 10, unit: 'kg', minStock: 5 },
  { id: 'INV-012', name: 'Noix de Grenoble', category: 'Fruits Secs', supplier: 'Grossiste Fès', quantity: 5, unit: 'kg', minStock: 2 },
  { id: 'INV-013', name: 'Coriandre Fraîche', category: 'Herbes', supplier: 'Marché Central', quantity: 1.5, unit: 'kg', minStock: 1 },
  { id: 'INV-014', name: 'Beurre Doux', category: 'Produits Laitiers', supplier: 'Laiterie du Nord', quantity: 10, unit: 'kg', minStock: 5 },
  { id: 'INV-015', name: 'Lait Entier', category: 'Produits Laitiers', supplier: 'Laiterie du Nord', quantity: 20, unit: 'L', minStock: 10 },
  { id: 'INV-016', name: 'Oignons Jaunes', category: 'Légumes', supplier: 'Ferme Atlas', quantity: 40, unit: 'kg', minStock: 20 },
  { id: 'INV-017', name: 'Tomates Rondes', category: 'Légumes', supplier: 'Ferme Atlas', quantity: 25, unit: 'kg', minStock: 15 },
  { id: 'INV-018', name: 'Citrons Jaunes', category: 'Fruits', supplier: 'Ferme Atlas', quantity: 10, unit: 'kg', minStock: 5 },
  { id: 'INV-019', name: 'Oranges à Jus', category: 'Fruits', supplier: 'Ferme Atlas', quantity: 30, unit: 'kg', minStock: 15 },
  { id: 'INV-020', name: 'Baguette Tradition', category: 'Boulangerie', supplier: 'Boulangerie du Coin', quantity: 50, unit: 'pièce', minStock: 20 }
];

const recettes = [
  { id: 'R001', nom: 'Pastilla au Pigeon', categorie: 'Plats Principaux', cout: '120 MAD', temps: '1h 30m', portion: '4 personnes', difficulte: 'Difficile' },
  { id: 'R002', nom: 'Couscous Royal', categorie: 'Plats Principaux', cout: '150 MAD', temps: '2h', portion: '6 personnes', difficulte: 'Moyenne' },
  { id: 'R003', nom: 'Zaalouk d\'Aubergines', categorie: 'Entrées', cout: '25 MAD', temps: '40m', portion: '2 personnes', difficulte: 'Facile' },
  { id: 'R004', nom: 'Tajine d\'Agneau aux Pruneaux', categorie: 'Plats Principaux', cout: '110 MAD', temps: '1h 45m', portion: '4 personnes', difficulte: 'Moyenne' },
  { id: 'R005', nom: 'Corne de Gazelle', categorie: 'Desserts', cout: '60 MAD', temps: '2h', portion: '12 pièces', difficulte: 'Difficile' },
  { id: 'R006', nom: 'Harira Marocaine', categorie: 'Entrées', cout: '40 MAD', temps: '1h 15m', portion: '4 personnes', difficulte: 'Moyenne' },
  { id: 'R007', nom: 'Tajine de Poulet aux Olives', categorie: 'Plats Principaux', cout: '90 MAD', temps: '1h 20m', portion: '4 personnes', difficulte: 'Facile' },
  { id: 'R008', nom: 'Briouates aux Amandes', categorie: 'Desserts', cout: '50 MAD', temps: '1h', portion: '10 pièces', difficulte: 'Moyenne' }
];

const fournisseurs = [
  { id: 'F001', nom: 'Coopérative Taliouine', categorie: 'Épices', contact: '0600112233', rating: 4.8 },
  { id: 'F002', nom: 'Ferme Atlas', categorie: 'Épicerie & Légumes', contact: '0600445566', rating: 4.5 },
  { id: 'F003', nom: 'Boucherie Al Baraka', categorie: 'Viandes', contact: '0600778899', rating: 4.9 },
  { id: 'F004', nom: 'Marée Blanche', categorie: 'Poissons', contact: '0600998877', rating: 4.7 },
  { id: 'F005', nom: 'Grossiste Fès', categorie: 'Fruits Secs', contact: '0600554433', rating: 4.6 },
  { id: 'F006', nom: 'Laiterie du Nord', categorie: 'Produits Laitiers', contact: '0600332211', rating: 4.8 },
  { id: 'F007', nom: 'Marché Central', categorie: 'Herbes & Épices', contact: '0600111222', rating: 4.4 }
];

async function seed() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    await setDoc(doc(db, 'inventoryCategories', cat), { name: cat, createdAt: new Date() });
  }
  
  console.log("Seeding inventoryItems...");
  for (const item of inventoryItems) {
    await setDoc(doc(db, 'inventoryItems', item.id), { ...item, createdAt: new Date() });
  }
  
  console.log("Seeding recettes...");
  for (const rec of recettes) {
    await setDoc(doc(db, 'recettes', rec.id), { ...rec, createdAt: new Date() });
  }
  
  console.log("Seeding fournisseurs...");
  for (const f of fournisseurs) {
    await setDoc(doc(db, 'fournisseurs', f.id), { ...f, createdAt: new Date() });
  }

  console.log('Rich Seeding complete!');
  process.exit(0);
}

seed();
