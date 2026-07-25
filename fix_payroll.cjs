const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldState = `  const [payrollList, setPayrollList] = useState([
    { id: 1, period: "Juin 2026", name: "Ahmed Benali", net: "11459.64 MAD", status: "Payé", base: 14500, cnss: 268.80, amo: 327.70, igr: 2443.86 },
    { id: 2, period: "Juin 2026", name: "Karima Idrissi", net: "8030.22 MAD", status: "Payé", base: 9500, cnss: 268.80, amo: 214.70, igr: 986.28 },
    { id: 3, period: "Juin 2026", name: "Sofia Amrani", net: "5383.15 MAD", status: "Payé", base: 6000, cnss: 268.80, amo: 135.60, igr: 212.45 }
  ]);`;

const newState = `  const [payrollList, setPayrollList] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'payroll'), orderBy('createdAt', 'desc')), (snapshot) => {
      setPayrollList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching payroll", error);
    });
    return () => unsub();
  }, []);`;

content = content.replace(oldState, newState);

const oldOnGenerate = `        onGenerate={(data) => {
          const newPayslip = {
            id: Date.now(),
            period: data.period as string,
            name: data.staffName as string,
            net: \`\${data.net.toFixed(2)} MAD\`,
            status: "Payé",
            base: data.base,
            cnss: data.cnss,
            amo: data.amo,
            igr: data.igr
          };
          setPayrollList([...payrollList, newPayslip]);
          showToast("Fiche de paie générée (Normes Marocaines)");
          setIsPayrollModalOpen(false);
          setSelectedPayslip(newPayslip);
          setIsPayslipDocOpen(true);
        }}`;

const newOnGenerate = `        onGenerate={async (data) => {
          const newPayslip = {
            period: data.period as string,
            name: data.staffName as string,
            net: \`\${data.net.toFixed(2)} MAD\`,
            status: "Payé",
            base: data.base,
            cnss: data.cnss,
            amo: data.amo,
            igr: data.igr,
            createdAt: serverTimestamp()
          };
          
          try {
            const docRef = await addDoc(collection(db, 'payroll'), newPayslip);
            showToast("Fiche de paie générée (Normes Marocaines)");
            setIsPayrollModalOpen(false);
            setSelectedPayslip({ id: docRef.id, ...newPayslip });
            setIsPayslipDocOpen(true);
          } catch (err) {
            console.error("Error adding payslip", err);
            showToast("Erreur lors de la génération");
          }
        }}`;

content = content.replace(oldOnGenerate, newOnGenerate);

fs.writeFileSync('src/App.tsx', content);
