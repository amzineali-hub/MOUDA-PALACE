const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /  Trash2,\n  Eye,\n  EyeOff,\n  Filter,/g,
  `  Trash2,
  Eye,
  EyeOff,
  Filter,
  Upload,`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced:", content.includes('Upload,'));
