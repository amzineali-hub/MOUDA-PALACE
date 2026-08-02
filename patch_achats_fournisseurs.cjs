const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

// 1. Add searchQuery state
const stateTarget = `  const [fournisseurs, setFournisseurs] = useState<any[]>([]);`;
const stateReplacement = `  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');`;

if (code.includes(stateTarget)) {
  code = code.replace(stateTarget, stateReplacement);
} else {
  console.log('stateTarget not found');
}

// 2. Bind the search input
const searchInputTarget = `<div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>`;
const searchInputReplacement = `<div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>`;

if (code.includes(searchInputTarget)) {
  code = code.replace(searchInputTarget, searchInputReplacement);
} else {
  console.log('searchInputTarget not found');
}

// 3. Replace table with grid
const tableTargetStart = `{activeTab === 'fournisseurs' && (
            <table className="w-full text-left border-collapse min-w-[800px]">`;

const indexOfTableStart = code.indexOf(tableTargetStart);
if (indexOfTableStart !== -1) {
  // Find where the block ends by looking for the end of the table
  const tableTargetEndStr = `            </table>
          )}`;
  const indexOfTableEnd = code.indexOf(tableTargetEndStr, indexOfTableStart);
  
  if (indexOfTableEnd !== -1) {
    const tableTarget = code.substring(indexOfTableStart, indexOfTableEnd + tableTargetEndStr.length);
    const tableReplacement = `{activeTab === 'fournisseurs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {fournisseurs
                .filter(f => {
                  const q = searchQuery.toLowerCase();
                  return (f.nom || f.name || '').toLowerCase().includes(q) ||
                         (f.categorie || f.category || '').toLowerCase().includes(q) ||
                         (f.contact || '').toLowerCase().includes(q);
                })
                .map((fournisseur) => (
                <div key={fournisseur.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-[#265C6D]">
                        <span className="text-xl font-bold">{(fournisseur.nom || fournisseur.name || '?').charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-1">{fournisseur.nom || fournisseur.name}</h4>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                          ★ {fournisseur.rating || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setSelectedFournisseur(fournisseur); setIsEditSupplierModalOpen(true); }}
                      className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-white hover:text-blue-600 shadow-sm border border-gray-100 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                    </button>
                  </div>
                  
                  <div className="mb-5">
                    <span className="inline-flex items-center bg-[#265C6D]/5 text-[#265C6D] px-3 py-1 rounded-full text-xs font-medium border border-[#265C6D]/10">
                      {fournisseur.categorie || fournisseur.category || 'Général'}
                    </span>
                  </div>
                  
                  <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <span className="text-gray-700 font-medium">{fournisseur.contact || 'Non renseigné'}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </div>
                      <a href={\`tel:\${fournisseur.tel || fournisseur.phone}\`} className="text-gray-600 hover:text-blue-600 transition-colors">
                        {fournisseur.tel || fournisseur.phone || 'Non renseigné'}
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                      </div>
                      <a href={\`mailto:\${fournisseur.email}\`} className="text-gray-600 hover:text-amber-600 truncate transition-colors">
                        {fournisseur.email || 'Non renseigné'}
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex gap-2 w-full">
                    <button 
                      onClick={() => { setSelectedFournisseur(fournisseur); setIsEditSupplierModalOpen(true); }}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                    >
                      Gérer
                    </button>
                    <button 
                      onClick={() => window.open(\`mailto:\${fournisseur.email}\`)}
                      className="flex-1 bg-[#F4C75B]/10 hover:bg-[#F4C75B]/20 text-[#265C6D] py-2 rounded-lg text-sm font-medium transition-colors border border-[#F4C75B]/30"
                    >
                      Contacter
                    </button>
                  </div>
                </div>
              ))}
              
              {fournisseurs.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white border border-gray-200 rounded-2xl border-dashed">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <h4 className="text-gray-900 font-medium text-lg mb-2">Aucun fournisseur</h4>
                  <p className="text-gray-500 max-w-sm mb-6">Vous n'avez pas encore de fournisseurs enregistrés ou aucun ne correspond à votre recherche.</p>
                  <button onClick={() => setIsNewSupplierModalOpen(true)} className="bg-[#F4C75B] text-[#1A1A1A] px-6 py-2.5 rounded-xl font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                    Ajouter un fournisseur
                  </button>
                </div>
              )}
            </div>
          )}`;
    
    code = code.replace(tableTarget, tableReplacement);
    console.log('Successfully replaced table with grid in AchatsFournisseurs.tsx');
  } else {
    console.log('Table end not found');
  }
} else {
  console.log('Table start not found');
}

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
