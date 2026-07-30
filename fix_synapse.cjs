const fs = require('fs');
let code = fs.readFileSync('src/SystemMonitoring.tsx', 'utf8');

code = code.replace(
  'className="bg-[#0A0A0A] backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/10 mb-8 overflow-hidden relative"',
  'className="bg-black/20 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/10 mb-6 overflow-hidden relative max-w-4xl mx-auto"'
);

code = code.replace(
  '<div className="w-full flex justify-center overflow-hidden"><div className="relative w-[500px] h-[360px] flex-shrink-0 [transform:scale(0.65)] sm:[transform:scale(0.8)] md:[transform:scale(1)] origin-center -my-16 sm:-my-8 md:my-0">',
  '<div className="w-full flex justify-center overflow-hidden"><div className="relative w-[500px] h-[360px] flex-shrink-0 [transform:scale(0.5)] sm:[transform:scale(0.65)] md:[transform:scale(0.75)] origin-center -my-24 sm:-my-16 md:-my-10">'
);

fs.writeFileSync('src/SystemMonitoring.tsx', code);
