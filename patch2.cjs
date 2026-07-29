const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  '<label className="block text-sm font-medium text-gray-700 mb-1">Photo (Appareil photo)</label>',
  '<label className="block text-sm font-medium text-gray-700 mb-1">Photo (Appareil ou Galerie)</label>'
);

code = code.replace(
  '                  capture="environment"\n',
  ''
);

fs.writeFileSync('src/POSTactile.tsx', code);
