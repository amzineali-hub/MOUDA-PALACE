const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The replacement was: '  Filter,' -> '  Filter,\\n  Printer,'
// But Printer was already imported probably. Let's look at the imports.
// I will just remove the first Printer.

// Let's do a smarter replace.
content = content.replace(/  Printer,\\n/g, ''); // remove all Printers
content = content.replace('  Filter,', '  Filter,\\n  Printer,'); // add one back
fs.writeFileSync('src/App.tsx', content);
