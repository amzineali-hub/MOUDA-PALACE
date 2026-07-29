const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import BarcodeScanner')) {
  code = code.replace(
    "import MenuGenerator from \"./MenuGenerator\";",
    "import MenuGenerator from \"./MenuGenerator\";\nimport BarcodeScanner from \"./components/BarcodeScanner\";"
  );
  fs.writeFileSync('src/App.tsx', code);
  console.log("Import added");
}
