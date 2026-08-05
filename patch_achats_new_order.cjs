const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

const targetHeaderOld = `                            {showSupplierCol && <th className="px-3 py-2 font-medium">Fournisseur</th>}
                            <th className="px-3 py-2 font-medium w-28 text-right">Quantité</th>
                          </tr>`;
const targetHeaderNew = `                            {showSupplierCol && <th className="px-3 py-2 font-medium">Fournisseur</th>}
                            <th className="px-3 py-2 font-medium w-24 text-right">Prix U.</th>
                            <th className="px-3 py-2 font-medium w-24 text-right">Quantité</th>
                          </tr>`;

content = content.replace(targetHeaderOld, targetHeaderNew);

const targetRowOld = `                                {showSupplierCol && (
                                  <td className="px-3 py-2 text-gray-500 text-xs">
                                    {item.supplier || 'Sans fournisseur'}
                                  </td>
                                )}
                                <td className="px-3 py-2 text-right">
                                  <input 
                                    type="text" 
                                    value={selection.qty}
                                    onChange={(e) => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], qty: e.target.value } }))}
                                    placeholder={\`Qté (\${item.unit || 'u'})\`} 
                                    className="w-full max-w-[80px] text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:border-[#F4C75B] text-right" 
                                  />
                                </td>
                              </tr>`;
const targetRowNew = `                                {showSupplierCol && (
                                  <td className="px-3 py-2 text-gray-500 text-xs">
                                    {item.supplier || 'Sans fournisseur'}
                                  </td>
                                )}
                                <td className="px-3 py-2 text-right">
                                  <input 
                                    type="number" step="0.01" min="0"
                                    value={selection.price !== undefined ? selection.price : (item.unitPrice || '')}
                                    onChange={(e) => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], price: e.target.value, checked: prev[item.id]?.checked || e.target.value !== '' } }))}
                                    placeholder="0.00" 
                                    className="w-full max-w-[80px] text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:border-[#F4C75B] text-right" 
                                  />
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <input 
                                    type="text" 
                                    value={selection.qty}
                                    onChange={(e) => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], qty: e.target.value, checked: prev[item.id]?.checked || e.target.value !== '' } }))}
                                    placeholder={\`Qté (\${item.unit || 'u'})\`} 
                                    className="w-full max-w-[80px] text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:border-[#F4C75B] text-right" 
                                  />
                                </td>
                              </tr>`;

content = content.replace(targetRowOld, targetRowNew);

const targetSaveOld = `              const selectedProducts: string[] = [];
              Object.entries(orderSelections).forEach(([itemId, selection]) => {
                if (selection.checked) {
                  const item = inventoryItems.find(i => i.id === itemId);
                  if (item) {
                    selectedProducts.push(\`\${item.name} - \${selection.qty || '1'}\`);
                  }
                }
              });`;
const targetSaveNew = `              const selectedProducts: any[] = [];
              let computedTotal = 0;
              Object.entries(orderSelections).forEach(([itemId, selection]) => {
                if (selection.checked) {
                  const item = inventoryItems.find(i => i.id === itemId);
                  if (item) {
                    const price = parseFloat(selection.price || item.unitPrice || '0');
                    const qty = parseFloat(selection.qty || '1');
                    computedTotal += (price * qty);
                    selectedProducts.push({
                      id: item.id,
                      name: item.name,
                      quantity: qty,
                      quantityOrdered: qty,
                      expectedPrice: price,
                      unit: item.unit
                    });
                  }
                }
              });`;

content = content.replace(targetSaveOld, targetSaveNew);

const targetCmdOld = `                  montant: selectedCommande ? selectedCommande.montant : '0 MAD',
                  status: selectedCommande ? selectedCommande.status : 'En attente',
                  items: selectedProducts.length,
                  articles,
                  categorie,`;
const targetCmdNew = `                  montant: selectedCommande ? selectedCommande.montant : \`\${computedTotal.toFixed(2)} MAD\`,
                  status: selectedCommande ? selectedCommande.status : 'En attente',
                  items: selectedProducts,
                  articles: selectedProducts.map(p => \`\${p.name} - \${p.quantity}\`).join(', '),
                  categorie,`;

content = content.replace(targetCmdOld, targetCmdNew);

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log('Fixed order selections and saving');
