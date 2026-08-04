const fs = require('fs');
let content = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

const target = `      showToast("Commande envoyée en cuisine !", "success");
      setCart([]);`;
      
const replacement = `      showToast("Commande envoyée en cuisine !", "success");
      const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      const now = new Date();
      setTicketToPrint({
        id: orderId,
        date: today,
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: total,
        method: "Envoi Cuisine"
      });
      setIsTicketModalOpen(true);
      setCart([]);`;
      
content = content.replace(target, replacement);
fs.writeFileSync('src/POSTactile.tsx', content);
console.log("Patched POS ticket");
