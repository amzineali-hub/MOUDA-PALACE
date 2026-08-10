const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /\['stocks', 'production_orders', 'semi_finished', 'production', 'waste', 'transactions', 'suppliers', 'price_history'\]/g,
  "['stocks', 'production_orders', 'semi_finished', 'waste', 'transactions']"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Replaced successfully.');
