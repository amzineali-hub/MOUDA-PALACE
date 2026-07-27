const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

// 1. Add X import
code = code.replace(
  'import { Search, Plus, Minus, Trash2, CreditCard, Banknote, User, Utensils, Receipt, Coffee, GlassWater } from \'lucide-react\';',
  'import { Search, Plus, Minus, Trash2, CreditCard, Banknote, User, Utensils, Receipt, Coffee, GlassWater, X } from \'lucide-react\';'
);

// 2. Add state for add modal
code = code.replace(
  '  const [loading, setLoading] = useState(true);',
  `  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    
    try {
      await addDoc(collection(db, 'menu_items'), {
        name: newItemName,
        price: \`\${newItemPrice} MAD\`,
        category: activeCategory,
        active: true,
        desc: ''
      });
      showToast('Article ajouté avec succès');
      setIsAddModalOpen(false);
      setNewItemName('');
      setNewItemPrice('');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de l\\'ajout', 'error');
    }
  };`
);

// 3. Add the button in the grid
code = code.replace(
  '                  {filteredItems.map(item => {',
  `                  {/* Bouton d'ajout */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddModalOpen(true)}
                    className="relative overflow-hidden flex flex-col justify-center items-center h-40 rounded-3xl p-5 border-2 border-dashed border-gray-300 text-gray-400 hover:text-[#DDA956] hover:border-[#DDA956] hover:bg-[#DDA956]/5 transition-all"
                  >
                    <Plus size={32} className="mb-2" />
                    <span className="font-bold text-sm">Ajouter un article</span>
                  </motion.button>
                  
                  {filteredItems.map(item => {`
);

// 4. Update the "Aucun plat" check
code = code.replace(
  '                {filteredItems.length === 0 && (',
  '                {false && filteredItems.length === 0 && (' // Disable this since we now always have the add button
);

// 5. Add the modal at the end before final div
code = code.replace(
  '    </div>\n  );\n}',
  `
      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Nouvel Article</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'article</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ex: Coca-Cola" 
                  required 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
                <input 
                  type="number" 
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="Ex: 25" 
                  required 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white"
                />
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#DDA956] text-[#1A1A1A] rounded-xl font-bold hover:bg-[#cda25b] transition-colors"
                >
                  Ajouter dans {activeCategory}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}`
);

fs.writeFileSync('src/POSTactile.tsx', code);
