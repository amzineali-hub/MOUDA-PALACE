const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const filterRegex = /let matchesExpiration = true;[\s\S]*?return matchesSearch && matchesCategory && matchesExpiration && matchesAlert;\n  }\)\.sort\(\(a, b\) => \{/;

const newLogic = `let matchesExpiration = true;
    if (expirationFilter === 'Expirés' || expirationFilter === 'En attente' || expirationFilter === 'Proche/Expiré') {
      if (!item.expirationDate) {
        matchesExpiration = false;
      } else {
        const expDate = new Date(item.expirationDate);
        const today = new Date();
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (expirationFilter === 'Expirés') {
          matchesExpiration = diffDays <= 0;
        } else if (expirationFilter === 'En attente') {
          matchesExpiration = diffDays > 0 && diffDays <= 7;
        } else if (expirationFilter === 'Proche/Expiré') {
          matchesExpiration = diffDays <= 7;
        }
      }
    }

    let matchesAdvancedAlert = true;
    if (advancedAlertFilter) {
      if (item.quantity > item.minStock || !item.expirationDate) {
         matchesAdvancedAlert = false;
      } else {
         const expDate = new Date(item.expirationDate);
         const today = new Date();
         const diffTime = expDate.getTime() - today.getTime();
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         if (diffDays >= 15) {
             matchesAdvancedAlert = false;
         }
      }
    }

    return matchesSearch && matchesCategory && matchesExpiration && matchesAlert && matchesAdvancedAlert;
  }).sort((a, b) => {`;

if (filterRegex.test(code)) {
  code = code.replace(filterRegex, newLogic);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Successfully replaced logic using regex');
} else {
  console.log('Regex did not match');
}
