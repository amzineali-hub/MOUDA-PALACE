const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

code = code.replace(/<Eye size=\{16\} \/>\n                        <\/button>\n                        <\/button>/g, '<Eye size={16} />\n                        </button>');
code = code.replace(/<Eye size=\{16\} \/>\n                        <\/button>\n                          <\/button>/g, '<Eye size={16} />\n                          </button>');

fs.writeFileSync('src/Accounting.tsx', code);
