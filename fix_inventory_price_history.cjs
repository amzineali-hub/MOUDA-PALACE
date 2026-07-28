const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetHistory = `          )}
        </div>
      </div>

      {/* Scanner Modal */}`;

const replaceHistory = `          )}
          
          {activeTab === 'price_history' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Historique des prix d'achat</h3>
                <p className="text-sm text-gray-500">Suivez l'évolution des coûts par fournisseur au fil du temps pour optimiser vos achats.</p>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={recentTransactions.filter(tx => tx.type === 'in' && tx.unitPrice).map(tx => ({
                        date: tx.date,
                        prix: tx.unitPrice,
                        fournisseur: tx.supplier || 'Inconnu',
                        produit: tx.item || tx.itemName || 'Produit'
                      })).reverse()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(val) => \`\${val} MAD\`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name, props) => [\`\${value} MAD\`, \`\${props.payload.produit} (\${props.payload.fournisseur})\`]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="prix" 
                        stroke="#DDA956" 
                        strokeWidth={2}
                        fill="#DDA956" 
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Produit</th>
                      <th className="px-6 py-4">Fournisseur</th>
                      <th className="px-6 py-4 text-right">Quantité</th>
                      <th className="px-6 py-4 text-right">Prix Unitaire</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentTransactions.filter(tx => tx.type === 'in').length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          Aucun achat enregistré.
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.filter(tx => tx.type === 'in').map((tx, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{tx.item || tx.itemName}</td>
                          <td className="px-6 py-4 text-gray-900">{tx.supplier || <span className="text-gray-400 italic">Non spécifié</span>}</td>
                          <td className="px-6 py-4 text-right">{tx.amount || tx.quantity} {tx.unit}</td>
                          <td className="px-6 py-4 text-right font-medium">
                            {tx.unitPrice ? \`\${tx.unitPrice.toFixed(2)} MAD\` : <span className="text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-[#DDA956]">
                            {tx.unitPrice ? \`\${(tx.unitPrice * (tx.amount || tx.quantity)).toFixed(2)} MAD\` : <span className="text-gray-400 italic">-</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scanner Modal */}`;

if (code.includes(targetHistory)) {
  code = code.replace(targetHistory, replaceHistory);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated inventory price history rendering");
} else {
  console.log("Could not find price history injection target");
}
