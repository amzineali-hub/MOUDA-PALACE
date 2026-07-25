import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function fix() {
  await updateDoc(doc(db, 'commandes', 'CMD-101'), { status: 'En attente' });
  await updateDoc(doc(db, 'commandes', 'CMD-102'), { status: 'Livrée' });
  console.log("Fixed statuses");
  process.exit(0);
}
fix();
