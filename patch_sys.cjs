const fs = require('fs');
let code = fs.readFileSync('src/SystemMonitoring.tsx', 'utf8');

code = code.replace(
  'className="flex items-center justify-between mb-8 relative z-10"',
  'className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10"'
);

code = code.replace(
  'className="relative w-full max-w-[500px] mx-auto h-[360px] flex items-center justify-center"',
  'className="relative w-full max-w-[500px] mx-auto h-[360px] flex items-center justify-center overflow-hidden md:overflow-visible scale-75 md:scale-100 origin-center"'
);

fs.writeFileSync('src/SystemMonitoring.tsx', code);
