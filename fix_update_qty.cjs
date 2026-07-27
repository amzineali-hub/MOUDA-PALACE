const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  '  const updateQty = (id: string, delta: number) => {\n    setCart(prev => {\n      return prev.map(item => {\n        if (item.id === id) {\n          const newQty = item.qty + delta;\n          return newQty > 0 ? { ...item, qty: newQty } : item;\n        }\n        return item;\n      }).filter(item => item.qty > 0 || (item.id === id && delta > 0));\n    });\n  };',
  '  const updateQty = (id: string, delta: number) => {\n    setCart(prev => {\n      return prev.map(item => {\n        if (item.id === id) {\n          const newQty = item.qty + delta;\n          return { ...item, qty: newQty };\n        }\n        return item;\n      }).filter(item => item.qty > 0);\n    });\n  };'
);

fs.writeFileSync('src/POSTactile.tsx', code);
