const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/url\(\/mouda-1-1\.png\)/g, "url(/mouda-1-1-1.png)");

fs.writeFileSync('src/App.tsx', code);
console.log('Replaced successfully.');
