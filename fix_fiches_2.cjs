const fs = require('fs');
let code = fs.readFileSync('src/FichesTechniques.tsx', 'utf8');

const search = `  const handleDelete = (id: string) => {
    setFicheToDelete(id);
      try {
        await deleteDoc(doc(db, 'fiches_techniques', id));
        showToast('Fiche technique supprimée', 'success');
  };`;
  
const replace = `  const handleDelete = (id: string) => {
    setFicheToDelete(id);
  };`;

code = code.replace(search, replace);
fs.writeFileSync('src/FichesTechniques.tsx', code);
