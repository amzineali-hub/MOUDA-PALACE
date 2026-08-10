const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<motion\.div[\s\S]*?onClick=\{\(\) => setActiveTab\('suppliers'\)\}[\s\S]*?<\/motion\.div>/g, '');
code = code.replace(/'transactions', 'suppliers'/g, "'transactions'");
code = code.replace(/\{tab === 'suppliers' && 'Fournisseurs'\}/g, '');

const regex = /\{activeTab === 'suppliers' && \([\s\S]*?Aucun fournisseur enregistré\.<\/p>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;
code = code.replace(regex, '');

fs.writeFileSync('src/App.tsx', code);
