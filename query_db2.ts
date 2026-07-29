import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function check() {
  const snap = await getDocs(collection(db, 'tables'));
  snap.forEach(doc => {
    console.log(`Doc ID: ${doc.id}, Data ID: ${doc.data().id}`);
  });
  process.exit(0);
}
check();
