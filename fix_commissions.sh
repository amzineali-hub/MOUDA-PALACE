cat << 'INNER_EOF' > /tmp/commissions.txt
          {activeTab === 'commissions' && (
            <div className="p-0">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-medium text-gray-900">Historique des Versements</h3>
                <button onClick={() => showToast('Génération du rapport...')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                  <Download size={16} /> Exporter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Partenaire</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Montant</th>
                      <th className="px-6 py-4">Méthode</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: 'Riad Aladina', date: '01 Juil 2026', amount: '1,200 MAD', method: 'Virement bancaire', status: 'Payé' },
                      { name: 'Voyage Maroc', date: '28 Juin 2026', amount: '4,500 MAD', method: 'Espèces', status: 'Payé' }
                    ].map((tx, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{tx.name}</td>
                        <td className="px-6 py-4 text-gray-600">{tx.date}</td>
                        <td className="px-6 py-4 font-medium text-[#DDA956]">{tx.amount}</td>
                        <td className="px-6 py-4 text-gray-600">{tx.method}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
INNER_EOF
sed -i -e '/{activeTab === '\''commissions'\'' && (/,/)}/c\
          {activeTab === '\''commissions'\'' && (\
            <div className="p-0">\
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">\
                <h3 className="font-medium text-gray-900">Historique des Versements</h3>\
                <button onClick={() => showToast('\''Génération du rapport...\'')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">\
                  <Download size={16} /> Exporter\
                </button>\
              </div>\
              <div className="overflow-x-auto">\
                <table className="w-full text-left text-sm whitespace-nowrap">\
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">\
                    <tr>\
                      <th className="px-6 py-4">Partenaire</th>\
                      <th className="px-6 py-4">Date</th>\
                      <th className="px-6 py-4">Montant</th>\
                      <th className="px-6 py-4">Méthode</th>\
                      <th className="px-6 py-4">Statut</th>\
                    </tr>\
                  </thead>\
                  <tbody className="divide-y divide-gray-100">\
                    {[\
                      { name: '\''Riad Aladina'\'', date: '\''01 Juil 2026'\'', amount: '\''1,200 MAD'\'', method: '\''Virement bancaire'\'', status: '\''Payé'\'' },\
                      { name: '\''Voyage Maroc'\'', date: '\''28 Juin 2026'\'', amount: '\''4,500 MAD'\'', method: '\''Espèces'\'', status: '\''Payé'\'' }\
                    ].map((tx, idx) => (\
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">\
                        <td className="px-6 py-4 font-medium text-gray-900">{tx.name}</td>\
                        <td className="px-6 py-4 text-gray-600">{tx.date}</td>\
                        <td className="px-6 py-4 font-medium text-[#DDA956]">{tx.amount}</td>\
                        <td className="px-6 py-4 text-gray-600">{tx.method}</td>\
                        <td className="px-6 py-4">\
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">\
                            {tx.status}\
                          </span>\
                        </td>\
                      </tr>\
                    ))}\
                  </tbody>\
                </table>\
              </div>\
            </div>\
          )}' src/App.tsx
