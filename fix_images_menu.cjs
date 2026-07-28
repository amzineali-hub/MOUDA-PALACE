const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

// First template
const target1 = `<div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-[#DDA956]/30 shadow-sm print:border-gray-200">`;
const replace1 = `<div className="w-48 h-48 shrink-0 rounded-full overflow-hidden border-2 border-[#DDA956]/30 shadow-sm print:border-gray-200">`;

const targetText1 = `<div className="flex-1 pt-1">`;
const replaceText1 = `<div className="flex-1 pt-1 text-left">`;

// Second template
const target2 = `<div className="w-24 h-24 md:w-28 md:h-28 shrink-0 relative group">`;
const replace2 = `<div className="w-48 h-48 md:w-56 md:h-56 shrink-0 relative group">`;

const targetText2 = `<div className="flex-1 flex flex-col">`;
const replaceText2 = `<div className="flex-1 flex flex-col text-left">`;

if (code.includes(target1)) code = code.replace(target1, replace1);
if (code.includes(targetText1)) code = code.replace(targetText1, replaceText1);
if (code.includes(target2)) code = code.replace(target2, replace2);
if (code.includes(targetText2)) code = code.replace(targetText2, replaceText2);

fs.writeFileSync('src/MenuGenerator.tsx', code);
console.log("Updated images sizes");
