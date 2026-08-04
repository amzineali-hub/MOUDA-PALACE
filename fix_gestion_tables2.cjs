const fs = require('fs');
let code = fs.readFileSync('src/GestionTables.tsx', 'utf-8');

const target = `  const handleAddTable = async (e: React.FormEvent) => {
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

  return (
) => {
      unsubTables();
    };
  }, []);
      
    const handleAddTable = async (e: React.FormEvent) => {`;

const replacement = `    return () => {
      unsubTables();
    };
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/GestionTables.tsx', code);
    console.log('Fixed GestionTables.tsx');
} else {
    console.log('Target not found in GestionTables.tsx');
}
