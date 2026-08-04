const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

const target = `  const handleCheckout = async (method: string) => {
    if (cart.length === 0) {`;
const replacement = `  const handleCheckout = async (method: string) => {
    console.log("handleCheckout clicked with method:", method);
    if (cart.length === 0) {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/POSTactile.tsx', code);
    console.log("Patched handleCheckout with console.log");
} else {
    console.log("Target not found");
}
