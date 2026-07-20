const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace('  Filter,', '  Filter,\n  Printer,');
fs.writeFileSync('src/App.tsx', content);
