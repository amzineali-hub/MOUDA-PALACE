const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const targetSearch = `placeholder={activeTab === 'invoices' ? "Rechercher une facture..." : "Rechercher une dépense..."}`;
const replacementSearch = `placeholder={activeTab === 'invoices' ? "Rechercher une facture..." : activeTab === 'receipts' ? "Rechercher un encaissement..." : "Rechercher une dépense..."}`;

if (code.includes(targetSearch)) {
  code = code.replace(targetSearch, replacementSearch);
  fs.writeFileSync('src/Accounting.tsx', code);
  console.log("Fixed accounting search placeholder");
} else {
  console.log("Could not find target search placeholder");
}
