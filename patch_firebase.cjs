const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

code = code.replace(
  /enableMultiTabIndexedDbPersistence\(db\)\.catch\(\(err\) => {[\s\S]*?}\);/,
  `try {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    console.warn("Persistence error:", err);
  });
} catch(e) {
  console.warn("Sync persistence error:", e);
}`
);

fs.writeFileSync('src/firebase.ts', code);
