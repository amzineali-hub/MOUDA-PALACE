const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

code = code.replace(
  `  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Form states`,
  `  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form states`
);

code = code.replace(
  `  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous supprimer ce plat du menu ?")) {
      try {
        await deleteDoc(doc(db, 'menu_items', id));
        showToast("Plat supprimé.");
      } catch (e) {
        showToast("Erreur lors de la suppression.", "error");
      }
    }
  };`,
  `  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, 'menu_items', itemToDelete));
      showToast("Plat supprimé.");
    } catch (e) {
      showToast("Erreur lors de la suppression.", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };`
);

code = code.replace(
  `      )}
    </div>
  );
}`,
  `      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center"
          >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Confirmer la suppression</h2>
            <p className="text-gray-500 mb-8">
              Êtes-vous sûr de vouloir supprimer ce plat ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}`
);

fs.writeFileSync('src/MenuGenerator.tsx', code);
