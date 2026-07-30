const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// Add the state variable
code = code.replace(/const \[isNewOrderModalOpen, setIsNewOrderModalOpen\] = useState\(false\);/, 
  'const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);\n  const [productSearch, setProductSearch] = useState(\'\');');

// Reset state on open buttons
code = code.replace(/onClick=\{.*?setIsNewOrderModalOpen\(true\).*?\}/, 
  'onClick={() => { setSelectedCommande(null); setProductSearch(\'\'); setIsNewOrderModalOpen(true); }}');
code = code.replace(/onClick=\{\(\) => \{ setSelectedCommande\(cmd\); setIsNewOrderModalOpen\(true\); \}\}/, 
  'onClick={() => { setSelectedCommande(cmd); setProductSearch(\'\'); setIsNewOrderModalOpen(true); }}');

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
