const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  const handleSync = () => {`;

const r1 = `  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isImportTacModalOpen, setIsImportTacModalOpen] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  const handleSync = () => {`;

const t2 = `        <div className="flex gap-3">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {isSyncing ? 'Synchronisation...' : 'Synchroniser la caisse'}
          </button>
        </div>`;

const r2 = `        <div className="flex gap-3">
          <button 
             onClick={() => setIsImportTacModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200"
          >
            <Upload size={16} /> Importer (Fichier)
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {isSyncing ? 'Synchronisation API' : 'Synchroniser API'}
          </button>
        </div>`;

const t3 = `      {isApiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">`;

const r3 = `      {/* Import TacSystems Modal */}
      {isImportTacModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-serif font-semibold text-gray-900">
                Importer Journal de Caisse
              </h3>
              <button 
                onClick={() => setIsImportTacModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Importez un export de journal de caisse depuis le backoffice de TacSystems si vous n'êtes pas connecté par API.
                </p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#DDA956] transition-colors bg-gray-50 cursor-pointer">
                  <div className="flex justify-center mb-2 text-gray-400">
                    <Upload size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Cliquez ou glissez un fichier ici</p>
                  <p className="text-xs text-gray-500">Formats supportés: .CSV, .XLS, .XLSX (Export TacSystems)</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setIsImportTacModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    showToast("Importation du journal de caisse démarrée...");
                    setIsImportTacModalOpen(false);
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

      {isApiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">`;

content = content.replace(t1, r1);
content = content.replace(t2, r2);
content = content.replace(t3, r3);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced 1:", content.includes('isImportTacModalOpen'));
console.log("Replaced 2:", content.includes('Importer (Fichier)'));
