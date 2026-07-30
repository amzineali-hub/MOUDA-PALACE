const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// Remove the Edit modal block
const editModalRegex = /\{\/\* Modal Éditer Commande \*\/\}[\s\S]*?\{\/\* Modal Nouvelle Commande \*\/\}/;
code = code.replace(editModalRegex, '{/* Modal Nouvelle Commande */}');

// Replace state setters
code = code.replace(/setIsEditOrderModalOpen\(true\)/g, 'setIsNewOrderModalOpen(true)');

// Remove the state variable if it's there
code = code.replace(/const \[isEditOrderModalOpen, setIsEditOrderModalOpen\] = useState\(false\);\n/, '');

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
