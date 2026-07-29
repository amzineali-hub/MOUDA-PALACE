import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function check() {
  const collections = ['commandes', 'inventoryItems', 'productionTasks'];
  for (const c of collections) {
    const snap = await getDocs(collection(db, c));
    let ids: any = {};
    snap.forEach(doc => {
      const dataId = doc.data().id;
      if (ids[dataId]) {
        console.log(`DUPLICATE DATA ID IN ${c}: ${dataId} (Docs: ${ids[dataId]}, ${doc.id})`);
      } else {
        ids[dataId] = doc.id;
      }
    });
  }
  process.exit(0);
}
check();
