const fs = require('fs');
let code = fs.readFileSync('src/SystemMonitoring.tsx', 'utf8');

code = code.replace(
  'className="relative w-full max-w-[500px] mx-auto h-[360px] flex items-center justify-center overflow-hidden md:overflow-visible scale-75 md:scale-100 origin-center"',
  'className="relative w-full max-w-[500px] mx-auto aspect-[5/3.6] flex items-center justify-center"'
);

// We need to scale the HTML nodes since they are absolute positioned
// It's better to just use CSS transform to scale the whole container on small screens
// Actually, changing aspect-ratio doesn't scale absolute positioned div nodes unless they use % or we use transform.

fs.writeFileSync('src/SystemMonitoring.tsx', code);
