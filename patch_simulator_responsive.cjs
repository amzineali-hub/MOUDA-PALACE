const fs = require('fs');
let code = fs.readFileSync('src/DeviceSimulator.tsx', 'utf8');

code = code.replace(
  `text-5xl tracking-[0.5em]`,
  `text-4xl md:text-5xl tracking-[0.2em] md:tracking-[0.5em]`
);

fs.writeFileSync('src/DeviceSimulator.tsx', code);
