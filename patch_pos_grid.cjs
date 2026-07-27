const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  'className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"',
  'className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"'
);

fs.writeFileSync('src/POSTactile.tsx', code);
