const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));`;

const replacementEffect = `  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    const unsubReceipts = onSnapshot(query(collection(db, 'cash_receipts'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setReceipts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (error) => {
      console.error("Error fetching receipts", error);
    });
    return () => unsubReceipts();
  }, []);

  useEffect(() => {
    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));`;

if (code.includes(targetEffect)) {
  code = code.replace(targetEffect, replacementEffect);
  fs.writeFileSync('src/Accounting.tsx', code);
  console.log("Injected receipts state and effect");
} else {
  console.log("Could not find target effect");
}
