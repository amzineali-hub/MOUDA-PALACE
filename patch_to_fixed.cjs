const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(/averageMargin\.toFixed\(/g, '(Number(averageMargin) || 0).toFixed(');
fs.writeFileSync('src/App.tsx', appCode);

// Patch RH.tsx
let rhCode = fs.readFileSync('src/RH.tsx', 'utf-8');
rhCode = rhCode.replace(/selectedPayslip\.base\?\.toFixed\(/g, '(Number(selectedPayslip.base) || 0).toFixed(');
rhCode = rhCode.replace(/selectedPayslip\.cnss\?\.toFixed\(/g, '(Number(selectedPayslip.cnss) || 0).toFixed(');
rhCode = rhCode.replace(/selectedPayslip\.amo\?\.toFixed\(/g, '(Number(selectedPayslip.amo) || 0).toFixed(');
rhCode = rhCode.replace(/selectedPayslip\.igr\?\.toFixed\(/g, '(Number(selectedPayslip.igr) || 0).toFixed(');
fs.writeFileSync('src/RH.tsx', rhCode);

// Patch Accounting.tsx
let accCode = fs.readFileSync('src/Accounting.tsx', 'utf-8');
accCode = accCode.replace(/receipt\.amount\.toFixed\(/g, 'Number(receipt.amount || 0).toFixed(');
accCode = accCode.replace(/selectedReceipt\.amount\.toFixed\(/g, 'Number(selectedReceipt.amount || 0).toFixed(');
fs.writeFileSync('src/Accounting.tsx', accCode);

// Patch FichesTechniques.tsx
let ftCode = fs.readFileSync('src/FichesTechniques.tsx', 'utf-8');
ftCode = ftCode.replace(/coutMatiere\.toFixed\(/g, 'Number(coutMatiere || 0).toFixed(');
ftCode = ftCode.replace(/foodCost\.toFixed\(/g, 'Number(foodCost || 0).toFixed(');
ftCode = ftCode.replace(/margeBrute\.toFixed\(/g, 'Number(margeBrute || 0).toFixed(');
ftCode = ftCode.replace(/currentCost\.toFixed\(/g, 'Number(currentCost || 0).toFixed(');
fs.writeFileSync('src/FichesTechniques.tsx', ftCode);

console.log('Fixed toFixed calls');
