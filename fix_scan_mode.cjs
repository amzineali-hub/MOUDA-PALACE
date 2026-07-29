const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const [scannedBarcode, setScannedBarcode] = useState('');",
  "const [scannedBarcode, setScannedBarcode] = useState('');\n  const [scanMode, setScanMode] = useState<'single'|'multiple'>('single');\n  const [multiScanItems, setMultiScanItems] = useState<any[]>([]);"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Added state");
