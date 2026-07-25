import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

const menuItems = [
  { id: 'MENU-001', name: 'Zaalouk d\'Aubergines', category: 'Entrées', price: '25 MAD', desc: 'Caviar d\'aubergines grillées à la tomate, ail et épices.', imageUrl: '/8c978763-67b7-4533-b682-dad543615044_3-hours-cultural-walk-in-fes-medina-medium.jpg' },
  { id: 'MENU-002', name: 'Tajine d\'Agneau aux Pruneaux', category: 'Plats Principaux', price: '110 MAD', desc: 'Agneau mijoté aux épices douces, pruneaux caramélisés et amandes.', imageUrl: '/fes-spring.jpg' }
];

async function seed() {
  console.log("Seeding menu...");
  for (const p of menuItems) {
    const createdAt = new Date();
    await setDoc(doc(db, 'menu_items', p.id), { ...p, createdAt });
  }

  console.log('Menu Seeding complete!');
  process.exit(0);
}

seed();
