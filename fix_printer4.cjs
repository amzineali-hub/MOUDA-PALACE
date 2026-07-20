const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '    csvContent += "ID Transaction,Heure,Opérateur,Type,Méthode,Montant\n";',
  '    csvContent += "ID Transaction,Heure,Opérateur,Type,Méthode,Montant\\n";'
);

content = content.replace(
  '      csvContent += `${tx.id},${tx.time},${tx.user},${tx.type},${tx.method},${amount}\n`;',
  '      csvContent += `${tx.id},${tx.time},${tx.user},${tx.type},${tx.method},${amount}\\n`;'
);

fs.writeFileSync('src/App.tsx', content);
