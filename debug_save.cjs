const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "catch(e) {",
  "catch(e: any) {\n                    console.error('Error saving semi-finished:', e);\n                    showToast('Erreur: ' + e.message);"
);
code = code.replace(
  "showToast('Erreur');",
  ""
);

fs.writeFileSync('src/App.tsx', code);
