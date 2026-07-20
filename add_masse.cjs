const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Fiches de Paie</h3>
            <div className="flex gap-2">`;

const replacement = `      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Banknote size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Masse Salariale Nette (Totale)</p>
                <h4 className="text-2xl font-semibold text-gray-900">
                  {payrollList.reduce((acc, pay) => acc + Number(pay.net.replace(/[^0-9.-]+/g, "")), 0).toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                </h4>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Effectif Rémunéré</p>
                <h4 className="text-2xl font-semibold text-gray-900">
                  {payrollList.length}
                </h4>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Dernière Période</p>
                <h4 className="text-2xl font-semibold text-gray-900">
                  {payrollList.length > 0 ? payrollList[payrollList.length - 1].period : '-'}
                </h4>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Fiches de Paie</h3>
              <div className="flex gap-2">`;

content = content.replace(target, replacement);

const endTarget = `              </tbody>
            </table>
          </div>
        </div>
      )}`;

const endReplacement = `              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}`;

content = content.replace(endTarget, endReplacement);
fs.writeFileSync('src/App.tsx', content);

console.log('Replaced top:', content.includes('Masse Salariale Nette'));

