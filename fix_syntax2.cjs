const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

// We want to replace the exact block from `          )}\n          </div>\n        </div>\n      </div>\n      {/* Print Modal */}` 
// to `    </div>\n  );\n}`

const startStr = `          )}
          </div>
        </div>
      </div>
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

const replacementStr = `          )}
          </div>
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
      </div>
    );
  }`;

if (code.includes(startStr)) {
    code = code.replace(startStr, replacementStr);
    fs.writeFileSync('src/MenuGenerator.tsx', code);
    console.log("Fixed JSX syntax in MenuGenerator");
} else {
    console.log("Could not find exact string block. Printing first 100 chars of actual block:");
    console.log(code.substring(code.indexOf('          )}'), code.indexOf('          )}') + 100));
}
