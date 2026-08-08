const fs = require('fs');
let code = fs.readFileSync('src/FichesTechniques.tsx', 'utf8');

const search = `      <ConfirmModal 
        isOpen={!!ficheToDelete}
        title="Supprimer la fiche technique"
        message="Voulez-vous vraiment supprimer cette fiche technique ?"
        onConfirm={confirmDelete}
        onCancel={() => setFicheToDelete(null)}
      />`;
      
const lastIndex = code.lastIndexOf(search);
if (lastIndex !== -1) {
    code = code.substring(0, lastIndex) + code.substring(lastIndex + search.length);
}

fs.writeFileSync('src/FichesTechniques.tsx', code);
