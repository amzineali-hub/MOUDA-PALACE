const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const targetImport = "import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';";
const replacementImport = "import { collection, onSnapshot, query, addDoc, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';";

if (code.includes(targetImport)) {
  code = code.replace(targetImport, replacementImport);
  fs.writeFileSync('src/POSTactile.tsx', code);
  console.log("Updated POS imports");
} else {
  console.log("Could not find target import");
}
