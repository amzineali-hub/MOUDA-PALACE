const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const search = `\\${Number(expense.amount).toFixed(2)} MAD`;
const replace = `\\${parseFloat(expense.amount).toFixed(2)} MAD`;
code = code.replace(new RegExp(search.replace(/\\/g, '\\\\'), 'g'), replace);

fs.writeFileSync('src/Accounting.tsx', code);
