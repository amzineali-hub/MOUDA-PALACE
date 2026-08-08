const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const search = `                            setSelectedCommande(cmd); 
                            setProductSearch('');`;

const replace = `                            setSelectedCommande(cmd); 
                            setProductSearch('');
                            setOrderTvaRate(cmd.tva || 20);`;

code = code.replace(search, replace);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
