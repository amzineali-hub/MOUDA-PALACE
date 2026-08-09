const fs = require('fs');
let code = fs.readFileSync('src/TableauDeBord.tsx', 'utf8');

code = code.replace(
  "const [commandes, setCommandes] = useState<any[]>([]);",
  "const [commandes, setCommandes] = useState<any[]>([]);\n  const [cashReceipts, setCashReceipts] = useState<any[]>([]);"
);

code = code.replace(
  "const unsubCmd = onSnapshot(query(collection(db, 'commandes'), orderBy('createdAt', 'desc')), snap => {\n      setCommandes(snap.docs.map(d => ({ id: d.id, ...d.data() })));\n    });",
  "const unsubCmd = onSnapshot(query(collection(db, 'commandes'), orderBy('createdAt', 'desc')), snap => {\n      setCommandes(snap.docs.map(d => ({ id: d.id, ...d.data() })));\n    });\n    const unsubCash = onSnapshot(collection(db, 'cash_receipts'), snap => {\n      setCashReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() })));\n    });"
);

code = code.replace(
  "unsubTemp();\n      unsubCmd();",
  "unsubTemp();\n      unsubCmd();\n      unsubCash();"
);

fs.writeFileSync('src/TableauDeBord.tsx', code);
