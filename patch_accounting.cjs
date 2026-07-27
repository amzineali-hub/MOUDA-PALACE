const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

// Replace tab links
const oldTabsMap = `{['invoices', 'expenses', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative \${activeTab === tab ? 'text-[#DDA956]' : 'text-gray-500 hover:text-gray-900'}\`}
              >
                {tab === 'invoices' && 'Factures Clients'}
                {tab === 'expenses' && 'Dépenses & Achats'}
                {tab === 'reports' && 'Rapports & Synthèse'}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabIndicatorAccounting"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DDA956]"
                  />
                )}
              </button>
            ))}`;

const newTabsMap = `{['invoices', 'expenses', 'tva', 'journal', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative \${activeTab === tab ? 'text-[#DDA956]' : 'text-gray-300 hover:text-white'}\`}
              >
                {tab === 'invoices' && 'Factures Clients'}
                {tab === 'expenses' && 'Dépenses & Charges'}
                {tab === 'tva' && 'Déclaration TVA'}
                {tab === 'journal' && 'Journal Comptable'}
                {tab === 'reports' && 'Bilan & Synthèse'}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabIndicatorAccounting"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DDA956]"
                  />
                )}
              </button>
            ))}`;
code = code.replace(oldTabsMap, newTabsMap);


const newSections = `
        {/* Déclaration TVA */}
        {activeTab === 'tva' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Déclaration TVA (Période en cours)</h2>
              <button className="bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium">Générer la déclaration</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-2">TVA Collectée (Ventes)</p>
                <p className="text-2xl font-bold text-gray-900">45 230.50 MAD</p>
                <p className="text-xs text-green-600 mt-2">+12% vs mois précédent</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-2">TVA Déductible (Achats)</p>
                <p className="text-2xl font-bold text-gray-900">18 450.00 MAD</p>
                <p className="text-xs text-red-600 mt-2">+5% vs mois précédent</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <p className="text-sm text-indigo-700 font-medium mb-2">TVA à décaisser (Due)</p>
                <p className="text-2xl font-bold text-indigo-900">26 780.50 MAD</p>
                <p className="text-xs text-indigo-600 mt-2">À payer avant le 20 du mois</p>
              </div>
            </div>
            
            <h3 className="font-medium text-gray-900 mb-4">Détails des opérations taxables</h3>
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Période</th>
                    <th className="px-6 py-4 text-right">CA HT</th>
                    <th className="px-6 py-4 text-right">TVA 20%</th>
                    <th className="px-6 py-4 text-right">TVA 10%</th>
                    <th className="px-6 py-4 text-right">TVA Déductible</th>
                    <th className="px-6 py-4 text-right">TVA Nette</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">Juin 2026</td>
                    <td className="px-6 py-4 text-right">226 152.00 MAD</td>
                    <td className="px-6 py-4 text-right">45 230.40 MAD</td>
                    <td className="px-6 py-4 text-right">0.00 MAD</td>
                    <td className="px-6 py-4 text-right">18 450.00 MAD</td>
                    <td className="px-6 py-4 text-right font-medium text-indigo-700">26 780.40 MAD</td>
                    <td className="px-6 py-4 text-center"><span className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">À déclarer</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">Mai 2026</td>
                    <td className="px-6 py-4 text-right">198 400.00 MAD</td>
                    <td className="px-6 py-4 text-right">39 680.00 MAD</td>
                    <td className="px-6 py-4 text-right">0.00 MAD</td>
                    <td className="px-6 py-4 text-right">15 200.00 MAD</td>
                    <td className="px-6 py-4 text-right font-medium text-indigo-700">24 480.00 MAD</td>
                    <td className="px-6 py-4 text-center"><span className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Payée</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Journal Comptable */}
        {activeTab === 'journal' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Journal des Écritures</h2>
              <div className="flex gap-2">
                <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"><Download size={16}/> Exporter</button>
                <button className="bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"><Plus size={16}/> Saisie manuelle</button>
              </div>
            </div>
            
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">N° Pièce</th>
                    <th className="px-6 py-4">Compte</th>
                    <th className="px-6 py-4">Libellé</th>
                    <th className="px-6 py-4 text-right">Débit</th>
                    <th className="px-6 py-4 text-right">Crédit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">12/07/2026</td>
                    <td className="px-6 py-4 font-medium">ACH-245</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">6111 - Achats march.</span></td>
                    <td className="px-6 py-4">Facture Boucherie Centrale</td>
                    <td className="px-6 py-4 text-right text-gray-900">4,500.00</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-gray-50/30">
                    <td className="px-6 py-4 text-gray-500">12/07/2026</td>
                    <td className="px-6 py-4 font-medium">ACH-245</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">3455 - TVA Réc. chg</span></td>
                    <td className="px-6 py-4">TVA s/ Fact Boucherie Centrale</td>
                    <td className="px-6 py-4 text-right text-gray-900">900.00</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-gray-50/30">
                    <td className="px-6 py-4 text-gray-500">12/07/2026</td>
                    <td className="px-6 py-4 font-medium">ACH-245</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">4411 - Fournisseurs</span></td>
                    <td className="px-6 py-4">Facture Boucherie Centrale</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                    <td className="px-6 py-4 text-right font-medium">5,400.00</td>
                  </tr>
                  
                  <tr className="hover:bg-gray-50 transition-colors border-t-2 border-gray-200">
                    <td className="px-6 py-4 text-gray-500">15/07/2026</td>
                    <td className="px-6 py-4 font-medium">VTE-992</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">5141 - Banques</span></td>
                    <td className="px-6 py-4">Ventes du 15/07 POS</td>
                    <td className="px-6 py-4 text-right font-medium">12,500.00</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-gray-50/30">
                    <td className="px-6 py-4 text-gray-500">15/07/2026</td>
                    <td className="px-6 py-4 font-medium">VTE-992</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">7111 - Ventes march.</span></td>
                    <td className="px-6 py-4">Ventes du 15/07 POS</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                    <td className="px-6 py-4 text-right text-gray-900">10,416.67</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-gray-50/30">
                    <td className="px-6 py-4 text-gray-500">15/07/2026</td>
                    <td className="px-6 py-4 font-medium">VTE-992</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">4455 - TVA Fact.</span></td>
                    <td className="px-6 py-4">TVA s/ Ventes du 15/07 POS</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                    <td className="px-6 py-4 text-right text-gray-900">2,083.33</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-medium">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right">Total Période</td>
                    <td className="px-6 py-4 text-right text-[#DDA956]">17,900.00</td>
                    <td className="px-6 py-4 text-right text-[#DDA956]">17,900.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
`;

code = code.replace("{activeTab === 'reports' && (", newSections + "\n        {activeTab === 'reports' && (");

fs.writeFileSync('src/Accounting.tsx', code);
