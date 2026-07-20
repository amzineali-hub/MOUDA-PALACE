const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const stateTarget = `  const [isTranslating, setIsTranslating] = useState(false);
  const [displayLanguage, setDisplayLanguage] = useState('fr');`;

const stateReplace = `  const [isTranslating, setIsTranslating] = useState(false);
  const [displayLanguage, setDisplayLanguage] = useState('fr');
  const [isPreviewMode, setIsPreviewMode] = useState(false);`;

content = content.replace(stateTarget, stateReplace);

const headerTarget = `        <div className="flex gap-3">
          <button 
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <QrCode size={16} />
            Imprimer QR Code
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Ajouter un plat
          </button>
        </div>`;

const headerReplace = `        <div className="flex flex-wrap justify-end gap-3">
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors shadow-sm"
          >
            {isPreviewMode ? <Menu size={16} /> : <ImageIcon size={16} />}
            {isPreviewMode ? 'Vue Liste' : 'Aperçu Multimédia'}
          </button>
          <button 
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <QrCode size={16} />
            Imprimer QR Code
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Ajouter un plat
          </button>
        </div>`;

content = content.replace(headerTarget, headerReplace);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced:", content.includes('isPreviewMode'));
