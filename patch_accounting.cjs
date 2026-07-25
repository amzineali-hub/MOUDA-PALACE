const fs = require('fs');

let content = fs.readFileSync('src/Accounting.tsx', 'utf-8');

// 1. Add Firebase imports
content = content.replace(
  "import { useToast } from './context/ToastContext';",
  "import { useToast } from './context/ToastContext';\nimport { collection, onSnapshot, query, orderBy } from 'firebase/firestore';\nimport { db } from './firebase';\nimport { useEffect } from 'react';"
);

// 2. Replace hardcoded arrays with useState
const oldInvoicesStr = `  const invoices = [
    { id: 'INV-2024-001', client: 'Société Alpha', date: '2024-03-01', amount: 15400.00, status: 'payée', type: 'B2B' },
    { id: 'INV-2024-002', client: 'Hôtel Le Marrakech', date: '2024-03-05', amount: 8250.00, status: 'en attente', type: 'B2B' },
    { id: 'INV-2024-003', client: 'Particulier (Table 12)', date: '2024-03-10', amount: 1240.50, status: 'payée', type: 'B2C' },
    { id: 'INV-2024-004', client: 'Agence Voyage XYZ', date: '2024-03-12', amount: 24500.00, status: 'retard', type: 'B2B' },
    { id: 'INV-2024-005', client: 'Particulier (Table 04)', date: '2024-03-15', amount: 890.00, status: 'payée', type: 'B2C' },
  ];`;

const newInvoicesStr = `  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'invoices')), (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching invoices", error);
      showToast("Erreur lors de la récupération des factures");
      setLoading(false);
    });

    return () => unsub();
  }, []);`;

content = content.replace(oldInvoicesStr, newInvoicesStr);

// Top stats:
content = content.replace(
  '<p className="text-2xl font-bold text-[#1A1A1A]">142,500 DH</p>',
  '<p className="text-2xl font-bold text-[#1A1A1A]">{invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0).toLocaleString()} DH</p>'
);

content = content.replace(
  '<p className="text-2xl font-bold text-[#1A1A1A]">32</p>',
  '<p className="text-2xl font-bold text-[#1A1A1A]">{invoices.filter(inv => inv.status === "en attente").length}</p>'
);

content = content.replace(
  '<p className="text-2xl font-bold text-[#1A1A1A]">15,400 DH</p>',
  '<p className="text-2xl font-bold text-[#1A1A1A]">{invoices.filter(inv => inv.status === "retard").reduce((acc, inv) => acc + (inv.amount || 0), 0).toLocaleString()} DH</p>'
);

fs.writeFileSync('src/Accounting.tsx', content);
