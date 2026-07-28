const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const target = `                        {item.imageUrl && (
                          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full overflow-hidden opacity-30 mix-blend-overlay">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        <span className={\`font-bold text-sm sm:text-lg leading-tight z-10 flex-1 \${priceColor} drop-shadow-sm break-words line-clamp-3\`}>{item.name}</span>
                        <div className="mt-auto flex flex-wrap items-baseline">
                          <span className={\`font-black text-lg sm:text-2xl z-10 \${priceColor} drop-shadow-md\`}>{item.numPrice}</span>
                          <span className={\`font-bold text-[10px] sm:text-xs ml-1 \${textColor}\`}>MAD</span>
                        </div>`;

const replacement = `                        {item.imageUrl && (
                          <div className="absolute -right-8 -bottom-8 w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-lg border-4 border-white/20">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        <div className="relative z-10 flex flex-col h-full w-[65%] justify-between">
                          <span className={\`font-bold text-sm sm:text-lg leading-tight flex-1 \${priceColor} drop-shadow-sm break-words line-clamp-3\`}>{item.name}</span>
                          <div className="mt-auto flex flex-wrap items-baseline">
                            <span className={\`font-black text-lg sm:text-2xl \${priceColor} drop-shadow-md\`}>{item.numPrice}</span>
                            <span className={\`font-bold text-[10px] sm:text-xs ml-1 \${textColor}\`}>MAD</span>
                          </div>
                        </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/POSTactile.tsx', code);
  console.log("Updated POS images");
} else {
  console.log("Target not found");
}
