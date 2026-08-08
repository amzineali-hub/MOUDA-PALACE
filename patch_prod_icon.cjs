const fs = require('fs');
let code = fs.readFileSync('src/ProductionJournaliere.tsx', 'utf8');

code = code.replace("import { ChefHat, Plus, Activity, Clock, CheckCircle, Package, ArrowRight, X, Trash2 } from 'lucide-react';", "import { ChefHat, Plus, Activity, Clock, CheckCircle, Package, ArrowRight, X, Trash2, Users } from 'lucide-react';");

code = code.replace(/<Activity size=\{24\} \/>\n          <\/div>\n          <div>\n            <p className="text-white\/80 text-sm font-medium">Prévisions Couverts \(Auj\.\)<\/p>/, `<Users size={24} />\n          </div>\n          <div>\n            <p className="text-white/80 text-sm font-medium">Prévisions Couverts (Auj.)</p>`);

fs.writeFileSync('src/ProductionJournaliere.tsx', code);
