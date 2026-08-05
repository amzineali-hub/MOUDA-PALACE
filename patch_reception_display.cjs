const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

const targetStr = `{(order.items || order.articles || []).length} articles prévus`;
const replacementStr = `{Array.isArray(order.items) ? order.items.length : (typeof order.items === 'number' ? order.items : (typeof order.articles === 'string' ? order.articles.split(',').length : 0))} articles prévus`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log("Patched Display");
