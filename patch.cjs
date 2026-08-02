const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {`;

const replacement = `  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    
    let matchesExpiration = true;
    if (expirationFilter === 'Expirés' || expirationFilter === 'En attente') {
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
        }
      }
    }
    
    return matchesSearch && matchesCategory && matchesExpiration;
  }).sort((a, b) => {`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Successfully patched filteredStockItems logic');
} else {
  console.error('Target not found in App.tsx');
}
