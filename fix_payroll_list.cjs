const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const [payrollList, setPayrollList] = useState([
    { id: 1, period: "Juin 2026", name: "Ahmed Benali", net: "12 500 MAD", status: "Payé", base: 14500, cnss: 268.80, amo: 327.70, igr: 1403.50 },
    { id: 2, period: "Juin 2026", name: "Karima Idrissi", net: "8 200 MAD", status: "Payé", base: 9500, cnss: 268.80, amo: 214.70, igr: 816.50 },
    { id: 3, period: "Juin 2026", name: "Sofia Amrani", net: "5 500 MAD", status: "Payé", base: 6000, cnss: 268.80, amo: 135.60, igr: 95.60 }
  ]);`;

const replacement = `  const [payrollList, setPayrollList] = useState([
    { id: 1, period: "Juin 2026", name: "Ahmed Benali", net: "11459.64 MAD", status: "Payé", base: 14500, cnss: 268.80, amo: 327.70, igr: 2443.86 },
    { id: 2, period: "Juin 2026", name: "Karima Idrissi", net: "8030.22 MAD", status: "Payé", base: 9500, cnss: 268.80, amo: 214.70, igr: 986.28 },
    { id: 3, period: "Juin 2026", name: "Sofia Amrani", net: "5383.15 MAD", status: "Payé", base: 6000, cnss: 268.80, amo: 135.60, igr: 212.45 }
  ]);`;

content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content);
