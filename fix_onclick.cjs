const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  "onClick={() => addToCart(item)}",
  "onClick={() => !isEditMode && addToCart(item)}"
);

fs.writeFileSync('src/POSTactile.tsx', code);
