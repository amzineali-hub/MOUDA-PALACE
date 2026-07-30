const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const regex = /(<div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100 bg-gray-50\/50">)([\s\S]*?)(<\/div>\s*<\/div>\s*<button)/;

const newContent = `$1
                  {(() => {
                    if (inventoryItems.length === 0) {
                      return <div className="p-4 text-sm text-gray-500 text-center">Aucun produit dans l'inventaire</div>;
                    }
                    
                    const grouped = inventoryItems.reduce((acc, item) => {
                      const sup = item.supplier || 'Sans fournisseur';
                      const cat = item.category || 'Général';
                      if (!acc[sup]) acc[sup] = {};
                      if (!acc[sup][cat]) acc[sup][cat] = [];
                      acc[sup][cat].push(item);
                      return acc;
                    }, {} as Record<string, Record<string, typeof inventoryItems>>);
                    
                    return Object.keys(grouped).sort().map(supplier => (
                      <div key={supplier} className="border-b border-gray-200 last:border-0">
                        <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider sticky top-0 z-10">
                          {supplier}
                        </div>
                        {Object.keys(grouped[supplier]).sort().map(category => (
                          <div key={category}>
                            <div className="bg-gray-50 px-3 py-1.5 text-xs font-semibold text-[#DDA956] border-y border-gray-100">
                              {category}
                            </div>
                            <div className="divide-y divide-gray-50">
                              {grouped[supplier][category].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(item => {
                                const isSelected = selectedCommande?.articles?.includes(item.name);
                                let qty = '';
                                if (isSelected && selectedCommande?.articles) {
                                   const parts = selectedCommande.articles.split(', ');
                                   const match = parts.find((p: string) => p.startsWith(item.name));
                                   if (match) {
                                     qty = match.split(' - ')[1] || '';
                                   }
                                }
                                return (
                                  <div key={item.id} className="p-3 hover:bg-white transition-colors flex items-center justify-between gap-3">
                                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                                      <input type="checkbox" defaultChecked={isSelected} value={item.id} data-name={item.name} className="product-checkbox-new w-4 h-4 text-[#DDA956] rounded border-gray-300 focus:ring-[#DDA956]" />
                                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                    </label>
                                    <input type="text" id={\`qty-new-\${item.id}\`} defaultValue={qty} placeholder={\`Qté (\${item.unit || 'u'})\`} className="w-24 text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:border-[#DDA956]" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                $3`;

code = code.replace(regex, newContent);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
