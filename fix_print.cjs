const fs = require('fs');

const files = ['src/App.tsx', 'src/MenuGenerator.tsx', 'src/RH.tsx', 'src/Accounting.tsx'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  // App.tsx
  code = code.replace(
    "if (window !== window.top) { showToast(\"L'impression est bloquée dans cet aperçu. Cliquez sur l'icône 'Ouvrir dans un nouvel onglet' (flèche en haut à droite).\", \"error\"); } else { window.print(); }",
    "if (window !== window.top) { const win = window.open(window.location.href, '_blank'); if(!win) showToast(\"L'impression est bloquée. Veuillez ouvrir l'application dans votre navigateur.\", \"error\"); } else { window.print(); }"
  );
  
  // RH.tsx & Accounting.tsx
  code = code.replace(
    "if (window !== window.top) { showToast(\"L'impression est bloquée dans cet aperçu. Cliquez sur l'icône 'Ouvrir dans un nouvel onglet' (flèche en haut à droite).\", \"error\"); } else { window.print(); }",
    "if (window !== window.top) { const win = window.open(window.location.href, '_blank'); if(!win) showToast(\"L'impression est bloquée. Veuillez ouvrir l'application dans votre navigateur.\", \"error\"); } else { window.print(); }"
  );

  // MenuGenerator.tsx
  code = code.replace(
    "if (window !== window.top) {\n         showToast(\"L'impression est bloquée dans cet aperçu. Cliquez sur l'icône 'Ouvrir dans un nouvel onglet' (flèche en haut à droite) pour imprimer votre menu.\", \"error\");",
    "if (window !== window.top) {\n         const win = window.open(window.location.href, '_blank');\n         if (!win) showToast(\"L'impression est bloquée. Veuillez ouvrir l'application dans votre navigateur.\", \"error\");"
  );
  
  fs.writeFileSync(file, code);
}
console.log("Updated print handlers");
