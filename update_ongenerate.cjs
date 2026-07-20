const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `        onGenerate={(data) => {
          setPayrollList([...payrollList, {
            id: Date.now(),
            period: data.period as string,
            name: data.staffName as string,
            net: \`\${data.net.toFixed(2)} MAD\`,
            status: "Payé",
            base: data.base,
            cnss: data.cnss,
            amo: data.amo,
            igr: data.igr
          }]);
          showToast("Fiche de paie générée (Normes Marocaines)");
          setIsPayrollModalOpen(false);
        }}`;

const replacement = `        onGenerate={(data) => {
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

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
