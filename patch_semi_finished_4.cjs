const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetState = `  const [semiFinished, setSemiFinished] = useState<any[]>([]);
  const [isSemiFinishedModalOpen, setIsSemiFinishedModalOpen] = useState(false);
  const [semiFinishedForm, setSemiFinishedForm] = useState<any>({ name: '', unit: 'kg', cost: '', quantity: 0 });`;

const replacementState = `  const [semiFinished, setSemiFinished] = useState<any[]>([]);
  const [isSemiFinishedModalOpen, setIsSemiFinishedModalOpen] = useState(false);
  const [semiFinishedForm, setSemiFinishedForm] = useState<any>({ name: '', unit: 'kg', cost: '', quantity: 0 });
  const [isSemiFinishedAdjustModalOpen, setIsSemiFinishedAdjustModalOpen] = useState(false);
  const [semiFinishedAdjustData, setSemiFinishedAdjustData] = useState<any>({id: '', name: '', quantity: 0, adjustment: ''});
  const [isSemiFinishedDeleteModalOpen, setIsSemiFinishedDeleteModalOpen] = useState(false);
  const [semiFinishedDeleteData, setSemiFinishedDeleteData] = useState<any>({id: '', name: ''});`;

code = code.replace(targetState, replacementState);

const targetAdjustBtn = `                              <button
                                onClick={async () => {
                                  const qty = window.prompt('Quantité à ajouter ou retirer (ex: 5 ou -2) :');
                                  if (qty && !isNaN(Number(qty))) {
                                    const newQty = Number(item.quantity || 0) + Number(qty);
                                    try {
                                      await updateDoc(doc(db, 'semi_finished', item.id), { quantity: newQty });
                                      showToast(\`Stock de \${item.name} mis à jour avec succès.\`);
                                    } catch(e) {
                                      showToast('Erreur lors de la mise à jour', 'error');
                                    }
                                  }
                                }}
                                className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                title="Alimenter (Ajuster Stock)"
                              >
                                <Plus size={18} />
                              </button>`;

const replacementAdjustBtn = `                              <button
                                onClick={() => {
                                  setSemiFinishedAdjustData({ id: item.id, name: item.name, quantity: item.quantity, adjustment: '' });
                                  setIsSemiFinishedAdjustModalOpen(true);
                                }}
                                className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                title="Alimenter (Ajuster Stock)"
                              >
                                <Plus size={18} />
                              </button>`;

code = code.replace(targetAdjustBtn, replacementAdjustBtn);


const targetDeleteBtn = `                              <button
                                onClick={async () => {
                                  if(window.confirm(\`Voulez-vous vraiment supprimer le produit "\${item.name}" ?\`)) {
                                    try {
                                      await deleteDoc(doc(db, 'semi_finished', item.id));
                                      showToast('Produit supprimé avec succès');
                                    } catch(e) {
                                      showToast('Erreur lors de la suppression', 'error');
                                    }
                                  }
                                }}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={18} />
                              </button>`;

const replacementDeleteBtn = `                              <button
                                onClick={() => {
                                  setSemiFinishedDeleteData({ id: item.id, name: item.name });
                                  setIsSemiFinishedDeleteModalOpen(true);
                                }}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={18} />
                              </button>`;

code = code.replace(targetDeleteBtn, replacementDeleteBtn);


const newModals = `
      {isSemiFinishedAdjustModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-serif font-semibold text-gray-900">Ajuster Stock</h3>
              <button onClick={() => setIsSemiFinishedAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">Produit: <span className="font-medium text-gray-900">{semiFinishedAdjustData.name}</span></p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité à ajouter ou retirer (ex: 5 ou -2)</label>
                <input
                  type="number"
                  value={semiFinishedAdjustData.adjustment}
                  onChange={(e) => setSemiFinishedAdjustData({...semiFinishedAdjustData, adjustment: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsSemiFinishedAdjustModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button
                onClick={async () => {
                  const qty = Number(semiFinishedAdjustData.adjustment);
                  if (!isNaN(qty) && semiFinishedAdjustData.adjustment !== '') {
                    try {
                      const newQty = Number(semiFinishedAdjustData.quantity || 0) + qty;
                      await updateDoc(doc(db, 'semi_finished', semiFinishedAdjustData.id), { quantity: newQty });
                      showToast(\`Stock de \${semiFinishedAdjustData.name} mis à jour avec succès.\`);
                      setIsSemiFinishedAdjustModalOpen(false);
                    } catch(e) {
                      showToast('Erreur lors de la mise à jour', 'error');
                    }
                  }
                }}
                className="px-6 py-2.5 bg-[#265C6D] text-white font-medium rounded-xl hover:bg-[#1f4a58] transition-colors"
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isSemiFinishedDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-serif font-semibold text-gray-900">Supprimer le produit</h3>
              <button onClick={() => setIsSemiFinishedDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Voulez-vous vraiment supprimer le produit <strong>{semiFinishedDeleteData.name}</strong> ?</p>
              <p className="text-sm text-red-500 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsSemiFinishedDeleteModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'semi_finished', semiFinishedDeleteData.id));
                    showToast('Produit supprimé avec succès');
                    setIsSemiFinishedDeleteModalOpen(false);
                  } catch(e) {
                    showToast('Erreur lors de la suppression', 'error');
                  }
                }}
                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
`;

code = code.replace("{isSemiFinishedModalOpen && (", newModals + "\n\n      {isSemiFinishedModalOpen && (");

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed adjust and delete modals');
