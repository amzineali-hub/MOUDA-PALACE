const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const targetTabs = `            {['invoices', 'expenses', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative \${activeTab === tab ? 'text-[#DDA956]' : 'text-gray-500 hover:text-gray-900'}\`}
              >
                {tab === 'invoices' && 'Factures Clients'}
                {tab === 'expenses' && 'Dépenses & Achats'}
                {tab === 'reports' && 'Rapports Financiers'}`;

const replacementTabs = `            {['invoices', 'receipts', 'expenses', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative \${activeTab === tab ? 'text-[#DDA956]' : 'text-gray-500 hover:text-gray-900'}\`}
              >
                {tab === 'invoices' && 'Factures Clients'}
                {tab === 'receipts' && 'Recettes Caisses'}
                {tab === 'expenses' && 'Dépenses & Achats'}
                {tab === 'reports' && 'Rapports Financiers'}`;

if (code.includes(targetTabs)) {
  code = code.replace(targetTabs, replacementTabs);
  fs.writeFileSync('src/Accounting.tsx', code);
  console.log("Injected receipts tab");
} else {
  console.log("Could not find target tabs");
}
