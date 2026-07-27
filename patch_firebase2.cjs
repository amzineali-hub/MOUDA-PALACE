const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

code = code.replace(
  /enableMultiTabIndexedDbPersistence\(db\)\.catch\([\s\S]*?\}\);/g,
  ''
);
code = code.replace(
  /try \{\s*\} catch\(e\) \{\s*console\.warn\("Sync persistence error:", e\);\s*\}/g,
  ''
);

fs.writeFileSync('src/firebase.ts', code);
