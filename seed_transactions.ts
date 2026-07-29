import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId || "(default)");

const suppliers = [
  { name: "Coopérative Taliouine", cat: "Épices" },
  { name: "Domaine de l'Olivier", cat: "Épicerie" },
  { name: "Marché Central", cat: "Légumes" },
  { name: "Boucherie Atlas", cat: "Viandes" },
  { name: "Poissonnerie du Port", cat: "Poissons" }
];

const items = [
  { name: "Safran Pur", unit: "kg", price: 1500, supplier: suppliers[0] },
  { name: "Huile d'Olive Extra Vierge", unit: "L", price: 45, supplier: suppliers[1] },
  { name: "Oignons Rouges", unit: "kg", price: 4, supplier: suppliers[2] },
  { name: "Agneau - Épaule", unit: "kg", price: 85, supplier: suppliers[3] },
  { name: "Lotte", unit: "kg", price: 120, supplier: suppliers[4] },
  { name: "Bar", unit: "kg", price: 90, supplier: suppliers[4] },
  { name: "Tomates Grappes", unit: "kg", price: 6, supplier: suppliers[2] },
  { name: "Farine T55", unit: "kg", price: 5, supplier: suppliers[1] },
];

async function seed() {
  console.log("Seeding transactions...");
  const colRef = collection(db, 'inventoryTransactions');
  for (let i = 0; i < 20; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const qty = Math.floor(Math.random() * 50) + 5;
    
    // Simulate past dates
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    
    try {
      await addDoc(colRef, {
        itemId: `SEED-ITEM-${i}`,
        itemName: item.name,
        type: 'in',
        quantity: qty,
        reason: 'Achat fournisseur',
        date: d.toLocaleDateString('fr-FR'),
        user: 'Admin',
        amount: qty,
        unit: item.unit,
        item: item.name,
        supplier: item.supplier.name,
        unitPrice: item.price,
        totalPrice: item.price * qty,
        createdAt: serverTimestamp()
      });
      console.log(`Added transaction for ${item.name}`);
    } catch (e) {
      console.error(`Failed:`, e);
    }
  }
  
  // also add some "out" transactions
  for (let i = 0; i < 15; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const qty = Math.floor(Math.random() * 10) + 1;
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    
    try {
      await addDoc(colRef, {
        itemId: `SEED-ITEM-${i}`,
        itemName: item.name,
        type: 'out',
        quantity: qty,
        reason: 'Consommation cuisine',
        date: d.toLocaleDateString('fr-FR'),
        user: 'Chef de Cuisine',
        amount: qty,
        unit: item.unit,
        item: item.name,
        createdAt: serverTimestamp()
      });
      console.log(`Added OUT transaction for ${item.name}`);
    } catch (e) {}
  }
  
  console.log("Seeding completed.");
  process.exit(0);
}

seed();
