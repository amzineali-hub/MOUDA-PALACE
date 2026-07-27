const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  `min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)]`,
  `min-h-screen lg:h-screen`
);

fs.writeFileSync('src/POSTactile.tsx', code);
