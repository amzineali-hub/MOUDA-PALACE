const fs = require('fs');
let content = fs.readFileSync('src/TracabiliteHACCP.tsx', 'utf-8');

const importTarget = `import { QrCode, Printer, Thermometer, ShieldCheck, AlertTriangle, PackageOpen, Plus, Search, Calendar, ChefHat, CheckCircle2 } from 'lucide-react';`;
const importReplacement = `import { QrCode, Printer, Thermometer, ShieldCheck, AlertTriangle, PackageOpen, Plus, Search, Calendar, ChefHat, CheckCircle2, Clock, X } from 'lucide-react';`;
content = content.replace(importTarget, importReplacement);

fs.writeFileSync('src/TracabiliteHACCP.tsx', content);
console.log("Patched HACCP icons");
