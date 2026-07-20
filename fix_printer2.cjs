const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// I inserted a literal backslash n previously... let's clean it up.
content = content.replace(/\\n/g, '\n');
fs.writeFileSync('src/App.tsx', content);
