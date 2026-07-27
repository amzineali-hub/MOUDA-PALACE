const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  '<div className="flex-1 flex overflow-hidden">',
  '<div className="flex-1 flex flex-col lg:flex-row overflow-hidden lg:overflow-hidden overflow-y-auto">'
);

code = code.replace(
  '<div className="flex-1 flex flex-col">',
  '<div className="flex-1 flex flex-col min-h-[60vh] lg:min-h-0">'
);

code = code.replace(
  '<div className="w-[400px] bg-white flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-20 m-4 rounded-3xl overflow-hidden border border-gray-100">',
  '<div className="w-full lg:w-[400px] bg-white flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-20 lg:m-4 mt-4 lg:mt-4 rounded-t-3xl lg:rounded-3xl overflow-hidden border border-gray-100 flex-shrink-0 min-h-[500px] lg:min-h-0">'
);

code = code.replace(
  '<div className="flex items-center justify-between">',
  '<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">'
);

code = code.replace(
  '<div className="relative w-72">',
  '<div className="relative w-full md:w-72">'
);

fs.writeFileSync('src/POSTactile.tsx', code);
