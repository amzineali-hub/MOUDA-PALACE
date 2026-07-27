const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  '${selectedTable === \\`Table ${tableNum}\\` ?',
  '${selectedTable === `Table ${tableNum}` ?'
);

fs.writeFileSync('src/POSTactile.tsx', code);
