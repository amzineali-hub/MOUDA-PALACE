const fs = require('fs');

const files = ['src/MenuGenerator.tsx', 'src/RH.tsx', 'src/Accounting.tsx'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  if (file === 'src/MenuGenerator.tsx') {
    code = code.replace(/const handlePrint = \(\) => \{[\s\S]*?\};/, `const handlePrint = () => {\n    setTimeout(() => window.print(), 100);\n  };`);
    
    // Remove the print modal state
    code = code.replace(/const \[showPrintModal, setShowPrintModal\] = useState\(false\);\n/, '');
    
    // Remove the modal JSX
    code = code.replace(/\{\/\* Print Modal \*\/\}[\s\S]*?\}\)/, '');
  }
  
  if (file === 'src/RH.tsx') {
    const brokenCode = `if (window !== window.top) {
                      showToast("Pour imprimer, ouvrez l'app dans un nouvel onglet via la flèche en haut à droite.", "info");
                    } else {
                      window.print();
                    }`;
    code = code.replace(brokenCode, `setTimeout(() => window.print(), 100);`);
  }
  
  if (file === 'src/Accounting.tsx') {
    const brokenCode = `if (window !== window.top) {
                showToast("Pour imprimer, ouvrez l'app dans un nouvel onglet via la flèche en haut à droite.", "info");
              } else {
                window.print();
              }`;
    code = code.replace(brokenCode, `setTimeout(() => window.print(), 100);`);
  }
  
  if (file === 'src/App.tsx') {
     code = code.replace(/if \(window !== window\.top\)[\s\S]*?else \{\s*window\.print\(\);\s*\}/, `window.print();`);
  }

  fs.writeFileSync(file, code);
}

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/if \(window !== window\.top\) \{[\s\S]*?else \{\s*window\.print\(\);\s*\}/g, 'window.print();');
fs.writeFileSync('src/App.tsx', appCode);

console.log("Updated to use native window.print() directly");
