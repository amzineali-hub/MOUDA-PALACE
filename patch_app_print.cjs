const fs = require('fs');

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/setTimeout\(\(\) => window\.print\(\), 500\);/g, `setTimeout(() => { try { if (window !== window.top) { showToast("L'impression est bloquée dans cet aperçu. Cliquez sur l'icône 'Ouvrir dans un nouvel onglet' (flèche en haut à droite).", "error"); } else { window.print(); } } catch(e) { showToast("Erreur d'impression", "error"); } }, 500);`);
  content = content.replace(/onClick=\{\(\) => window\.print\(\)\}/g, `onClick={() => { try { if (window !== window.top) { showToast("L'impression est bloquée dans cet aperçu. Cliquez sur l'icône 'Ouvrir dans un nouvel onglet' (flèche en haut à droite).", "error"); } else { window.print(); } } catch(e) { showToast("Erreur d'impression", "error"); } }}`);
  fs.writeFileSync(filePath, content);
};

fixFile('src/App.tsx');
fixFile('src/Accounting.tsx');
console.log("Done");
