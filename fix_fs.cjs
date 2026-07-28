const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  'className="fixed bottom-4 right-4 bg-[#1A1A1A] text-white p-3 rounded-full shadow-lg hover:bg-black transition-colors z-50 print:hidden flex items-center gap-2 pr-4"',
  'className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white p-3 rounded-full shadow-lg hover:bg-black transition-colors z-50 print:hidden flex items-center gap-2 px-6"'
);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated fullscreen button");
