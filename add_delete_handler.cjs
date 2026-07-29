const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const handler = `
  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer cet article du menu ?')) {
      try {
        await deleteDoc(doc(db, 'menu_items', id));
        showToast('Article supprimé avec succès');
      } catch (error) {
        console.error(error);
        showToast('Erreur lors de la suppression', 'error');
      }
    }
  };
`;

code = code.replace(
  "useEffect(() => {",
  handler + "\n  useEffect(() => {"
);

fs.writeFileSync('src/POSTactile.tsx', code);
