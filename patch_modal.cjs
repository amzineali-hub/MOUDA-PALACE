const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const modalCode = `
      {isSemiFinishedModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-serif font-semibold text-gray-900">
                {semiFinishedForm.id ? 'Éditer le Produit' : 'Nouveau Produit Semi-fini'}
              </h3>
              <button onClick={() => setIsSemiFinishedModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                <input
                  type="text"
                  value={semiFinishedForm.name}
                  onChange={(e) => setSemiFinishedForm({...semiFinishedForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  placeholder="Ex: Pâte à pizza"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select
                    value={semiFinishedForm.unit}
                    onChange={(e) => setSemiFinishedForm({...semiFinishedForm, unit: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="portion">portion</option>
                    <option value="pièce">pièce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coût unitaire (MAD)</label>
                  <input
                    type="number"
                    step="any"
                    value={semiFinishedForm.cost}
                    onChange={(e) => setSemiFinishedForm({...semiFinishedForm, cost: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  />
                </div>
              </div>
              {!semiFinishedForm.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
                  <input
                    type="number"
                    value={semiFinishedForm.quantity}
                    onChange={(e) => setSemiFinishedForm({...semiFinishedForm, quantity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  />
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsSemiFinishedModalOpen(false)}
                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    const data = {
                      name: semiFinishedForm.name,
                      unit: semiFinishedForm.unit,
                      cost: Number(semiFinishedForm.cost) || 0,
                      quantity: Number(semiFinishedForm.quantity) || 0,
                      updatedAt: serverTimestamp()
                    };
                    if (semiFinishedForm.id) {
                      await updateDoc(doc(db, 'semi_finished', semiFinishedForm.id), data);
                      showToast('Produit mis à jour');
                    } else {
                      data.createdAt = serverTimestamp();
                      await addDoc(collection(db, 'semi_finished'), data);
                      showToast('Produit créé');
                    }
                    setIsSemiFinishedModalOpen(false);
                  } catch(e) {
                    showToast('Erreur');
                  }
                }}
                className="px-6 py-2.5 bg-[#265C6D] text-white font-medium rounded-xl hover:bg-[#1f4a58] transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}
`;

code = code.replace(
  "{isProdTaskModalOpen && (",
  modalCode + "\n\n      {isProdTaskModalOpen && ("
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched modal');
