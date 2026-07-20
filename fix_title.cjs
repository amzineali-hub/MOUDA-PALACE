const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<div className="bg-green-600 text-white font-bold text-center py-1 text-lg">MAROC COMPTA</div>',
  '<div className="bg-amber-600 text-white font-bold text-center py-1 text-lg">MOUDA PALACE</div>'
);
content = content.replace(
  '<div className="bg-[#b5d333] text-center font-bold text-black py-1 col-span-1">MAROC</div>',
  '<div className="bg-amber-100 text-center font-bold text-black py-1 col-span-1">MAROC</div>'
);

fs.writeFileSync('src/App.tsx', content);
