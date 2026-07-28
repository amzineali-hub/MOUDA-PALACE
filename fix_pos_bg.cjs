const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const target = `                        {/* 3D Inner Glow / Highlights */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none rounded-3xl" />
                        
                        {item.imageUrl && (
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

const replacement = `                        {/* Full Image Background if available */}
                        {item.imageUrl ? (
                          <>
                            <div className="absolute inset-0">
                              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 rounded-3xl" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none rounded-3xl" />
                        )}
                        
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          <span className={\`font-bold text-sm sm:text-lg leading-tight flex-1 drop-shadow-sm break-words line-clamp-3 \${item.imageUrl ? 'text-white' : priceColor}\`}>
                            {item.name}
                          </span>
                          <div className="mt-auto flex flex-wrap items-baseline">
                            <span className={\`font-black text-lg sm:text-2xl drop-shadow-md \${item.imageUrl ? 'text-white' : priceColor}\`}>
                              {item.numPrice}
                            </span>
                            <span className={\`font-bold text-[10px] sm:text-xs ml-1 \${item.imageUrl ? 'text-white/80' : textColor}\`}>MAD</span>
                          </div>
                        </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/POSTactile.tsx', code);
  console.log("Updated POS buttons to use full background images");
} else {
  console.log("Target not found");
}
