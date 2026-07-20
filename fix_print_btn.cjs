const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `onClick={() => showToast("Impression en cours...")}`;
const replacement = `onClick={() => window.print()}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
