const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

// Add helper
const helper = `
const parseAmount = (val: any) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[^0-9.-]+/g, '')) || 0;
};
`;

if (!code.includes('parseAmount')) {
  code = code.replace(
    "export default function Accounting() {",
    helper + "\nexport default function Accounting() {"
  );
}

// Replace parseFloat in Accounting.tsx
code = code.replace(/parseFloat\(r\.amount\)/g, 'parseAmount(r.amount)');
code = code.replace(/parseFloat\(e\.amount\)/g, 'parseAmount(e.amount)');
code = code.replace(/parseFloat\(i\.amount\.replace\(\/ \/g\, \'\'\)\)/g, 'parseAmount(i.amount)');
code = code.replace(/parseFloat\(i\.amount\)/g, 'parseAmount(i.amount)');
code = code.replace(/Number\(receipt\.amount \|\| 0\)/g, 'parseAmount(receipt.amount)');
code = code.replace(/parseFloat\(expense\.amount\)/g, 'parseAmount(expense.amount)');
code = code.replace(/Number\(invoice\.amount \|\| 0\)/g, 'parseAmount(invoice.amount)');

fs.writeFileSync('src/Accounting.tsx', code);
