const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '      {!isFullScreenView && (\n      {!isFullScreenView && (\n      <aside',
  '      {!isFullScreenView && (\n      <aside'
);

fs.writeFileSync('src/App.tsx', code);
