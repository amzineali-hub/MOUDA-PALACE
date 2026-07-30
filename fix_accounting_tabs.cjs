const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

// 1. Add states
const stateTarget = `const [isReportModalOpen, setIsReportModalOpen] = useState(false);`;
const stateReplacement = `const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isNewReceiptModalOpen, setIsNewReceiptModalOpen] = useState(false);`;
code = code.replace(stateTarget, stateReplacement);

// 2. Modify "Nouvelle Facture" button
const btnTarget = `<button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#333] transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nouvelle Facture</span>
          </button>`;
const btnReplacement = `<button 
            onClick={() => {
              if (activeTab === 'invoices') setIsNewModalOpen(true);
              else if (activeTab === 'expenses') setIsNewExpenseModalOpen(true);
              else if (activeTab === 'receipts') setIsNewReceiptModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#333] transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">
              {activeTab === 'invoices' ? 'Nouvelle Facture' : activeTab === 'expenses' ? 'Nouvelle Dépense' : activeTab === 'receipts' ? 'Nouvel Encaissement' : 'Nouveau'}
            </span>
          </button>`;
code = code.replace(btnTarget, btnReplacement);

// 3. Remove mock data for expenses but keep it fallback or empty?
// The user asked "Connecter les dépenses à la base de données (Firestore)"
// I will just make sure to add the form, and clear the mock in useEffect.
// Wait, the easiest way is to let the snapshot handle it, but wait!
const mockTarget = `const [expenses, setExpenses] = useState<any[]>([
    { id: 'EXP-001', category: 'Marchandise', supplier: 'Marché Central', date: '19 Nov 2026', amount: '2 300 MAD', method: 'Espèces' },
    { id: 'EXP-002', category: 'Électricité', supplier: 'ONEE', date: '18 Nov 2026', amount: '1 850 MAD', method: 'Virement' },
    { id: 'EXP-003', category: 'Marketing', supplier: 'Facebook Ads', date: '15 Nov 2026', amount: '500 MAD', method: 'Carte Bancaire' },
  ]);`;
const mockReplacement = `const [expenses, setExpenses] = useState<any[]>([]);`;
code = code.replace(mockTarget, mockReplacement);

// Remove `if (!snapshot.empty)` for expenses
const unsubTarget = `const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }
    });`;
const unsubReplacement = `const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });`;
code = code.replace(unsubTarget, unsubReplacement);

fs.writeFileSync('src/Accounting.tsx', code);
