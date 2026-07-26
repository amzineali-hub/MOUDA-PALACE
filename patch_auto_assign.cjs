const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const autoAssignStr = `  const autoAssignTables = async () => {
    let updatedTables = [...tables];
    let updatedReservations = reservations.map(res => {
      if (!res.table && res.status !== 'Annulé') {
        const suitableTable = updatedTables.find(t => t.capacity >= res.pax && (t.status === 'available' || t.status === 'libre'));
        if (suitableTable) {
          suitableTable.status = 'reserved';
          return { ...res, table: suitableTable.id };
        }
      }
      return res;
    });
    setTables(updatedTables);
    setReservations(updatedReservations);
    
    // Update Firestore
    try {
      for (const table of updatedTables) {
        if (table.fbId && table.status === 'reserved') {
           await updateDoc(doc(db, 'tables', table.fbId), { status: 'reservee' });
        }
      }
      showToast("Attribution automatique des tables effectuée avec succès.");
    } catch(e) {
      console.error(e);
      showToast("Attribution locale effectuée, mais erreur lors de la synchronisation au serveur.");
    }
  };`;

content = content.replace(/  const autoAssignTables = \(\) => \{[\s\S]*?showToast\("Attribution automatique des tables effectuée avec succès\."\);\n  \};/m, autoAssignStr);

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
