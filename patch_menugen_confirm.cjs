const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

if (!code.includes('import ConfirmModal')) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport ConfirmModal from './components/ConfirmModal';");
}

const hookAnchor = `  const [isAiLoading, setIsAiLoading] = useState(false);`;
const hookRep = `  const [isAiLoading, setIsAiLoading] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<string | null>(null);`;
code = code.replace(hookAnchor, hookRep);

// Need to be careful. There are two places with window.confirm.
// Let's do a global replace for the onClick handler inline logic.
code = code.replace(/<button onClick=\{async \(\) => \{ if \(window\.confirm\('Voulez-vous vraiment supprimer ce plat du menu \?'\)\) \{ try \{ await deleteDoc\(doc\(db, 'menu_items', item\.id\)\); showToast\('Plat supprimé\.'\); \} catch \(e\) \{ showToast\('Erreur', 'error'\); \} \} \}\} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-50" title="Supprimer">/g, `<button onClick={() => setDishToDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-50" title="Supprimer">`);

const btn2 = `                  <button onClick={async () => {
                    if (window.confirm('Voulez-vous vraiment supprimer ce plat du menu ?')) {
                      try {
                        await deleteDoc(doc(db, 'menu_items', editingItem.id));
                        setEditingItem(null);
                        showToast('Plat supprimé.');
                      } catch (e) {
                        showToast('Erreur', 'error');
                      }
                    }
                  }} className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
                    Supprimer
                  </button>`;
const btn2Rep = `                  <button onClick={() => { setDishToDelete(editingItem.id); setEditingItem(null); }} className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
                    Supprimer
                  </button>`;
code = code.replace(btn2, btn2Rep);

const renderRep = `      <ConfirmModal 
        isOpen={!!dishToDelete}
        title="Supprimer le plat"
        message="Voulez-vous vraiment supprimer ce plat du menu ?"
        onConfirm={async () => {
          if (dishToDelete) {
            try {
              await deleteDoc(doc(db, 'menu_items', dishToDelete));
              showToast('Plat supprimé.');
            } catch (e) {
              showToast('Erreur', 'error');
            } finally {
              setDishToDelete(null);
            }
          }
        }}
        onCancel={() => setDishToDelete(null)}
      />
    </div>
  );
}`;
code = code.replace(/    <\/div>\n  \);\n}\n/g, renderRep + '\n');
fs.writeFileSync('src/MenuGenerator.tsx', code);
