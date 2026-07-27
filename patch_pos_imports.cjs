const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');
code = code.replace("import { collection, onSnapshot, query } from 'firebase/firestore';", "import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';");
fs.writeFileSync('src/POSTactile.tsx', code);
