const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace #1A1A1A with #163832
content = content.replace(/#1A1A1A/g, '#163832');

// Replace #333 with #1F4A42 (but only in contexts where it was the lighter version of the dark gray)
content = content.replace(/#333(?![0-9a-fA-F])/g, '#1F4A42');

fs.writeFileSync('src/App.tsx', content);
console.log('Colors replaced');
