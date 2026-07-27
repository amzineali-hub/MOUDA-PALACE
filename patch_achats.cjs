const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// 1. Add state variables
code = code.replace(
  '  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);',
  '  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);\n  const [selectedCommande, setSelectedCommande] = useState<any>(null);\n  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);'
);

// 2. Modify the details button
const oldButton = `<button className="text-[#DDA956] hover:text-[#C89845] font-medium text-sm flex items-center justify-end gap-1 w-full">
                        Détails <ChevronRight size={16} />
                      </button>`;
const newButton = `<button 
                        onClick={() => {
                          setSelectedCommande(cmd);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-[#DDA956] hover:text-[#C89845] font-medium text-sm flex items-center justify-end gap-1 w-full"
                      >
                        Détails <ChevronRight size={16} />
                      </button>`;
code = code.replace(oldButton, newButton);

// 3. Add the modal before the new order modal
const modalCode = `
      {/* Modal Détails Commande */}
      {isDetailsModalOpen && selectedCommande && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative">
            <button 
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">Détails de la Commande {selectedCommande.orderNumber || selectedCommande.id.slice(0,8).toUpperCase()}</h3>
            <p className="text-sm text-gray-500 mb-6">Fournisseur : <span className="font-medium text-gray-900">{selectedCommande.fournisseur}</span> • Date : {selectedCommande.date}</p>
            
            <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-4 py-3 font-medium">Article</th>
                    <th className="px-4 py-3 font-medium text-center">Qté</th>
                    <th className="px-4 py-3 font-medium text-right">Prix Unitaire</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {(() => {
                    const articlesList = (selectedCommande.articles || '').split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0);
                    let totalGlobal = 0;
                    return (
                      <>
                        {articlesList.map((article: string, idx: number) => {
                          // Génération d'un prix unitaire mocké basé sur le nom de l'article pour avoir des données cohérentes
                          const unitPrice = (article.length * 5.5) + 15; 
                          const quantity = 1;
                          const total = unitPrice * quantity;
                          totalGlobal += total;
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 font-medium text-[#1A1A1A]">{article}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{unitPrice.toFixed(2)} DH</td>
                              <td className="px-4 py-3 text-right font-medium text-[#1A1A1A]">{total.toFixed(2)} DH</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-gray-50 font-bold text-[#1A1A1A]">
                          <td colSpan={3} className="px-4 py-3 text-right uppercase text-xs tracking-wider text-gray-500">Total calculé</td>
                          <td className="px-4 py-3 text-right text-lg text-[#DDA956]">{totalGlobal.toFixed(2)} DH</td>
                        </tr>
                      </>
                    )
                  })()}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Commande */}
`;

code = code.replace('{/* Modal Nouvelle Commande */}', modalCode);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
