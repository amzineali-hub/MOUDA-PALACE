import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId || "(default)");

async function test() {
  const qF = query(collection(db, 'fournisseurs'), orderBy('createdAt', 'desc'));
  const snapF = await getDocs(qF);
  console.log("Fournisseurs count:", snapF.size);
  
  const qC = query(collection(db, 'commandes'), orderBy('createdAt', 'desc'));
  const snapC = await getDocs(qC);
  console.log("Commandes count:", snapC.size);
  process.exit(0);
}
test();
