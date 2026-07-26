const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// The standard lucide-react import in App.tsx
// find import { ... } from 'lucide-react';
appContent = appContent.replace(
    "} from 'lucide-react';",
    ", AlertCircle } from 'lucide-react';"
);

fs.writeFileSync('src/App.tsx', appContent);
console.log("Done");
