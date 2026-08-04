const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  'className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"',
  'className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"'
);

content = content.replace(
  '<div className="p-6 space-y-4">',
  '<div className="p-6 space-y-4 overflow-y-auto flex-1">'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched modal scroll");
