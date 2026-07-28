const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const targetAddDoc = `      await addDoc(collection(db, 'cash_receipts'), {
        amount: total,`;
const replacementAddDoc = `      const displayId = 'TKT-' + Date.now().toString().slice(-6);
      await addDoc(collection(db, 'cash_receipts'), {
        displayId,
        amount: total,`;

if (code.includes(targetAddDoc)) {
  code = code.replace(targetAddDoc, replacementAddDoc);
  fs.writeFileSync('src/POSTactile.tsx', code);
  console.log("Fixed POS display ID generation");
} else {
  console.log("Could not find target addDoc in POS");
}
