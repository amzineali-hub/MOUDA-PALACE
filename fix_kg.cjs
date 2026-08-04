const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/<option value="kg">kg<\/option>/g, '<option value="kg">Kg</option>');
fs.writeFileSync('src/App.tsx', content);
console.log("Fixed all kg");
