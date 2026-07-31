const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace #163832 (old dark green) with #265C6D (new teal/blue-green)
content = content.replace(/#163832/g, '#265C6D');

// Replace #1F4A42 (old hover green) with #2F6B7F (new lighter hover teal)
content = content.replace(/#1F4A42/g, '#2F6B7F');

fs.writeFileSync('src/App.tsx', content);
console.log('Colors replaced with Mouda Palace blue-green');
