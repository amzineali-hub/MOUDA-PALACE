const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const target = `  const handleCheckout = (method: string) => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    showToast(\`Paiement de \${total.toFixed(2)} MAD par \${method} validé !\`);
    setCart([]);
  };`;

const replace = `  const handleCheckout = async (method: string) => {
    if (cart.length === 0) {
      showToast("Le ticket est vide.", "error");
      return;
    }
    
    try {
      await addDoc(collection(db, 'cash_receipts'), {
        amount: total,
        method: method,
        items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: new Date() // Fallback if serverTimestamp is not imported properly
      });
      showToast(\`Paiement de \${total.toFixed(2)} MAD par \${method} validé !\`);
      setCart([]);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'encaissement", "error");
    }
  };`;

code = code.replace(target, replace);
fs.writeFileSync('src/POSTactile.tsx', code);
console.log("POS updated");
