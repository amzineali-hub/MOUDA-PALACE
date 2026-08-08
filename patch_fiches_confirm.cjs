const fs = require('fs');
let code = fs.readFileSync('src/FichesTechniques.tsx', 'utf8');

if (!code.includes('import ConfirmModal')) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport ConfirmModal from './components/ConfirmModal';");
}

const hookAnchor = `  const [ficheToEdit, setFicheToEdit] = useState<any>(null);`;
const hookRep = `  const [ficheToEdit, setFicheToEdit] = useState<any>(null);
  const [ficheToDelete, setFicheToDelete] = useState<string | null>(null);`;
code = code.replace(hookAnchor, hookRep);

const confirmAnchor = `  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette fiche technique ?')) {
      try {
        await deleteDoc(doc(db, 'fiches_techniques', id));
        showToast('Fiche technique supprimée.');
      } catch (e) {
        showToast('Erreur', 'error');
      }
    }
  };`;
const confirmRep = `  const handleDelete = (id: string) => {
    setFicheToDelete(id);
  };
  const confirmDelete = async () => {
    if (ficheToDelete) {
      try {
        await deleteDoc(doc(db, 'fiches_techniques', ficheToDelete));
        showToast('Fiche technique supprimée.');
      } catch (e) {
        showToast('Erreur', 'error');
      } finally {
        setFicheToDelete(null);
      }
    }
  };`;
code = code.replace(confirmAnchor, confirmRep);

const renderAnchor = `    </div>
  );
}`;
const renderRep = `      <ConfirmModal 
        isOpen={!!ficheToDelete}
        title="Supprimer la fiche technique"
        message="Voulez-vous vraiment supprimer cette fiche technique ?"
        onConfirm={confirmDelete}
        onCancel={() => setFicheToDelete(null)}
      />
    </div>
  );
}`;
code = code.replace(/    <\/div>\n  \);\n}\n/g, renderRep + '\n');

fs.writeFileSync('src/FichesTechniques.tsx', code);
