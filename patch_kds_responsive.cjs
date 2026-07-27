const fs = require('fs');
let code = fs.readFileSync('src/EcranCuisine.tsx', 'utf8');

code = code.replace(
  '<div className="p-6 bg-gray-50 h-full overflow-hidden flex flex-col">',
  '<div className="p-4 md:p-6 bg-gray-50 h-full lg:overflow-hidden overflow-y-auto flex flex-col">'
);

code = code.replace(
  '<div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">',
  '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 lg:overflow-hidden">'
);

fs.writeFileSync('src/EcranCuisine.tsx', code);
