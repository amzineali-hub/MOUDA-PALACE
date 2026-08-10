const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /\['stocks', 'production_orders', 'semi_finished', 'waste', 'transactions'\]/g,
  "['stocks', 'production_orders', 'semi_finished', 'transactions', 'waste']"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Replaced successfully.');
