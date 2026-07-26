const fs = require('fs');
const file = 'src/MenuGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

const printHandler = `
  const handlePrint = () => {
    try {
      if (window !== window.top) {
         showToast("L'impression est bloquée dans cet aperçu. Cliquez sur l'icône 'Ouvrir dans un nouvel onglet' (flèche en haut à droite) pour imprimer votre menu.", "error");
      } else {
         window.print();
      }
    } catch (e) {
         showToast("Impossible d'imprimer. Ouvrez l'app dans un nouvel onglet.", "error");
    }
  };
`;

content = content.replace("const handleAddMenuItem", printHandler + "\n  const handleAddMenuItem");
content = content.replace("<button onClick={() => window.print()}", "<button onClick={handlePrint}");

fs.writeFileSync(file, content);
console.log("Done");
