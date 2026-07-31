import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function deleteMange() {
  const querySnapshot = await getDocs(collection(db, "inventoryItems"));
  querySnapshot.forEach(async (doc) => {
    const name = doc.data().name || "";
    if (name.toLowerCase().includes("mange") || name.toUpperCase().includes("MANGE")) {
      console.log("Found document:", doc.id, doc.data());
      console.log("Deleting document:", doc.id);
      await deleteDoc(doc.ref);
      console.log("Deleted.");
    }
  });
}

import { deleteDoc } from "firebase/firestore";
deleteMange().then(() => {
    setTimeout(() => {
        console.log("Done.");
        process.exit(0);
    }, 2000);
}).catch(console.error);
