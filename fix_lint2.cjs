const fs = require('fs');

// Fix server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace('fetch(docUrl);', 'fetch(docUrl as string);');
fs.writeFileSync('server.ts', serverCode);
