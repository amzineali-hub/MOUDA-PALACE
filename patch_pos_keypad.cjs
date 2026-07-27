const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">',
  '<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">'
);

code = code.replace(
  'className="relative overflow-hidden flex flex-col justify-center items-center h-40 rounded-3xl p-5 border-2 border-dashed border-gray-300 text-gray-400 hover:text-[#DDA956] hover:border-[#DDA956] hover:bg-[#DDA956]/5 transition-all"',
  'className="relative overflow-hidden flex flex-col justify-center items-center aspect-square rounded-2xl sm:rounded-3xl p-2 sm:p-4 border-2 border-dashed border-gray-300 text-gray-400 hover:text-[#DDA956] hover:border-[#DDA956] hover:bg-[#DDA956]/5 transition-all"'
);

code = code.replace(
  'className={`relative overflow-hidden flex flex-col h-40 rounded-3xl p-5 text-left bg-gradient-to-br ${colorClass} shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-4px_0_rgba(0,0,0,0.1)] transition-all`}',
  'className={`relative overflow-hidden flex flex-col justify-between aspect-square rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-left bg-gradient-to-br ${colorClass} shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-3px_0_rgba(0,0,0,0.1)] transition-all`}'
);

code = code.replace(
  '<span className={`font-bold text-xl leading-tight z-10 flex-1 ${priceColor} drop-shadow-sm`}>{item.name}</span>',
  '<span className={`font-bold text-sm sm:text-lg leading-tight z-10 flex-1 ${priceColor} drop-shadow-sm break-words line-clamp-3`}>{item.name}</span>'
);

code = code.replace(
  '<div className="mt-auto">\n                          <span className={`font-black text-2xl z-10 ${priceColor} drop-shadow-md`}>{item.numPrice}</span>\n                          <span className={`font-bold text-sm ml-1 ${textColor}`}>MAD</span>\n                        </div>',
  '<div className="mt-auto flex flex-wrap items-baseline">\n                          <span className={`font-black text-lg sm:text-2xl z-10 ${priceColor} drop-shadow-md`}>{item.numPrice}</span>\n                          <span className={`font-bold text-[10px] sm:text-xs ml-1 ${textColor}`}>MAD</span>\n                        </div>'
);

fs.writeFileSync('src/POSTactile.tsx', code);
