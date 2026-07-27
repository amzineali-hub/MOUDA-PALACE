const fs = require('fs');
let code = fs.readFileSync('src/SystemMonitoring.tsx', 'utf8');

code = code.replace(
  '        })}\n      </div>',
  '        })}\n      </div>\n      </div>'
);

fs.writeFileSync('src/SystemMonitoring.tsx', code);
