const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');
code = code.replace(/<Trash2 size=\{16\} \/>\n                        <\/button>\n                        <\/button>/g, '<Trash2 size={16} />\n                        </button>');
fs.writeFileSync('src/Accounting.tsx', code);
