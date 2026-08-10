const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const suppliersRegex = /\{activeTab === 'suppliers' && \([\s\S]*?Aucun fournisseur enregistré\.<\/p>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;
code = code.replace(suppliersRegex, '');

const historyRegex = /\{activeTab === 'price_history' && \([\s\S]*?<\/table>\s*<\/div>\s*<\/div>\s*\)\}/;
code = code.replace(historyRegex, '');

fs.writeFileSync('src/App.tsx', code);
