const fs = require('fs');

const files = ['src/MenuGenerator.tsx', 'src/RH.tsx', 'src/Accounting.tsx'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(/import html2pdf from 'html2pdf\.js';\n?/g, '');

  if (file === 'src/MenuGenerator.tsx') {
    const handlePrintRegex = /const handlePrint = \(\) => \{[\s\S]*?catch \(e\) \{[\s\S]*?\}\n  \};/;
    const newHandlePrint = `  const [showPrintModal, setShowPrintModal] = useState(false);

  const handlePrint = () => {
    try {
      if (window !== window.top) {
        setShowPrintModal(true);
      } else {
        window.print();
      }
    } catch (e) {
      setShowPrintModal(true);
    }
  };`;
    code = code.replace(handlePrintRegex, newHandlePrint);

    // Inject the modal before the return statement of the component
    const modalCode = `
      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Printer size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Impression & PDF</h3>
            <p className="text-gray-600 mb-6">
              Pour imprimer ou télécharger le PDF de votre menu, l'application doit être ouverte en plein écran (dans un nouvel onglet) en raison des restrictions du navigateur.
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href={window.location.href} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setShowPrintModal(false)}
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors flex justify-center items-center gap-2"
              >
                Ouvrir dans un nouvel onglet
              </a>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
    
    // Replace the very end of the file
    code = code.replace(/    \);\n  \}\n$/g, modalCode);
    code = code.replace(/          \)\}\n          <\/div>\n        <\/div>\n      <\/div>\n    \);\n  \}/g, "          )}\n          </div>\n        </div>\n      </div>" + modalCode);
  }
  
  if (file === 'src/RH.tsx' || file === 'src/Accounting.tsx') {
    const badPrintCodeRegex = /onClick=\{\(\) => \{[\s\S]*?try \{ if \(window !== window\.top\)[\s\S]*?\} catch\(e\) \{\}[\s\S]*?\}\}/;
    
    const newOnClick = `onClick={() => {
              if (window !== window.top) {
                showToast("Pour imprimer, ouvrez l'app dans un nouvel onglet via la flèche en haut à droite.", "info");
              } else {
                window.print();
              }
            }}`;
            
    code = code.replace(badPrintCodeRegex, newOnClick);
  }

  fs.writeFileSync(file, code);
}
console.log("Removed html2pdf and replaced with native print");
