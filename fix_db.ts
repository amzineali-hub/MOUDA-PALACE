import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId || "(default)");

async function fix() {
  const colRef = collection(db, 'commandes');
  const snap = await getDocs(colRef);
  
  for (const d of snap.docs) {
    const data = d.data();
    if (Array.isArray(data.articles)) {
      const articlesStr = data.articles.map(a => `${a.quantite}x ${a.nom}`).join(', ');
      const itemsCount = data.articles.length;
      await updateDoc(doc(db, 'commandes', d.id), {
        articles: articlesStr,
        items: itemsCount
      });
      console.log(`Updated cmd ${d.id}`);
    }
  }
  process.exit(0);
}
fix();
