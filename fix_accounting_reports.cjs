const fs = require('fs');
let content = fs.readFileSync('src/Accounting.tsx', 'utf-8');

const oldStaticVars = `  const expenses = [
    { id: 'EXP-001', category: 'Marchandise', supplier: 'Marché Central', date: '19 Nov 2026', amount: '2 300 MAD', method: 'Espèces' },
    { id: 'EXP-002', category: 'Électricité', supplier: 'ONEE', date: '18 Nov 2026', amount: '1 850 MAD', method: 'Virement' },
    { id: 'EXP-003', category: 'Marketing', supplier: 'Facebook Ads', date: '15 Nov 2026', amount: '500 MAD', method: 'Carte Bancaire' },
  ];

  const financialReports = [
    { id: 'RPT-2026-11', type: 'Bilan Comptable', date: '30 Nov 2026', status: 'Généré', format: 'PDF' },
    { id: 'RPT-2026-T3', type: 'Déclaration TVA (Maroc)', date: '15 Oct 2026', status: 'Soumis', format: 'PDF / XML' },
    { id: 'RPT-2026-10', type: 'CPC (Compte de Produits et Charges)', date: '31 Oct 2026', status: 'Généré', format: 'Excel' },
    { id: 'RPT-2026-09', type: 'Bilan Comptable', date: '30 Sep 2026', status: 'Généré', format: 'PDF' },
  ];`;

const newStaticVars = `  const [expenses, setExpenses] = useState<any[]>([
    { id: 'EXP-001', category: 'Marchandise', supplier: 'Marché Central', date: '19 Nov 2026', amount: '2 300 MAD', method: 'Espèces' },
    { id: 'EXP-002', category: 'Électricité', supplier: 'ONEE', date: '18 Nov 2026', amount: '1 850 MAD', method: 'Virement' },
    { id: 'EXP-003', category: 'Marketing', supplier: 'Facebook Ads', date: '15 Nov 2026', amount: '500 MAD', method: 'Carte Bancaire' },
  ]);

  const [financialReports, setFinancialReports] = useState<any[]>([
    { id: 'RPT-2026-11', type: 'Bilan Comptable', date: '30 Nov 2026', status: 'Généré', format: 'PDF' },
    { id: 'RPT-2026-T3', type: 'Déclaration TVA (Maroc)', date: '15 Oct 2026', status: 'Soumis', format: 'PDF / XML' },
    { id: 'RPT-2026-10', type: 'CPC (Compte de Produits et Charges)', date: '31 Oct 2026', status: 'Généré', format: 'Excel' },
    { id: 'RPT-2026-09', type: 'Bilan Comptable', date: '30 Sep 2026', status: 'Généré', format: 'PDF' },
  ]);

  useEffect(() => {
    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });
    const unsubReports = onSnapshot(query(collection(db, 'financialReports'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setFinancialReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });
    return () => {
      unsubExpenses();
      unsubReports();
    };
  }, []);`;

content = content.replace(oldStaticVars, newStaticVars);

const oldReportButton = `<button 
                onClick={() => {
                  handleDownloadReport(reportType, reportFormat);
                  setIsReportModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Générer et télécharger
              </button>`;

const newReportButton = `<button 
                onClick={async () => {
                  handleDownloadReport(reportType, reportFormat);
                  const newReport = {
                    id: 'RPT-' + Date.now().toString().slice(-4),
                    type: reportType,
                    date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: 'Généré',
                    format: reportFormat,
                    createdAt: serverTimestamp()
                  };
                  setFinancialReports([newReport, ...financialReports]);
                  setIsReportModalOpen(false);
                  
                  try {
                    await addDoc(collection(db, 'financialReports'), newReport);
                  } catch (err) {
                    console.error("Error creating report", err);
                  }
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Générer et télécharger
              </button>`;

content = content.replace(oldReportButton, newReportButton);

fs.writeFileSync('src/Accounting.tsx', content);
