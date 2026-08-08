const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `  const handleDeleteDish = (id: number) => {
    setDishToDelete(id);
  };
  const confirmDeleteDish = () => {
    if (dishToDelete !== null) {
      setMenuItems(items => items.filter(item => item.id !== dishToDelete));
      showToast("Plat supprimé avec succès");
      setDishToDelete(null);
    }
  };`;
  
const replace = `  const handleDeleteDish = (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer ce plat ?')) {
      setMenuItems(items => items.filter(item => item.id !== id));
      showToast("Plat supprimé avec succès");
    }
  };`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
