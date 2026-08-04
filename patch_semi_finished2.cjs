const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add states
const stateCode = `
  const [semiFinished, setSemiFinished] = useState<any[]>([]);
  const [isSemiFinishedModalOpen, setIsSemiFinishedModalOpen] = useState(false);
  const [semiFinishedForm, setSemiFinishedForm] = useState<any>({ name: '', unit: 'kg', cost: '', quantity: 0 });
`;
code = code.replace(
  "const [recipes, setRecipes] = useState<any[]>([]);",
  "const [recipes, setRecipes] = useState<any[]>([]);\n" + stateCode
);

// Add fetch
const fetchCode = `
      const unsubSemi = onSnapshot(collection(db, 'semi_finished'), (snapshot) => {
        setSemiFinished(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      });
`;
code = code.replace(
  "const unsubRecipes = onSnapshot(collection(db, 'fiches_techniques'), (snapshot) => {",
  fetchCode + "\n      const unsubRecipes = onSnapshot(collection(db, 'fiches_techniques'), (snapshot) => {"
);

// Delete old tab
const oldTab = `          {activeTab === 'semi_finished' && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Produits Semi-finis</h3>
                <button 
                  onClick={() => showToast('Fonctionnalité en cours de développement...')}
                  className="px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Nouveau Produit
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-500 mb-4">
                  <ChefHat size={24} />
                </div>
                <p>La gestion des produits semi-finis sera bientôt disponible.</p>
              </div>
            </div>
          )}`;

const newTab = `          {activeTab === 'semi_finished' && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Produits Semi-finis</h3>
                <button 
                  onClick={() => {
                    setSemiFinishedForm({ name: '', unit: 'kg', cost: '', quantity: 0 });
                    setIsSemiFinishedModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Nouveau Produit
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Nom du produit</th>
                      <th className="px-6 py-4 text-center">Quantité en stock</th>
                      <th className="px-6 py-4 text-center">Unité</th>
                      <th className="px-6 py-4 text-right">Coût Unitaire (MAD)</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {semiFinished.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Aucun produit semi-fini enregistré.
                        </td>
                      </tr>
                    ) : (
                      semiFinished.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-center font-medium">
                            <span className={\`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs \${item.quantity <= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}\`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-500">{item.unit}</td>
                          <td className="px-6 py-4 text-right text-gray-900">{Number(item.cost || 0).toFixed(2)} MAD</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  const qty = prompt('Quantité à ajouter ou retirer (ex: 5 ou -2) :');
                                  if (qty && !isNaN(Number(qty))) {
                                    const newQty = Number(item.quantity || 0) + Number(qty);
                                    updateDoc(doc(db, 'semi_finished', item.id), { quantity: newQty });
                                    showToast(\`Stock de \${item.name} mis à jour.\`);
                                  }
                                }}
                                className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                title="Alimenter (Ajuster Stock)"
                              >
                                <Plus size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSemiFinishedForm(item);
                                  setIsSemiFinishedModalOpen(true);
                                }}
                                className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                title="Éditer la fiche"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={async () => {
                                  if(confirm(\`Supprimer \${item.name} ?\`)) {
                                    await deleteDoc(doc(db, 'semi_finished', item.id));
                                    showToast('Produit supprimé');
                                  }
                                }}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}`;

code = code.replace(oldTab, newTab);

// Add Modal
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
  "{/* Toast Notification */}",
  modalCode + "\n\n      {/* Toast Notification */}"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched full semi_finished');
