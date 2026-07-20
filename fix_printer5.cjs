const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const lines = content.split('\n');
const newLines = lines.filter((line, index) => {
  if (line.trim() === 'Printer,') {
    return false;
  }
  return true;
});

// Now just put one 'Printer,' after 'Filter,'
const insertIndex = newLines.findIndex(line => line.trim() === 'Filter,');
if (insertIndex !== -1) {
  newLines.splice(insertIndex + 1, 0, '  Printer,');
}

fs.writeFileSync('src/App.tsx', newLines.join('\n'));
