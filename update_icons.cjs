const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /  EyeOff,\n  Filter,\n  Upload,/g,
  `  EyeOff,
  Filter,
  Upload,
  Image as ImageIcon,
  Video,
  MonitorPlay,`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated icons");
