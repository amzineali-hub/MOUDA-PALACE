const fs = require('fs');
let posContent = fs.readFileSync('src/POSTactile.tsx', 'utf8');

posContent = posContent.replace(
    "import { useToast } from './context/ToastContext';",
    "import { useToast } from './context/ToastContext';\nimport { collection, addDoc, serverTimestamp } from 'firebase/firestore';\nimport { db } from './firebase';"
);

const handleSendKitchenOld = `  const handleSendKitchen = () => {
    if (cart.length === 0) return showToast("Le panier est vide");
    showToast("Bon envoyé en cuisine avec succès !");
  };`;

const handleSendKitchenNew = `  const handleSendKitchen = async () => {
    if (cart.length === 0) return showToast("Le panier est vide");
    
    try {
      for (const item of cart) {
        if (item.category !== 'boissons') {
          await addDoc(collection(db, 'productionTasks'), {
            item: item.name,
            qty: item.qty + 'x',
            priority: 'Moyenne',
            progress: 0,
            status: 'À faire',
            createdAt: serverTimestamp()
          });
        }
      }
      showToast("Bon de commande envoyé en cuisine (synchronisé avec la production)");
      // Do not clear the cart yet, wait for checkout
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'envoi en cuisine", "error");
    }
  };`;

posContent = posContent.replace(handleSendKitchenOld, handleSendKitchenNew);
fs.writeFileSync('src/POSTactile.tsx', posContent);
console.log("Done");
