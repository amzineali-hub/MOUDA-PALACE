const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

code = code.replace(
  'const subtotal = cart.reduce((sum, item) => sum + (item.numPrice * item.qty), 0);',
  'const subtotal = cart.reduce((sum, item) => sum + ((Number.isNaN(item.numPrice) ? 0 : (item.numPrice || 0)) * (item.qty || 1)), 0);'
);

code = code.replace(
  'catch (err: any) {\n      console.error("Checkout Error:", err);\n      alert("Erreur caisse: " + err.message);\n      showToast("Erreur: " + (err.message || "Erreur inconnue lors de l\'encaissement"), "error");',
  'catch (err: any) {\n      console.error("Checkout Error:", err);\n      alert("Erreur caisse: " + err.message + "\\n" + JSON.stringify(err, Object.getOwnPropertyNames(err)));\n      showToast("Erreur: " + (err.message || "Erreur inconnue lors de l\'encaissement"), "error");'
);

fs.writeFileSync('src/POSTactile.tsx', code);
console.log("Patched POSTactile.tsx for safety and debug");
