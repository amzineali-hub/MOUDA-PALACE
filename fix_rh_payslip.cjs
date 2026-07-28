const fs = require('fs');
let code = fs.readFileSync('src/RH.tsx', 'utf8');

code = code.replace(
  '<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">',
  '<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:bg-white print:backdrop-blur-none print:items-start print:p-0 print:absolute">'
);

code = code.replace(
  'className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto flex flex-col"',
  'className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto flex flex-col print:shadow-none print:max-w-full print:max-h-full print:overflow-visible print:rounded-none"'
);

// also add print:hidden to the header of the payslip modal
code = code.replace(
  '<div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl sticky top-0 z-10">',
  '<div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl sticky top-0 z-10 print:hidden">'
);

// also hide the rest of RH.tsx content when modal is open during print
code = code.replace(
  '<div className="p-6">',
  '<div className={`p-6 ${isPayslipDocOpen ? "print:hidden" : ""}`}>'
);

fs.writeFileSync('src/RH.tsx', code);
console.log("Fixed print styles for RH payslip");
