const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const stateRegex = /const \[productSearch, setProductSearch\] = useState\(''\);/;
code = code.replace(stateRegex, 'const [productSearch, setProductSearch] = useState(\'\');\n  const [showSupplierCol, setShowSupplierCol] = useState(true);\n  const [showCategoryCol, setShowCategoryCol] = useState(true);');

// The whole Articles à commander div replacement:
const sectionRegex = /(<div>\s*<div className="flex justify-between items-end mb-2 gap-4">)([\s\S]*?)(<\/button>\s*<\/form>\s*<\/div>\s*<\/div>\s*\)\})/;

const newSection = `<div>
                <div className="flex justify-between items-end mb-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 pb-2">Articles à commander</label>
                    <div className="flex items-center gap-3 text-sm">
                      <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                        <input type="checkbox" checked={showSupplierCol} onChange={e => setShowSupplierCol(e.target.checked)} className="w-3.5 h-3.5 text-[#DDA956] rounded border-gray-300 focus:ring-[#DDA956]" />
                        Fournisseur
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                        <input type="checkbox" checked={showCategoryCol} onChange={e => setShowCategoryCol(e.target.checked)} className="w-3.5 h-3.5 text-[#DDA956] rounded border-gray-300 focus:ring-[#DDA956]" />
                        Catégorie
                      </label>
                    </div>
                  </div>
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher (produit, catégorie, fournisseur)..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                    />
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto bg-white">
                  {(() => {
                    const searchLower = productSearch.toLowerCase();
                    const filteredItems = inventoryItems.filter(item => {
                      const matchName = (item.name || '').toLowerCase().includes(searchLower);
                      const matchCat = (item.category || '').toLowerCase().includes(searchLower);
                      const matchSup = (item.supplier || '').toLowerCase().includes(searchLower);
                      
                      const initials = (item.name || '').split(' ').map((w: string) => w[0]).join('').toLowerCase();
                      const matchInitials = initials.includes(searchLower);
                      
                      return matchName || matchCat || matchSup || matchInitials;
                    });

                    if (filteredItems.length === 0) {
                      return <div className="p-4 text-sm text-gray-500 text-center">Aucun produit trouvé</div>;
                    }

                    return (
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 font-medium w-10 text-center">
                              <ShoppingCart size={14} className="mx-auto text-gray-400" />
                            </th>
                            <th className="px-3 py-2 font-medium">Produit</th>
                            {showCategoryCol && <th className="px-3 py-2 font-medium">Catégorie</th>}
                            {showSupplierCol && <th className="px-3 py-2 font-medium">Fournisseur</th>}
                            <th className="px-3 py-2 font-medium w-28 text-right">Quantité</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredItems.sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(item => {
                            const selection = orderSelections[item.id] || { checked: false, qty: '' };
                            return (
                              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-3 py-2 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={selection.checked} 
                                    onChange={(e) => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], checked: e.target.checked } }))}
                                    className="w-4 h-4 text-[#DDA956] rounded border-gray-300 focus:ring-[#DDA956]" 
                                  />
                                </td>
                                <td className="px-3 py-2 font-medium text-gray-900 cursor-pointer" onClick={() => setOrderSelections(prev => ({ ...prev, [item.id]: { ...prev[item.id], checked: !(prev[item.id]?.checked) } }))}>
                                  {item.name}
                                </td>
                                {showCategoryCol && (
                                  <td className="px-3 py-2 text-gray-500 text-xs">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{item.category || 'Général'}</span>
                                  </td>
                                )}
                                {showSupplierCol && (
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
                                    className="w-full max-w-[80px] text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:border-[#DDA956] text-right" 
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Générer Bon de Commande
              </button>
            </form>
          </div>
        </div>
      )}`;

code = code.replace(sectionRegex, newSection);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
