const fs = require('fs');
let code = fs.readFileSync('src/Inventory.tsx', 'utf8');
code = code.replace(/import \{ Plus, Trash2, Edit, Search, AlertTriangle, CalendarClock \} from 'lucide-react';/, "import { Plus, Trash2, Edit, Search, AlertTriangle, CalendarClock, Package } from 'lucide-react';");
fs.writeFileSync('src/Inventory.tsx', code);
