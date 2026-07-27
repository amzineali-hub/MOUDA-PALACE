const fs = require('fs');
let code = fs.readFileSync('src/Documentation.tsx', 'utf8');

const targetStr = `<ReactMarkdown>{activeGuide.content}</ReactMarkdown>`;

const replaceStr = `<ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl font-black text-indigo-700 mb-6 pb-2 border-b-2 border-indigo-100" {...props} />,
                  h2: ({node, children, ...props}) => {
                    // Extract text to determine color based on content (or just random/cycled)
                    const text = String(children);
                    let colorClass = "text-purple-600";
                    if (text.includes("1.")) colorClass = "text-blue-600";
                    if (text.includes("2.")) colorClass = "text-emerald-600";
                    if (text.includes("3.")) colorClass = "text-amber-600";
                    if (text.includes("4.")) colorClass = "text-rose-600";
                    if (text.includes("5.")) colorClass = "text-cyan-600";
                    if (text.includes("6.")) colorClass = "text-fuchsia-600";
                    if (text.includes("7.")) colorClass = "text-orange-600";
                    if (text.includes("8.")) colorClass = "text-teal-600";
                    
                    return <h2 className={\`text-2xl font-bold mt-10 mb-4 \${colorClass} flex items-center gap-2\`} {...props}>{children}</h2>;
                  },
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4 text-lg" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700 text-lg marker:text-indigo-400" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-gray-900 bg-indigo-50 px-1 rounded" {...props} />,
                  a: ({node, ...props}) => <a className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 underline-offset-2" {...props} />
                }}
              >
                {activeGuide.content}
              </ReactMarkdown>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/Documentation.tsx', code);
