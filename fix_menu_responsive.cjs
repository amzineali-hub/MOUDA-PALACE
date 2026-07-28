const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

// Modern model image
const modernTarget = `<div className="w-48 h-48 shrink-0 rounded-full overflow-hidden border-2 border-[#DDA956]/30 shadow-sm print:border-gray-200">`;
const modernReplace = `<div className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 shrink-0 rounded-full overflow-hidden border-2 border-[#DDA956]/30 shadow-sm print:border-gray-200">`;
code = code.replace(modernTarget, modernReplace);

// Modern model layout
const modernLayoutTarget = `<div key={item.id} className="flex gap-5 break-inside-avoid">`;
const modernLayoutReplace = `<div key={item.id} className="flex gap-3 sm:gap-5 break-inside-avoid items-center sm:items-start">`;
code = code.replace(modernLayoutTarget, modernLayoutReplace);

// Traditional model image
const tradTarget = `<div className="w-48 h-48 md:w-56 md:h-56 shrink-0 relative group">`;
const tradReplace = `<div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 shrink-0 relative group">`;
code = code.replace(tradTarget, tradReplace);

// Traditional model layout
const tradLayoutTarget = `<div key={item.id} className="flex gap-4 md:gap-6 items-center break-inside-avoid">`;
const tradLayoutReplace = `<div key={item.id} className="flex flex-col-reverse sm:flex-row gap-4 md:gap-6 items-center sm:items-center break-inside-avoid">`;
code = code.replace(tradLayoutTarget, tradLayoutReplace);

fs.writeFileSync('src/MenuGenerator.tsx', code);
console.log("Updated MenuGenerator to be responsive");
