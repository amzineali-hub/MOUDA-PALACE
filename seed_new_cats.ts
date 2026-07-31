import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

const newItems = [
  { name: "Ketchup 1L", category: "Sauces", quantity: 0, unit: "bouteille", minStock: 5, supplier: "Non renseigné" },
  { name: "Mayonnaise 1L", category: "Sauces", quantity: 0, unit: "bouteille", minStock: 5, supplier: "Non renseigné" },
  { name: "Moutarde de Dijon 850g", category: "Sauces", quantity: 0, unit: "pot", minStock: 5, supplier: "Non renseigné" },
  { name: "Sauce Soja 1L", category: "Sauces", quantity: 0, unit: "bouteille", minStock: 5, supplier: "Non renseigné" },
  { name: "Sauce Tabasco 150ml", category: "Sauces", quantity: 0, unit: "bouteille", minStock: 2, supplier: "Non renseigné" },
  { name: "Sauce Barbecue 1L", category: "Sauces", quantity: 0, unit: "bouteille", minStock: 5, supplier: "Non renseigné" },
  
  { name: "Thon à l'huile 1kg", category: "Conserves", quantity: 0, unit: "boîte", minStock: 10, supplier: "Non renseigné" },
  { name: "Maïs doux 800g", category: "Conserves", quantity: 0, unit: "boîte", minStock: 10, supplier: "Non renseigné" },
  { name: "Champignons de Paris 800g", category: "Conserves", quantity: 0, unit: "boîte", minStock: 10, supplier: "Non renseigné" },
  { name: "Olives noires dénoyautées 1kg", category: "Conserves", quantity: 0, unit: "boîte", minStock: 10, supplier: "Non renseigné" },
  { name: "Olives vertes dénoyautées 1kg", category: "Conserves", quantity: 0, unit: "boîte", minStock: 10, supplier: "Non renseigné" },
  { name: "Câpres 500g", category: "Conserves", quantity: 0, unit: "bocal", minStock: 5, supplier: "Non renseigné" },
  { name: "Anchois à l'huile 500g", category: "Conserves", quantity: 0, unit: "boîte", minStock: 5, supplier: "Non renseigné" },
  { name: "Tomates pelées 1kg", category: "Conserves", quantity: 0, unit: "boîte", minStock: 20, supplier: "Non renseigné" },
  
  { name: "Sirop de Grenadine 1L", category: "Sirops", quantity: 0, unit: "bouteille", minStock: 5, supplier: "Non renseigné" },
  { name: "Sirop de Menthe 1L", category: "Sirops", quantity: 0, unit: "bouteille", minStock: 5, supplier: "Non renseigné" },
  { name: "Sirop de Citron 1L", category: "Sirops", quantity: 0, unit: "bouteille", minStock: 5, supplier: "Non renseigné" },
  { name: "Sirop de Fraise 1L", category: "Sirops", quantity: 0, unit: "bouteille", minStock: 5, supplier: "Non renseigné" },
  { name: "Sirop de Pêche 1L", category: "Sirops", quantity: 0, unit: "bouteille", minStock: 5, supplier: "Non renseigné" }
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
