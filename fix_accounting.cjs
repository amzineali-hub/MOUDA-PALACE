const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const stateRegex = /  const \[receipts, setReceipts\] = useState<any\[\]>\(\[\]\);/;
const stateInjection = `  const [receipts, setReceipts] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);`;
code = code.replace(stateRegex, stateInjection);

const btnRegex = /<button onClick=\{\(\) => showToast\(\`\$\{receipt\.items\?\.length \|\| 0\} articles dans ce ticket\`\)\} className="p-1.5 text-gray-400 hover:text-\[#DDA956\] transition-colors rounded-lg hover:bg-gray-100" title="Voir le ticket">/;
const btnInjection = `<button onClick={() => { setSelectedReceipt(receipt); setIsReceiptModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-gray-100" title="Voir le ticket">`;
code = code.replace(btnRegex, btnInjection);

const modalInjection = `
      {/* Receipt Modal */}
      {isReceiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Printer size={18} className="text-[#DDA956]" />
                Ticket de Caisse
              </h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white font-mono text-sm">
              <div className="text-center mb-6">
                <h2 className="font-bold text-xl mb-1">MOUDA PALACE</h2>
                <p className="text-gray-500 text-xs">Restaurant Traditionnel Marocain</p>
                <p className="text-gray-500 text-xs mt-2">Fès, Maroc</p>
                <p className="text-gray-500 text-xs mt-1">Tel: +212 5 35 XX XX XX</p>
              </div>
              
              <div className="border-t border-b border-dashed border-gray-300 py-3 mb-4 space-y-1">
                <div className="flex justify-between">
                  <span>Ticket N°:</span>
                  <span className="font-medium">{selectedReceipt.displayId || 'TKT-' + selectedReceipt.id.substring(0, 6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{selectedReceipt.createdAt?.toDate ? selectedReceipt.createdAt.toDate().toLocaleString('fr-FR') : selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serveur:</span>
                  <span>{selectedReceipt.server || 'Caisse Principale'}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dashed border-gray-300 text-left">
                      <th className="py-2 font-normal">Qte</th>
                      <th className="py-2 font-normal">Désignation</th>
                      <th className="py-2 font-normal text-right">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipt.items && selectedReceipt.items.length > 0 ? (
                      selectedReceipt.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="py-1 align-top">{item.quantity || 1}x</td>
                          <td className="py-1">{item.name}</td>
                          <td className="py-1 text-right align-top">{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500 italic">Détails non disponibles</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="border-t border-dashed border-gray-300 pt-3 space-y-2 mb-6">
                <div className="flex justify-between text-base font-bold">
                  <span>TOTAL NET</span>
                  <span>{selectedReceipt.amount.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Paiement:</span>
                  <span className="font-medium uppercase">{selectedReceipt.method}</span>
                </div>
              </div>
              
              <div className="text-center text-xs text-gray-500">
                <p>Merci de votre visite !</p>
                <p className="mt-1">À bientôt au Mouda Palace</p>
                
                <div className="mt-4 flex justify-center">
                  <div className="bg-gray-100 p-2 rounded">
                    <QrCode size={48} className="text-gray-800" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => {
                  showToast("Impression du ticket...");
                  setTimeout(() => setIsReceiptModalOpen(false), 500);
                }}
                className="flex-1 bg-[#DDA956] text-[#1A1A1A] py-2.5 rounded-lg font-medium hover:bg-[#c4954b] transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
`;

const endOfFileRegex = /    <\/div>\n  \);\n\}\n\s*$/;
code = code.replace(endOfFileRegex, modalInjection + "\n    </div>\n  );\n}\n");
fs.writeFileSync('src/Accounting.tsx', code);
