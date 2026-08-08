const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const search = `  const updateOrderStatus = async (cmdId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'commandes', cmdId), {
        status: newStatus
      });
      showToast(\`Statut mis à jour : \${newStatus}\`);
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Erreur lors de la mise à jour du statut");
    }
  };`;

const replace = `  const updateOrderStatus = async (cmdId: string, newStatus: string) => {
    if (newStatus === 'Livrée') {
      showToast("Veuillez utiliser l'onglet Réception pour valider une livraison et mettre à jour le stock.", "error");
      return;
    }
    try {
      await updateDoc(doc(db, 'commandes', cmdId), {
        status: newStatus
      });
      showToast(\`Statut mis à jour : \${newStatus}\`);
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Erreur lors de la mise à jour du statut");
    }
  };`;

code = code.replace(search, replace);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
