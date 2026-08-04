const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

const target1 = `const matchingRecipe = recettes.find(r => r.name.toLowerCase() === cartItem.name.toLowerCase());`;
const replacement1 = `const matchingRecipe = recettes.find(r => (r.nom || r.name || '').toLowerCase() === (cartItem.name || '').toLowerCase());`;

code = code.replace(target1, replacement1);

const target2 = `invItem = inventoryItems.find((inv: any) => inv.name.toLowerCase() === ingredient.name.toLowerCase());`;
const replacement2 = `invItem = inventoryItems.find((inv: any) => (inv.name || '').toLowerCase() === (ingredient.name || '').toLowerCase());`;

code = code.replace(target2, replacement2);

const target3 = `let semiItem = semiFinishedItems.find((semi: any) => semi.id === ingredient.id || semi.name.toLowerCase() === ingredient.name.toLowerCase());`;
const replacement3 = `let semiItem = semiFinishedItems.find((semi: any) => semi.id === ingredient.id || (semi.name || semi.nom || '').toLowerCase() === (ingredient.name || '').toLowerCase());`;

code = code.replace(target3, replacement3);

const target4 = `          const matchingItem = inventoryItems.find((inv: any) => 
            inv.name.toLowerCase() === cartItem.name.toLowerCase() ||
            inv.name.toLowerCase().includes(cartItem.name.toLowerCase()) ||
            cartItem.name.toLowerCase().includes(inv.name.toLowerCase())
          );`;
const replacement4 = `          const matchingItem = inventoryItems.find((inv: any) => 
            (inv.name || '').toLowerCase() === (cartItem.name || '').toLowerCase() ||
            (inv.name || '').toLowerCase().includes((cartItem.name || '').toLowerCase()) ||
            (cartItem.name || '').toLowerCase().includes((inv.name || '').toLowerCase())
          );`;

code = code.replace(target4, replacement4);

fs.writeFileSync('src/POSTactile.tsx', code);
console.log("Patched POS stock deduction logic");
