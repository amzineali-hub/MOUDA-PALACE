const fs = require('fs');
let code = fs.readFileSync('src/GestionTables.tsx', 'utf-8');

const target1 = `  const [tables, setTables] = useState<any[]>([]);`;
const replacement1 = `  const [tables, setTables] = useState<any[]>([
    { id: 'T1', capacity: 2, status: 'occupee', shape: 'rond', zone: 'patio' },
    { id: 'T2', capacity: 2, status: 'libre', shape: 'rond', zone: 'patio' },
    { id: 'T3', capacity: 4, status: 'reservee', shape: 'carre', zone: 'patio' },
    { id: 'T4', capacity: 4, status: 'libre', shape: 'carre', zone: 'patio' },
    { id: 'T5', capacity: 6, status: 'libre', shape: 'rectangle', zone: 'patio' },
    { id: 'T6', capacity: 2, status: 'libre', shape: 'rond', zone: 'terrasse' },
    { id: 'T7', capacity: 8, status: 'libre', shape: 'rectangle', zone: 'terrasse' },
    { id: 'T8', capacity: 4, status: 'libre', shape: 'carre', zone: 'salon' },
    { id: 'T9', capacity: 4, status: 'occupee', shape: 'carre', zone: 'salon' }
  ]);`;

if (code.includes(target1)) {
    code = code.replace(target1, replacement1);
}

const target2 = `    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      setTables(snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id })));
      setLoading(false);`;
const replacement2 = `    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      const fbTables = snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id }));
      if (fbTables.length > 0) {
        setTables(fbTables);
      }
      setLoading(false);`;
      
if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
}

fs.writeFileSync('src/GestionTables.tsx', code);
console.log('Fixed GestionTables tables state');
