const { initializeApp } = require('firebase/app');
const { getStorage, ref, listAll } = require('firebase/storage');
const config = require('./firebase-applet-config.json');
const app = initializeApp(config);
const storage = getStorage(app);
async function run() {
  const root = ref(storage, '/');
  try {
    const res = await listAll(root);
    console.log("Prefixes:");
    res.prefixes.forEach((folderRef) => {
      console.log(folderRef.fullPath);
    });
    console.log("Items:");
    res.items.forEach((itemRef) => {
      console.log(itemRef.fullPath);
    });
  } catch(e) { console.error(e.message); }
  process.exit(0);
}
run();
