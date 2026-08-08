const fs = require('fs');
let code = fs.readFileSync('src/FichesTechniques.tsx', 'utf8');

if (!code.includes('const [ficheToDelete')) {
  code = code.replace("const [inventoryItems, setInventoryItems] = useState<any[]>([]);", "const [inventoryItems, setInventoryItems] = useState<any[]>([]);\n  const [ficheToDelete, setFicheToDelete] = useState<string | null>(null);");
}

if (!code.includes("import ConfirmModal")) {
  code = code.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport ConfirmModal from './components/ConfirmModal';");
}

// Ensure the actual delete happens
const deleteSearch = `  const handleDelete = async (id: string) => {
    setFicheToDelete(id); if (false) {`;
const deleteReplace = `  const handleDelete = (id: string) => {
    setFicheToDelete(id);`;
code = code.replace(deleteSearch, deleteReplace);

const endDelete = `      } catch (err) {
        showToast('Erreur lors de la suppression', 'error');
      }
    }
  };`;
const endReplace = `  };
  const confirmDelete = async () => {
    if (!ficheToDelete) return;
    try {
      await deleteDoc(doc(db, 'fiches_techniques', ficheToDelete));
      showToast('Fiche technique supprimée', 'success');
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    }
    setFicheToDelete(null);
  };`;
code = code.replace(endDelete, endReplace);

fs.writeFileSync('src/FichesTechniques.tsx', code);
