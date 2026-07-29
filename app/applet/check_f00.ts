import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function check() {
  const collections = ['menu_items', 'tables', 'invoices', 'commandes', 'fournisseurs', 'cash_receipts', 'expenses', 'financialReports', 'reservations', 'kitchen_tasks'];
  for (const c of collections) {
    try {
      const snap = await getDocs(collection(db, c));
      snap.forEach(doc => {
        if (doc.id.includes("F00")) {
          console.log(`Found ${doc.id} in collection ${c}`);
        }
      });
    } catch(e) {}
  }
  process.exit(0);
}
check();
