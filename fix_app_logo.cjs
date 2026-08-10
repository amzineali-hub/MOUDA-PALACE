const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `<div className="w-20 h-20 bg-[#F4C75B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
             <Database size={40} className="text-[#265C6D]" />
          </div>`;
          
const replace = `<img src="/mouda-1.png" className="w-28 mx-auto mb-4 drop-shadow-xl" alt="Mouda Palace Logo" />`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
