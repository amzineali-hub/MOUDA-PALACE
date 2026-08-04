const fs = require('fs');
let code = fs.readFileSync('src/GestionTables.tsx', 'utf-8');

const importTarget = `import { Search, Plus, Maximize, User, Clock, Utensils, CalendarDays, MoreHorizontal, X, Circle, Square, RectangleHorizontal } from 'lucide-react';`;
const importReplacement = `import { Search, Plus, Maximize, User, Clock, Utensils, CalendarDays, MoreHorizontal, X, Circle, Square, RectangleHorizontal, Trash2 } from 'lucide-react';`;

if (code.includes(importTarget)) {
    code = code.replace(importTarget, importReplacement);
}

const targetButton = `                <button className="text-current opacity-50 hover:opacity-100 transition-opacity">
                  <MoreHorizontal size={20} />
                </button>`;

const replacementButton = `                <button 
                  onClick={() => {
                    if (window.confirm(\`Voulez-vous vraiment supprimer la table \${table.id} ?\`)) {
                      deleteDoc(doc(db, 'tables', table.fbId)).then(() => showToast('Table supprimée')).catch(() => showToast('Erreur lors de la suppression', 'error'));
                    }
                  }}
                  className="text-current opacity-50 hover:opacity-100 hover:text-red-600 transition-colors"
                  title="Supprimer la table"
                >
                  <Trash2 size={18} />
                </button>`;

if (code.includes(targetButton)) {
    code = code.replace(targetButton, replacementButton);
    fs.writeFileSync('src/GestionTables.tsx', code);
    console.log('Added delete button to GestionTables.tsx');
} else {
    console.log('Button target not found in GestionTables.tsx');
}
