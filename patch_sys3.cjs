const fs = require('fs');
let code = fs.readFileSync('src/SystemMonitoring.tsx', 'utf8');

code = code.replace(
  'className="relative w-full max-w-[500px] mx-auto aspect-[5/3.6] flex items-center justify-center"',
  'className="relative w-full max-w-[500px] mx-auto h-[360px] flex items-center justify-center [transform:scale(0.6)] sm:[transform:scale(0.8)] md:[transform:scale(1)] origin-top mb-[-120px] sm:mb-[-60px] md:mb-0"'
);

fs.writeFileSync('src/SystemMonitoring.tsx', code);
