import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

const newItems = [
  // Boissons
  { name: "Sidi Ali 75cl", category: "Boissons", quantity: 0, unit: "bouteille", minStock: 20, supplier: "Non renseigné" },
  { name: "Sidi Ali 50cl", category: "Boissons", quantity: 0, unit: "bouteille", minStock: 20, supplier: "Non renseigné" },
  { name: "Oulmes 75cl", category: "Boissons", quantity: 0, unit: "bouteille", minStock: 20, supplier: "Non renseigné" },
  { name: "Oulmes 50cl", category: "Boissons", quantity: 0, unit: "bouteille", minStock: 20, supplier: "Non renseigné" },
  { name: "Coca Cola", category: "Boissons", quantity: 0, unit: "bouteille", minStock: 24, supplier: "Non renseigné" },
  { name: "Coca Cola Zero", category: "Boissons", quantity: 0, unit: "bouteille", minStock: 24, supplier: "Non renseigné" },
  { name: "Schweppes Citron", category: "Boissons", quantity: 0, unit: "bouteille", minStock: 24, supplier: "Non renseigné" },
  
  // Produits d'entretien
  { name: "Eau de Javel", category: "Produits d'entretien", quantity: 0, unit: "L", minStock: 10, supplier: "Non renseigné" },
  { name: "Liquide Vaisselle", category: "Produits d'entretien", quantity: 0, unit: "L", minStock: 10, supplier: "Non renseigné" },
  { name: "Nettoyant Sol", category: "Produits d'entretien", quantity: 0, unit: "L", minStock: 5, supplier: "Non renseigné" },
  { name: "Sacs Poubelle 100L", category: "Produits d'entretien", quantity: 0, unit: "rouleau", minStock: 10, supplier: "Non renseigné" },
  { name: "Papier Essuie-tout", category: "Produits d'entretien", quantity: 0, unit: "rouleau", minStock: 20, supplier: "Non renseigné" },
  { name: "Boîtes à Emporter", category: "Produits d'entretien", quantity: 0, unit: "pièce", minStock: 100, supplier: "Non renseigné" },
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
