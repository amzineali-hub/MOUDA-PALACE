const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const search = `  const handleDeleteExpense = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette dépense ?")) {
      try {
        await deleteDoc(doc(db, "expenses", id));
        showToast("Dépense supprimée avec succès");
      } catch (error) {
        console.error(error);
        showToast("Erreur lors de la suppression", "error");
      }
    }
  };`;

const replace = `  const handleDeleteExpense = async (expense: any) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette dépense ?")) {
      try {
        if (expense.isOrder) {
           await deleteDoc(doc(db, "commandes", expense.id));
        } else {
           await deleteDoc(doc(db, "expenses", expense.id));
        }
        showToast("Dépense supprimée avec succès");
      } catch (error) {
        console.error(error);
        showToast("Erreur lors de la suppression", "error");
      }
    }
  };`;

code = code.replace(search, replace);

code = code.replace(/<button onClick=\{\(\) => handleDeleteExpense\(expense\.id\)\}/g, '<button onClick={() => handleDeleteExpense(expense)}');

fs.writeFileSync('src/Accounting.tsx', code);
