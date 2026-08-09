const fs = require('fs');
let code = fs.readFileSync('src/RH.tsx', 'utf8');

const regex = /const moudaExists = data\.some.*?catch \(e\) \{ console\.error\(e\) \}\n\s*\}/s;
code = code.replace(regex, '');

fs.writeFileSync('src/RH.tsx', code);
