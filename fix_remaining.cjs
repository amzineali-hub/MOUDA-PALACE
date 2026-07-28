const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<button onClick=\{\(\) => showToast && showToast\('Action en cours de développement\.\.\.'\)\} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Action<\/button>/g,
  '<button onClick={() => showToast && showToast("Fonctionnalité à venir...")} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Modifier</button>'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed remaining action labels");
