const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  'overflow-hidden lg:overflow-hidden overflow-y-auto',
  'overflow-y-auto lg:overflow-hidden'
);

fs.writeFileSync('src/POSTactile.tsx', code);
