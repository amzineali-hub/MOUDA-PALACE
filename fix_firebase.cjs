const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');
code = code.replace(
  'const db = initializeFirestore(app, { experimentalForceLongPolling: true }, (firebaseConfig as any).firestoreDatabaseId || "(default)");',
  'const db = initializeFirestore(app, { experimentalForceLongPolling: true }, (firebaseConfig as any).firestoreDatabaseId || "(default)");\n\ntry {\n  enableMultiTabIndexedDbPersistence(db).catch((err) => {\n    if (err.code === "failed-precondition") {\n      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");\n    } else if (err.code === "unimplemented") {\n      console.warn("The current browser does not support all of the features required to enable persistence");\n    }\n  });\n} catch (e) {\n  console.warn("Could not enable persistence", e);\n}'
);
fs.writeFileSync('src/firebase.ts', code);
console.log("Firebase persistence enabled.");
