const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// replace <option value="g">g</option> with <option value="g">G</option>
content = content.replace(/<option value="g">g<\/option>/g, '<option value="g">G</option>');

// Also uppercase kg if they prefer
content = content.replace(/<option value="kg">kg<\/option>/g, '<option value="kg">Kg</option>');

fs.writeFileSync('src/App.tsx', content);
console.log("Patched g to G");
