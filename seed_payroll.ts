import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

const payrollList = [
  { id: 'PAY-001', period: "Juin 2026", name: "Ahmed Benali", net: "11459.64 MAD", status: "Payé", base: 14500, cnss: 268.80, amo: 327.70, igr: 2443.86 },
  { id: 'PAY-002', period: "Juin 2026", name: "Karima Idrissi", net: "8030.22 MAD", status: "Payé", base: 9500, cnss: 268.80, amo: 214.70, igr: 986.28 },
  { id: 'PAY-003', period: "Juin 2026", name: "Sofia Amrani", net: "5383.15 MAD", status: "Payé", base: 6000, cnss: 268.80, amo: 135.60, igr: 212.45 }
];

async function seed() {
  console.log("Seeding payroll...");
  for (const p of payrollList) {
    // using Date.now() logic offset to order them nicely
    const createdAt = new Date(Date.now() - Math.random() * 100000);
    await setDoc(doc(db, 'payroll', p.id), { ...p, createdAt });
  }

  console.log('Payroll Seeding complete!');
  process.exit(0);
}

seed();
