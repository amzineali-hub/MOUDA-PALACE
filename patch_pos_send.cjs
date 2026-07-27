const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const target = `  const handleSendKitchen = async () => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    
    showToast("Commande envoyée en cuisine !");
    setCart([]);
  };`;

const replacement = `  const handleSendKitchen = async () => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    
    try {
      const orderId = 'CMD-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      for (const item of cart) {
        await addDoc(collection(db, 'productionTasks'), {
          orderId,
          item: item.name,
          qty: item.qty,
          status: 'À faire',
          progress: 0,
          createdAt: new Date(),
          source: 'POS'
        });
      }
      showToast("Commande envoyée en cuisine !");
      setCart([]);
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'envoi en cuisine", "error");
    }
  };`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched successfully.");
} else {
    console.log("Could not find target block.");
}

// Ensure addDoc is imported
if (!code.includes('addDoc') && code.includes('collection, onSnapshot')) {
  code = code.replace('collection, onSnapshot', 'collection, onSnapshot, addDoc');
}

fs.writeFileSync('src/POSTactile.tsx', code);
