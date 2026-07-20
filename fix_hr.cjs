const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importStateAdd = `  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isImportAttendanceModalOpen, setIsImportAttendanceModalOpen] = useState(false);`;

content = content.replace(/  const \[isAttendanceModalOpen, setIsAttendanceModalOpen\] = useState\(false\);/, importStateAdd);

const buttonsTarget = `              <button 
                onClick={() => setIsAttendanceModalOpen(true)}
                className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-black transition-colors"
              >
                <Plus size={16} /> Saisir Pointage
              </button>
              <button 
                onClick={() => showToast("Exportation des pointages du jour...")}
                className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
              >
                <Timer size={16} /> Exporter Pointages
              </button>`;

const buttonsReplace = `              <button 
                onClick={() => setIsImportAttendanceModalOpen(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <Upload size={16} /> Importer (Fichier)
              </button>
              <button 
                onClick={() => setIsAttendanceModalOpen(true)}
                className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-black transition-colors"
              >
                <Plus size={16} /> Saisir Pointage
              </button>
              <button 
                onClick={() => showToast("Exportation des pointages du jour...")}
                className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
              >
                <Timer size={16} /> Exporter Pointages
              </button>`;

content = content.replace(buttonsTarget, buttonsReplace);

const modalTarget = `      {/* Attendance Modal */}
      {isAttendanceModalOpen && (`;

const modalReplace = `      {/* Import Attendance Modal */}
      {isImportAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-serif font-semibold text-gray-900">
                Importer des Pointages
              </h3>
              <button 
                onClick={() => setIsImportAttendanceModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Importez les fichiers de pointage générés par votre machine biométrique ou badgeuse.
                </p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#DDA956] transition-colors bg-gray-50 cursor-pointer">
                  <div className="flex justify-center mb-2 text-gray-400">
                    <Upload size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Cliquez ou glissez un fichier ici</p>
                  <p className="text-xs text-gray-500">Formats supportés: .CSV, .XLS, .XLSX (ZKTeco, etc.)</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setIsImportAttendanceModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    showToast("Importation du fichier de pointage démarrée...");
                    setIsImportAttendanceModalOpen(false);
                  }}
                  className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors"
                >
                  Sélectionner un fichier
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (`;

content = content.replace(modalTarget, modalReplace);

fs.writeFileSync('src/App.tsx', content);

console.log('Replaced buttons:', content.includes('Importer (Fichier)'));
console.log('Replaced modal:', content.includes('isImportAttendanceModalOpen && ('));
