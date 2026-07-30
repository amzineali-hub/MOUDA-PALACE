const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const expenseModal = `
      {/* New Expense Modal */}
      {isNewExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouvelle Dépense</h3>
              <button onClick={() => setIsNewExpenseModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newExpense = {
                category: formData.get('category'),
                supplier: formData.get('supplier'),
                amount: Number(formData.get('amount')) + ' MAD',
                date: formData.get('date'),
                method: formData.get('method'),
                createdAt: serverTimestamp()
              };
              
              try {
                const docRef = await addDoc(collection(db, 'expenses'), newExpense);
                // Also set the generated id back so we don't have empty id if we need it
                await updateDoc(docRef, { id: 'EXP-' + docRef.id.substring(0,6).toUpperCase() });
                showToast("Dépense ajoutée avec succès");
                setIsNewExpenseModalOpen(false);
              } catch (err) {
                console.error("Error adding expense", err);
                showToast("Erreur lors de l'ajout");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select name="category" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option>Marchandise</option>
                  <option>Électricité</option>
                  <option>Marketing</option>
                  <option>Salaires</option>
                  <option>Loyer & Charges</option>
                  <option>Divers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaire (Fournisseur)</label>
                <input name="supplier" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Nom du bénéficiaire" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
                <input name="amount" required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input name="date" required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                <select name="method" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option>Espèces</option>
                  <option>Virement</option>
                  <option>Carte Bancaire</option>
                  <option>Chèque</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Ajouter la Dépense
              </button>
            </form>
          </div>
        </div>
      )}
`;

code = code.replace('{/* Receipt Modal */}', expenseModal + '\n      {/* Receipt Modal */}');

fs.writeFileSync('src/Accounting.tsx', code);
