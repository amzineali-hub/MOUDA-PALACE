const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `<img src="/mouda-1.png" className="w-28 mx-auto mb-4 drop-shadow-xl" alt="Mouda Palace Logo" />`;
const replace = `<img src="/mouda.png" className="w-32 mx-auto mb-4 drop-shadow-xl" alt="Mouda Palace Logo" onError={(e) => { e.currentTarget.src = '/mouda-1.png'; }} />`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
