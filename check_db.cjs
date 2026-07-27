const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require("fs");

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function check() {
  const querySnapshot = await getDocs(collection(db, "menu_items"));
  querySnapshot.forEach((doc) => {
    console.log(`"${doc.data().category}"`);
  });
  process.exit(0);
}
check();
