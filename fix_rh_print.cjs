const fs = require('fs');
let code = fs.readFileSync('src/RH.tsx', 'utf8');

code = code.replace(
    '<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">',
    '<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:bg-white print:backdrop-blur-none print:items-start print:p-0 print:absolute">'
);

fs.writeFileSync('src/RH.tsx', code);
console.log("Fixed RH print layout");
