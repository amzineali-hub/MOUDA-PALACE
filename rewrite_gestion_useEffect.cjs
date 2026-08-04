const fs = require('fs');
let code = fs.readFileSync('src/GestionTables.tsx', 'utf-8');

const target = code.substring(code.indexOf('  useEffect(() => {'), code.indexOf('  const handleAddTable = async (e: React.FormEvent) => {', code.indexOf('  useEffect(() => {') + 100));

const replacement = `  useEffect(() => {
    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      const fbTables = snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id }));
      if (fbTables.length > 0) {
        setTables(fbTables);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tables", error);
      showToast("Erreur lors de la récupération des tables");
      setLoading(false);
    });

    return () => {
      unsubTables();
    };
  }, []);

`;

code = code.replace(target, replacement);
fs.writeFileSync('src/GestionTables.tsx', code);
console.log('Fixed useEffect');
