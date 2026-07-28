const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    '<div className={`min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative ${isFullScreenView ? "overflow-hidden" : ""}`}>',
    '<div className={`min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative print:block print:min-h-0 print:h-auto ${isFullScreenView ? "overflow-hidden print:overflow-visible" : ""}`}>'
);

code = code.replace(
    '<main className={`flex-1 min-w-0 relative bg-[#FDFBF7] ${isFullScreenView ? "h-screen overflow-hidden" : "min-h-screen"}`}>',
    '<main className={`flex-1 min-w-0 relative bg-[#FDFBF7] print:block print:h-auto print:min-h-0 print:overflow-visible ${isFullScreenView ? "h-screen overflow-hidden print:h-auto print:overflow-visible" : "min-h-screen print:min-h-0"}`}>'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed layout");
