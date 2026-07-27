const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, serverTimestamp } = require("firebase/firestore");
const fs = require("fs");

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function test() {
  await addDoc(collection(db, "productionTasks"), {
    orderId: "CMD-TEST",
    item: "Thé à la Menthe",
    qty: 2,
    status: "À faire",
    progress: 0,
    createdAt: new Date(),
    source: "POS"
  });
  console.log("Added test task");
  process.exit(0);
}
test();
