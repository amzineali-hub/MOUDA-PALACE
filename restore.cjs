const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacementBlock = `                          <button \n                            onClick={() => showToast && showToast(\`Téléchargement de la fiche de \${partner.name}...\`)}  \n                            className="p-2 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-amber-50"\n                            title="Télécharger Fiche Partenaire"\n                          >\n                            <Download size={18} />\n                          </button>\n                          <button \n                            onClick={() => showToast && showToast(\`Modification de \${partner.name} en cours de développement...\`)}  \n                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"\n                            title="Modifier Partenaire"\n                          >\n                            <Edit2 size={18} />\n                          </button>\n                          <button \n                            onClick={() => showToast && showToast(\`Suppression de \${partner.name}...\`)}  \n                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"\n                            title="Supprimer Partenaire"\n                          >\n                            <Trash2 size={18} />\n                          </button>`;

// Actually we need a regex because spacing might differ slightly
const regex = /<button [^>]*onClick=\{\(\) => showToast && showToast\(`Téléchargement de la fiche de \$\{partner\.name\}\.\.\.`\)\}  [^>]*>[\s\S]*?<Trash2 size=\{18\} \/>\s*<\/button>/g;

let match;
let i = 0;
content = content.replace(regex, (m, offset) => {
  i++;
  // We keep it as is for the 2nd occurrence (the Partner one)
  if (i === 2) return m;

  // For the others, we just put a placeholder button that compiles
  if (i === 3) {
      // This was inside the HTML string literal for print window
      return `<button class="secondary" onclick="window.close()">Fermer</button>`;
  }
  
  return `<button onClick={() => showToast && showToast('Action en cours de développement...')} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Action</button>`;
});

fs.writeFileSync('src/App.tsx', content);
console.log(`Replaced ${i} occurrences.`);
