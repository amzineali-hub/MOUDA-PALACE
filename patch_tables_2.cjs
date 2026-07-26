const fs = require('fs');
let content = fs.readFileSync('src/GestionTables.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  "import { Search, Plus, Maximize, User, Clock, Utensils, CalendarDays, MoreHorizontal } from 'lucide-react';",
  "import { Search, Plus, Maximize, User, Clock, Utensils, CalendarDays, MoreHorizontal, X, Circle, Square, RectangleHorizontal } from 'lucide-react';\nimport { AnimatePresence } from 'framer-motion';"
);

// 2. Add state inside GestionTables
content = content.replace(
  "const [activeZone, setActiveZone] = useState('patio');",
  "const [activeZone, setActiveZone] = useState('patio');\n  const [isAddingTable, setIsAddingTable] = useState(false);\n  const [newTable, setNewTable] = useState({ id: '', capacity: 2, shape: 'carre' });"
);

// 3. Add handleAddTable function before return
const handleAddTableStr = `
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTable.id) return showToast("Veuillez saisir un identifiant pour la table");
    
    try {
      await addDoc(collection(db, 'tables'), {
        id: newTable.id,
        zone: activeZone,
        capacity: newTable.capacity,
        shape: newTable.shape,
        status: 'libre',
        currentPax: 0,
        time: null,
        reservation: null,
        createdAt: serverTimestamp()
      });
      showToast("Nouvelle table ajoutée avec succès");
      setIsAddingTable(false);
      setNewTable({ id: '', capacity: 2, shape: 'carre' });
    } catch (err) {
      console.error("Error adding table", err);
      showToast("Erreur lors de l'ajout de la table");
    }
  };

  return (
`;
content = content.replace("  return (", handleAddTableStr);

// 4. Add "Créer Nouvelle Table" button to the header
const addBtnStr = `
          <button onClick={() => setIsAddingTable(true)} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Plus size={18} />
            <span>Nouvelle Table</span>
          </button>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">
`;
content = content.replace(
  '<button className="flex items-center gap-2 bg-white border border-gray-200 text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">',
  addBtnStr
);

// 5. Add Modal code at the end inside the main div
const modalStr = `
      {/* Modal d'ajout de table */}
      <AnimatePresence>
        {isAddingTable && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-[#1A1A1A]">Ajouter une table ({zones.find(z => z.id === activeZone)?.name})</h3>
                <button onClick={() => setIsAddingTable(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddTable} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant (ex: T10)</label>
                  <input 
                    type="text" 
                    value={newTable.id}
                    onChange={(e) => setNewTable({...newTable, id: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                    placeholder="Numéro ou nom de table"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (Pax)</label>
                  <input 
                    type="number" 
                    min="1"
                    max="20"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value) || 2})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Forme de la table</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      type="button"
                      onClick={() => setNewTable({...newTable, shape: 'carre'})}
                      className={\`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all \${newTable.shape === 'carre' ? 'border-[#DDA956] bg-orange-50 text-[#DDA956]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}\`}
                    >
                      <Square size={24} className="mb-2" />
                      <span className="text-xs font-medium">Carré</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewTable({...newTable, shape: 'rond'})}
                      className={\`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all \${newTable.shape === 'rond' ? 'border-[#DDA956] bg-orange-50 text-[#DDA956]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}\`}
                    >
                      <Circle size={24} className="mb-2" />
                      <span className="text-xs font-medium">Rond</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewTable({...newTable, shape: 'rectangle'})}
                      className={\`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all \${newTable.shape === 'rectangle' ? 'border-[#DDA956] bg-orange-50 text-[#DDA956]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}\`}
                    >
                      <RectangleHorizontal size={24} className="mb-2" />
                      <span className="text-xs font-medium">Rectangle</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingTable(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 rounded-xl bg-[#1A1A1A] text-white font-medium hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    Créer la table
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
`;

content = content.replace("    </div>\n  );\n}", modalStr + "\n}");

fs.writeFileSync('src/GestionTables.tsx', content);
console.log("Done");
