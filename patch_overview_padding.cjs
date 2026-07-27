const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'className="relative z-10 p-8 md:p-12 pt-16 md:pt-20 print:hidden"',
  'className="relative z-10 p-4 md:p-12 pt-20 md:pt-20 print:hidden"'
);

fs.writeFileSync('src/App.tsx', code);
