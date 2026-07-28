const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

// Line 171 fix
code = code.replace('print:p-0 overflow-hidden', 'print:p-0 overflow-hidden print:overflow-visible');
// Line 242 fix
code = code.replace('print:shadow-none print:p-8 print:m-0 overflow-hidden bg-[#FAF3E0]', 'print:shadow-none print:p-8 print:m-0 overflow-hidden print:overflow-visible bg-[#FAF3E0]');

fs.writeFileSync('src/MenuGenerator.tsx', code);
console.log("Fixed overflow-hidden for printing");
