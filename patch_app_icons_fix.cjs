const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(
    ", AlertCircle } from 'lucide-react';",
    "AlertCircle } from 'lucide-react';"
);
appContent = appContent.replace(
    "  , AlertCircle } from 'lucide-react';",
    "  AlertCircle } from 'lucide-react';"
);

fs.writeFileSync('src/App.tsx', appContent);
console.log("Done");
