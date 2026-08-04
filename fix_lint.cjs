const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix duplicate Trash2
code = code.replace(/User, Edit3, Trash2 } from 'lucide-react';/g, "User, Edit3 } from 'lucide-react';");

// Fix TS error on data.createdAt
code = code.replace(
  "const data = {",
  "const data: any = {"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed lint issues');
