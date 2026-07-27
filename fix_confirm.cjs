const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  '  const handleClearCart = () => {\n    if (cart.length > 0) {\n      if (window.confirm("Êtes-vous sûr de vouloir annuler ce ticket ?")) {\n        setCart([]);\n        showToast("Ticket annulé", "info");\n      }\n    }\n  };',
  '  const handleClearCart = () => {\n    if (cart.length > 0) {\n      setCart([]);\n      showToast("Ticket annulé", "info");\n    }\n  };'
);

fs.writeFileSync('src/POSTactile.tsx', code);
