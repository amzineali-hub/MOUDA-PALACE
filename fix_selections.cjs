const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// Add the state variable
code = code.replace(/const \[productSearch, setProductSearch\] = useState\(''\);/, 
  'const [productSearch, setProductSearch] = useState(\'\');\n  const [orderSelections, setOrderSelections] = useState<Record<string, {checked: boolean, qty: string}>>({});');

// Modify the initialization on Create
code = code.replace(/onClick=\{\(\) => \{ setSelectedCommande\(null\); setProductSearch\(''\); setIsNewOrderModalOpen\(true\); \}\}/, 
  'onClick={() => { setSelectedCommande(null); setProductSearch(\'\'); setOrderSelections({}); setIsNewOrderModalOpen(true); }}');

// Modify the initialization on Edit
const initEditRegex = /onClick=\{\(\) => \{ setSelectedCommande\(cmd\); setProductSearch\(''\); setIsNewOrderModalOpen\(true\); \}\}/;
const initEditReplacement = `onClick={() => {
                            setSelectedCommande(cmd); 
                            setProductSearch(''); 
                            const initialSelections: Record<string, {checked: boolean, qty: string}> = {};
                            if (cmd.articles) {
                              cmd.articles.split(', ').forEach((a: string) => {
                                const parts = a.split(' - ');
                                const name = parts[0];
                                const qty = parts[1] || '';
                                const item = inventoryItems.find(i => i.name === name);
                                if (item) {
                                  initialSelections[item.id] = { checked: true, qty };
                                }
                              });
                            }
                            setOrderSelections(initialSelections);
                            setIsNewOrderModalOpen(true); 
                          }}`;
code = code.replace(initEditRegex, initEditReplacement);

// Modify the form submit to use orderSelections
const submitRegex = /\/\/ gather selected items[\s\S]*?const articles = selectedProducts\.join\(', '\);/;
const submitReplacement = `// gather selected items
              const selectedProducts: string[] = [];
              Object.entries(orderSelections).forEach(([itemId, selection]) => {
                if (selection.checked) {
                  const item = inventoryItems.find(i => i.id === itemId);
                  if (item) {
                    selectedProducts.push(\`\${item.name} - \${selection.qty || '1'}\`);
                  }
                }
              });

              if (selectedProducts.length === 0) {
                showToast("Veuillez sélectionner au moins un produit", "error");
                return;
              }

              const articles = selectedProducts.join(', ');`;
code = code.replace(submitRegex, submitReplacement);

// Modify the inputs in the list to be controlled by state
const itemMapRegex = /const isSelected = selectedCommande\?\.articles\?\.includes\(item\.name\);[\s\S]*?className="w-24 text-sm border border-gray-200 rounded-md p-1\.5 focus:outline-none focus:border-\[\#DDA956\]" \/>\s*<\/div>\s*\);\s*\n\s*\}\)/;

const itemMapReplacement = `const selection = orderSelections[item.id] || { checked: false, qty: '' };
                                return (
                                  <div key={item.id} className="p-3 hover:bg-white transition-colors flex items-center justify-between gap-3">
                                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                                      <input 
                                        type="checkbox" 
                                        checked={selection.checked} 
                                        onChange={(e) => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], checked: e.target.checked } }))}
                                        className="product-checkbox-new w-4 h-4 text-[#DDA956] rounded border-gray-300 focus:ring-[#DDA956]" 
                                      />
                                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                    </label>
                                    <input 
                                      type="text" 
                                      value={selection.qty}
                                      onChange={(e) => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], qty: e.target.value } }))}
                                      placeholder={\`Qté (\${item.unit || 'u'})\`} 
                                      className="w-24 text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:border-[#DDA956]" 
                                    />
                                  </div>
                                );
                              })`;
code = code.replace(itemMapRegex, itemMapReplacement);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
