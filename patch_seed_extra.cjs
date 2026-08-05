const fs = require('fs');
let content = fs.readFileSync('src/TableauDeBord.tsx', 'utf-8');

const targetStr = `      // 5. Temperature log
      await addDoc(collection(db, 'temperatureLogs'), {
        temperature: -19.5,
        operator: 'Chef Ahmed',
        room: 'Chambre Négative',
        timestamp: serverTimestamp()
      });`;

const replaceStr = `      // 5. Temperature log
      await addDoc(collection(db, 'temperatureLogs'), {
        temperature: -19.5,
        operator: 'Chef Ahmed',
        room: 'Chambre Négative',
        timestamp: serverTimestamp()
      });

      // 6. Production Order
      await addDoc(collection(db, 'productionOrders'), {
        recipeId: 'fake-id',
        recipeName: 'Tajine de Poulet Citron Confit',
        plannedQuantity: 20,
        status: 'En cours',
        chefResponsable: 'Chef Ahmed',
        createdAt: serverTimestamp()
      });

      // 7. Commandes
      await addDoc(collection(db, 'commandes'), {
        fournisseur: 'Boucherie Atlas',
        statut: 'Livrée',
        totalAmount: 1500,
        createdAt: serverTimestamp()
      });`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/TableauDeBord.tsx', content);
console.log("Patched TableauDeBord.tsx with extra seed data");
