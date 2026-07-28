const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const targetExport = `    } else if (activeTab === 'expenses') {
      csvContent += "ID,Categorie,Beneficiaire,Date,Methode,Montant\\n";
      expenses.forEach(exp => {
        csvContent += \`\${exp.id},\${exp.category},\${exp.supplier},\${exp.date},\${exp.method},\${exp.amount.replace(/ /g, '')}\\n\`;
      });
    } else {
      showToast("Rien à exporter pour cette section");`;

const replacementExport = `    } else if (activeTab === 'expenses') {
      csvContent += "ID,Categorie,Beneficiaire,Date,Methode,Montant\\n";
      expenses.forEach(exp => {
        csvContent += \`\${exp.id},\${exp.category},\${exp.supplier},\${exp.date},\${exp.method},\${exp.amount.replace(/ /g, '')}\\n\`;
      });
    } else if (activeTab === 'receipts') {
      csvContent += "ID,Date,Methode,Montant\\n";
      receipts.forEach(rec => {
        csvContent += \`\${rec.id},\${rec.date},\${rec.method},\${rec.amount}\\n\`;
      });
    } else {
      showToast("Rien à exporter pour cette section");`;

if (code.includes(targetExport)) {
  code = code.replace(targetExport, replacementExport);
  fs.writeFileSync('src/Accounting.tsx', code);
  console.log("Injected receipts export");
} else {
  console.log("Could not find target export");
}
