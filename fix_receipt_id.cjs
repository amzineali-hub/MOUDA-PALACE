const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const targetId = `<td className="px-6 py-4 font-mono text-gray-900">{receipt.id}</td>`;
const replacementId = `<td className="px-6 py-4 font-mono text-gray-900">{receipt.displayId || 'TKT-' + receipt.id.substring(0, 6).toUpperCase()}</td>`;

if (code.includes(targetId)) {
  code = code.replace(targetId, replacementId);
  fs.writeFileSync('src/Accounting.tsx', code);
  console.log("Fixed receipt ID display");
} else {
  console.log("Could not find target ID");
}
