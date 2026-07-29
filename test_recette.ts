import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, limit } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId || "(default)");

async function test() {
  const q = collection(db, 'recettes');
  const snap = await getDocs(q);
  console.log(snap.docs.map(d => Object.keys(d.data())));
  process.exit(0);
}
test();
