const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetState = `  const [isSemiFinishedDeleteModalOpen, setIsSemiFinishedDeleteModalOpen] = useState(false);
  const [semiFinishedDeleteData, setSemiFinishedDeleteData] = useState<any>({id: '', name: ''});`;
  
const replacementState = `  const [isSemiFinishedDeleteModalOpen, setIsSemiFinishedDeleteModalOpen] = useState(false);
  const [semiFinishedDeleteData, setSemiFinishedDeleteData] = useState<any>({id: '', name: ''});
  const [isInventoryDeleteModalOpen, setIsInventoryDeleteModalOpen] = useState(false);
  const [inventoryDeleteData, setInventoryDeleteData] = useState<any>({id: '', name: ''});`;

if (code.includes(targetState)) {
    code = code.replace(targetState, replacementState);
} else {
    console.log("State target not found");
}

const targetDelete1 = `                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
                                try {
                                  await deleteDoc(doc(db, 'inventoryItems', item.id));
                                  showToast("Produit supprimé");
                                } catch (err) {
                                  console.error(err);
                                  showToast("Erreur lors de la suppression", "error");
                                }
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>`;

const replacementDelete1 = `                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setInventoryDeleteData({ id: item.id, name: item.name });
                              setIsInventoryDeleteModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>`;

if (code.includes(targetDelete1)) {
    code = code.replace(targetDelete1, replacementDelete1);
} else {
    console.log("Delete 1 target not found");
}

const targetDelete2 = `                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
                    try {
                      await deleteDoc(doc(db, 'inventoryItems', selectedProduct.id));
                      showToast("Produit supprimé");
                      setIsSettingsModalOpen(false);
                    } catch (err) {
                      console.error(err);
                      showToast("Erreur lors de la suppression", "error");
                    }
                  }
                }}
                className="w-full bg-white text-red-500 border border-red-200 py-3 rounded-xl font-medium mt-2 hover:bg-red-50 transition-colors"
              >
                Supprimer le produit
              </button>`;

const replacementDelete2 = `                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSettingsModalOpen(false);
                  setInventoryDeleteData({ id: selectedProduct.id, name: selectedProduct.name });
                  setIsInventoryDeleteModalOpen(true);
                }}
                className="w-full bg-white text-red-500 border border-red-200 py-3 rounded-xl font-medium mt-2 hover:bg-red-50 transition-colors"
              >
                Supprimer le produit
              </button>`;

if (code.includes(targetDelete2)) {
    code = code.replace(targetDelete2, replacementDelete2);
} else {
    console.log("Delete 2 target not found");
}

const newModal = `      {/* Inventory Delete Modal */}
      {isInventoryDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-red-700">Supprimer l'article</h3>
              </div>
              <button onClick={() => setIsInventoryDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Êtes-vous sûr de vouloir supprimer <strong>{inventoryDeleteData.name}</strong> ?</p>
              <p className="text-sm text-red-500 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsInventoryDeleteModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'inventoryItems', inventoryDeleteData.id));
                    showToast('Produit supprimé avec succès');
                    setIsInventoryDeleteModalOpen(false);
                  } catch(e) {
                    showToast('Erreur lors de la suppression', 'error');
                  }
                }}
                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
`;

const targetModalInsert = `      {isNewOrderModalOpen && (`;

if (code.includes(targetModalInsert)) {
    code = code.replace(targetModalInsert, newModal + "\\n      " + targetModalInsert);
} else {
    console.log("Modal insert target not found");
}

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed inventory deletion modal');
