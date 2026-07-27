const fs = require('fs');
let code = fs.readFileSync('src/Documentation.tsx', 'utf8');

// I need to add import for ModuleMockup if not there
if (!code.includes("import { ModuleMockup }")) {
  code = code.replace("import ReactMarkdown from 'react-markdown';", "import ReactMarkdown from 'react-markdown';\nimport { ModuleMockup } from './ModuleMockups';");
}

const targetStr = `                  h2: ({node, children, ...props}) => {
                    const text = String(children);
                    let colorClass = "text-purple-600";
                    let imageUrl = "";
                    
                    if (text.includes("1.")) { colorClass = "text-blue-600"; imageUrl = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80"; }
                    else if (text.includes("2.")) { colorClass = "text-emerald-600"; imageUrl = "https://images.unsplash.com/photo-1586528116311-ad8ed7444b2b?auto=format&fit=crop&w=400&q=80"; }
                    else if (text.includes("3.")) { colorClass = "text-amber-600"; imageUrl = "https://images.unsplash.com/photo-1556910103-1c02745a8050?auto=format&fit=crop&w=400&q=80"; }
                    else if (text.includes("4.")) { colorClass = "text-rose-600"; imageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80"; }
                    else if (text.includes("5.")) { colorClass = "text-cyan-600"; imageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80"; }
                    else if (text.includes("6.")) { colorClass = "text-fuchsia-600"; imageUrl = "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=400&q=80"; }
                    else if (text.includes("7.")) { colorClass = "text-orange-600"; imageUrl = "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=400&q=80"; }
                    else if (text.includes("8.")) { colorClass = "text-teal-600"; imageUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80"; }
                    
                    return (
                      <h2 className={\`text-2xl font-bold mt-10 mb-4 \${colorClass} flex items-center gap-2 relative group w-fit cursor-help\`} {...props}>
                        {children}
                        {imageUrl && (
                          <div className="absolute left-0 bottom-full mb-3 hidden group-hover:block z-50 transition-all duration-200">
                            <div className="bg-white p-2 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 w-64 h-auto transform -rotate-1">
                              <img src={imageUrl} alt={text} className="w-full h-36 object-cover rounded-lg shadow-sm" />
                              <p className="text-xs text-gray-500 mt-2 font-medium text-center">Capture d'écran du module</p>
                            </div>
                            <div className="absolute left-6 -bottom-2 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
                          </div>
                        )}
                      </h2>
                    );
                  },`;

const replaceStr = `                  h2: ({node, children, ...props}) => {
                    const text = String(children);
                    let colorClass = "text-purple-600";
                    let mockupType = "";
                    
                    if (text.includes("1.")) { colorClass = "text-blue-600"; mockupType = "achats"; }
                    else if (text.includes("2.")) { colorClass = "text-emerald-600"; mockupType = "inventaire"; }
                    else if (text.includes("3.")) { colorClass = "text-amber-600"; mockupType = "cuisine"; }
                    else if (text.includes("4.")) { colorClass = "text-rose-600"; mockupType = "recettes"; }
                    else if (text.includes("5.")) { colorClass = "text-cyan-600"; mockupType = "tables"; }
                    else if (text.includes("6.")) { colorClass = "text-fuchsia-600"; mockupType = "rh"; }
                    else if (text.includes("7.")) { colorClass = "text-orange-600"; mockupType = "pos"; }
                    else if (text.includes("8.")) { colorClass = "text-teal-600"; mockupType = "compta"; }
                    
                    return (
                      <h2 className={\`text-2xl font-bold mt-10 mb-4 \${colorClass} flex items-center gap-2 relative group w-fit cursor-help\`} {...props}>
                        {children}
                        {mockupType && (
                          <div className="absolute left-0 bottom-full mb-3 hidden group-hover:block z-50 transition-all duration-200" style={{pointerEvents: 'none'}}>
                            <div className="bg-white p-2 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 w-72 h-48 transform -rotate-1 flex flex-col">
                              <div className="flex-1 w-full h-full rounded-lg shadow-sm overflow-hidden">
                                <ModuleMockup type={mockupType} />
                              </div>
                              <p className="text-[10px] text-gray-500 mt-2 font-medium text-center uppercase tracking-wider">Aperçu direct du module réel</p>
                            </div>
                            <div className="absolute left-6 -bottom-2 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
                          </div>
                        )}
                      </h2>
                    );
                  },`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/Documentation.tsx', code);
