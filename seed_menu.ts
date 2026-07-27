import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

const menuItems = [
  { id: 'MENU-001', name: 'Zaalouk d\'Aubergines', category: 'Entrées', price: '25 MAD', desc: 'Caviar d\'aubergines grillées à la tomate, ail et épices.', imageUrl: '/8c978763-67b7-4533-b682-dad543615044_3-hours-cultural-walk-in-fes-medina-medium.jpg' },
  { id: 'MENU-002', name: 'Briouates Fromage', category: 'Entrées', price: '35 MAD', desc: 'Délicieux triangles croustillants farcis au fromage.', imageUrl: '' },
  { id: 'MENU-003', name: 'Harira Marrakchia', category: 'Entrées', price: '30 MAD', desc: 'Soupe traditionnelle marocaine aux pois chiches et lentilles.', imageUrl: '' },
  
  { id: 'MENU-004', name: 'Tajine d\'Agneau aux Pruneaux', category: 'Plats Principaux', price: '110 MAD', desc: 'Agneau mijoté aux épices douces, pruneaux caramélisés et amandes.', imageUrl: '/fes-spring.jpg' },
  { id: 'MENU-005', name: 'Couscous Royal 7 Légumes', category: 'Plats Principaux', price: '120 MAD', desc: 'Couscous traditionnel accompagné de 7 légumes de saison.', imageUrl: '' },
  { id: 'MENU-006', name: 'Pastilla aux Fruits de Mer', category: 'Plats Principaux', price: '140 MAD', desc: 'Feuilleté croustillant aux fruits de mer et vermicelles.', imageUrl: '' },
  
  { id: 'MENU-007', name: 'Pastilla au Lait', category: 'Desserts', price: '50 MAD', desc: 'Dessert feuilleté à la crème de lait parfumée à la fleur d\'oranger.', imageUrl: '' },
  { id: 'MENU-008', name: 'Salade d\'Oranges à la Cannelle', category: 'Desserts', price: '40 MAD', desc: 'Tranches d\'oranges fraîches parfumées à la cannelle et fleur d\'oranger.', imageUrl: '' },
  { id: 'MENU-009', name: 'Corne de Gazelle', category: 'Desserts', price: '35 MAD', desc: 'Pâtisseries marocaines aux amandes.', imageUrl: '' },
  
  { id: 'MENU-010', name: 'Thé à la Menthe', category: 'Boissons', price: '20 MAD', desc: 'Thé vert traditionnel à la menthe fraîche.', imageUrl: '' },
  { id: 'MENU-011', name: 'Jus d\'Orange Frais', category: 'Boissons', price: '25 MAD', desc: 'Jus d\'orange pressé minute.', imageUrl: '' },
  { id: 'MENU-012', name: 'Eau Minérale (1L)', category: 'Boissons', price: '15 MAD', desc: 'Bouteille d\'eau minérale.', imageUrl: '' }
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
