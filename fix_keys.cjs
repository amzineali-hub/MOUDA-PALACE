const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

code = code.replace(
    '<tr key={cmd.orderNumber || cmd.id.slice(0,8).toUpperCase()} className="hover:bg-gray-50/50 transition-colors">',
    '<tr key={cmd.id} className="hover:bg-gray-50/50 transition-colors">'
);

code = code.replace(
    '{cmd.orderNumber || cmd.id.slice(0,8).toUpperCase()}',
    '{cmd.orderNumber || (cmd.id.startsWith("CMD-") ? cmd.id : "CMD-" + cmd.id.slice(0,4).toUpperCase())}'
);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
console.log("Fixed keys in AchatsFournisseurs");
