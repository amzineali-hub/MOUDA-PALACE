const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

const targetPrintOld = `                            \${selectedProducts.map(p => {
                              const parts = p.split(' - ');
                              return \`<tr><td>\${parts[0]}</td><td>\${parts[1] || ''}</td></tr>\`;
                            }).join('')}`;
const targetPrintNew = `                            \${selectedProducts.map(p => {
                              return \`<tr><td>\${p.name}</td><td>\${p.quantity} \${p.unit || ''}</td></tr>\`;
                            }).join('')}`;

content = content.replace(targetPrintOld, targetPrintNew);
fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log('Fixed print mapping');
