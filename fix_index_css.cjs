const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const target = `@media print {
  body * {
    visibility: hidden;
  }
  #payslip-print-area, #payslip-print-area * {
    visibility: visible;
  }
  #payslip-print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}`;

if (code.includes(target)) {
  code = code.replace(target, '');
  fs.writeFileSync('src/index.css', code);
  console.log("Removed global print visibility hidden from index.css");
} else {
  console.log("Target not found in index.css");
}
