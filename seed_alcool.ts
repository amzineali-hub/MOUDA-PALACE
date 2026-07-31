import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

const newItems = [
  { name: "Vin Rouge 75cl", category: "Boissons Alcoolisées", quantity: 0, unit: "bouteille", minStock: 10, supplier: "Non renseigné" },
  { name: "Vin Blanc 75cl", category: "Boissons Alcoolisées", quantity: 0, unit: "bouteille", minStock: 10, supplier: "Non renseigné" },
  { name: "Vin Rosé 75cl", category: "Boissons Alcoolisées", quantity: 0, unit: "bouteille", minStock: 10, supplier: "Non renseigné" },
  { name: "Bière Heineken 33cl", category: "Boissons Alcoolisées", quantity: 0, unit: "bouteille", minStock: 24, supplier: "Non renseigné" },
  { name: "Bière Casablanca 33cl", category: "Boissons Alcoolisées", quantity: 0, unit: "bouteille", minStock: 24, supplier: "Non renseigné" },
  { name: "Bière Flag Spéciale 33cl", category: "Boissons Alcoolisées", quantity: 0, unit: "bouteille", minStock: 24, supplier: "Non renseigné" },
  { name: "Champagne 75cl", category: "Boissons Alcoolisées", quantity: 0, unit: "bouteille", minStock: 5, supplier: "Non renseigné" }
];

async function seedItems() {
  const itemsColl = collection(db, "inventoryItems");
  for (const item of newItems) {
    await addDoc(itemsColl, { ...item, createdAt: serverTimestamp() });
    console.log("Added:", item.name);
  }
}

seedItems().then(() => {
    setTimeout(() => {
        console.log("Done.");
        process.exit(0);
    }, 2000);
}).catch(console.error);
