const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /style=\{\{ backgroundImage: "url\('\/img1-3.png'\)" \}\}/g,
  'style={{ backgroundImage: "url(\'/img1-1.png\')" }}'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Replaced successfully.');
