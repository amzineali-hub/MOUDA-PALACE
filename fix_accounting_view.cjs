const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const targetView = `        {activeTab === 'expenses' && (
          <div className="overflow-x-auto">`;

const replacementView = `        {activeTab === 'receipts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">ID Encaiss.</th>
                  <th className="px-6 py-4">Date & Heure</th>
                  <th className="px-6 py-4">Méthode</th>
                  <th className="px-6 py-4 text-right">Montant</th>
                  <th className="px-6 py-4 text-center">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receipts.map((receipt, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900">{receipt.id}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {receipt.createdAt?.toDate ? receipt.createdAt.toDate().toLocaleString('fr-FR') : receipt.date}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{receipt.method}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 text-right">{receipt.amount.toFixed(2)} MAD</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => showToast(\`\${receipt.items?.length || 0} articles dans ce ticket\`)} className="p-1.5 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-gray-100" title="Voir le ticket">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {receipts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Aucune recette caisse trouvée. Les encaissements du POS apparaîtront ici.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="overflow-x-auto">`;

if (code.includes(targetView)) {
  code = code.replace(targetView, replacementView);
  fs.writeFileSync('src/Accounting.tsx', code);
  console.log("Injected receipts view");
} else {
  console.log("Could not find target view");
}
