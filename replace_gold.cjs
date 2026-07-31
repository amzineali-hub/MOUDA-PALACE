const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace #DDA956 with a brighter/lighter gold
content = content.replace(/#DDA956/gi, '#F4C75B');

// Replace #c4954b with a new brighter/lighter hover gold
content = content.replace(/#c4954b/gi, '#E5B745');

fs.writeFileSync('src/App.tsx', content);
console.log('Gold colors updated');
