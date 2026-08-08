const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const searchState = `  const [expenses, setExpenses] = useState<any[]>([]);`;
const replaceState = `  const [manualExpenses, setManualExpenses] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);

  const expenses = useMemo(() => {
    const all = [
      ...manualExpenses,
      ...commandes.filter(c => c.status === 'Reçue' || c.status === 'Validée').map(c => ({
        id: c.id,
        category: c.categorie || 'Achat Marchandises',
        supplier: c.fournisseur,
        amount: c.montant,
        date: c.date || new Date(c.createdAt?.toMillis?.() || Date.now()).toLocaleDateString('fr-FR'),
        method: c.method || 'Virement',
        createdAt: c.createdAt,
        description: c.articles,
        isOrder: true
      }))
    ];
    return all.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  }, [manualExpenses, commandes]);`;

code = code.replace(searchState, replaceState);

const searchEffect = `    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    });`;

const replaceEffect = `    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      setManualExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    });
    const unsubCommandes = onSnapshot(collection(db, 'commandes'), (snapshot) => {
      setCommandes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    });`;

code = code.replace(searchEffect, replaceEffect);

const searchCleanup = `    return () => {
      unsubExpenses();
      unsubReports();
    };`;

const replaceCleanup = `    return () => {
      unsubExpenses();
      unsubCommandes();
      unsubReports();
    };`;

code = code.replace(searchCleanup, replaceCleanup);

fs.writeFileSync('src/Accounting.tsx', code);
