const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'recipes'), (snapshot) => {
      setRecipes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);`;

const replacement = `  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'recipes'), (snapshot) => {
      setRecipes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'semi_finished'), (snapshot) => {
      setSemiFinished(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Fixed fetch');
} else {
  console.log('Target not found');
}
