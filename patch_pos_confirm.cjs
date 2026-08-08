const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

if (!code.includes('import ConfirmModal')) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport ConfirmModal from './components/ConfirmModal';");
}

const hookAnchor = `  const [kitchenOrders, setKitchenOrders] = useState<any[]>([]);`;
const hookRep = `  const [kitchenOrders, setKitchenOrders] = useState<any[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);`;
code = code.replace(hookAnchor, hookRep);

const btnAnchor = `  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Voulez-vous vraiment supprimer cet article du menu ?')) return;
    try {
      await deleteDoc(doc(db, 'menu_items', id));
      showToast('Article supprimé avec succès');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de la suppression', 'error');
    }
  };`;
const btnRep = `  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
  };
  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, 'menu_items', itemToDelete));
        showToast('Article supprimé avec succès');
      } catch (error) {
        console.error(error);
        showToast('Erreur lors de la suppression', 'error');
      } finally {
        setItemToDelete(null);
      }
    }
  };`;
code = code.replace(btnAnchor, btnRep);

const renderRep = `      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Supprimer l'article"
        message="Voulez-vous vraiment supprimer cet article du menu ?"
        onConfirm={confirmDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}`;
code = code.replace(/    <\/div>\n  \);\n}\n/g, renderRep + '\n');
fs.writeFileSync('src/POSTactile.tsx', code);
