const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

let inSuppliers = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("activeTab === 'suppliers'")) {
    inSuppliers = true;
    console.log("Found at line: ", i + 1);
  }
  if (inSuppliers && lines[i].includes("      {/* Add Modal */}")) {
    console.log("Add modal found at line: ", i + 1);
  }
}
