const fs = require('fs');
let content = fs.readFileSync('src/GestionTables.tsx', 'utf8');

const badStr = `    const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTable.id) return showToast("Veuillez saisir un identifiant pour la table");
    
    try {
      await addDoc(collection(db, 'tables'), {
        id: newTable.id,
        zone: activeZone,
        capacity: newTable.capacity,
        shape: newTable.shape,
        status: 'libre',
        currentPax: 0,
        time: null,
        reservation: null,
        createdAt: serverTimestamp()
      });
      showToast("Nouvelle table ajoutée avec succès");
      setIsAddingTable(false);
      setNewTable({ id: '', capacity: 2, shape: 'carre' });
    } catch (err) {
      console.error("Error adding table", err);
      showToast("Erreur lors de l'ajout de la table");
    }
  };

`;

content = content.replace(badStr, "");
content = content.replace("  const handleUpdateStatus = async", badStr + "  const handleUpdateStatus = async");

fs.writeFileSync('src/GestionTables.tsx', content);
console.log("Done");
