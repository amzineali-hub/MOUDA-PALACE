const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  "const [newItemImage, setNewItemImage] = useState<string>('');",
  "const [newItemImage, setNewItemImage] = useState<string>('');\n  const [isManualName, setIsManualName] = useState(false);"
);

code = code.replace(
  `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'article</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Coca-Cola" 
                  required 
                  list="recettes-list"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white"
                />
                <datalist id="recettes-list">
                  {recettes.map((r, idx) => (
                    <option key={idx} value={r.nom} />
                  ))}
                </datalist>
              </div>`,
  `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'article</label>
                {!isManualName ? (
                  <div className="relative">
                    <select
                      value={newItemName}
                      onChange={(e) => {
                        if (e.target.value === 'manual') {
                          setIsManualName(true);
                          setNewItemName('');
                        } else {
                          handleNameChange(e.target.value);
                        }
                      }}
                      required
                      className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white appearance-none"
                    >
                      <option value="" disabled>Sélectionner un plat...</option>
                      {recettes.map((r, idx) => (
                        <option key={idx} value={r.nom}>{r.nom}</option>
                      ))}
                      <option value="manual">+ Autre (Saisie manuelle)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newItemName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Nom de l'article" 
                      required 
                      autoFocus
                      className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white"
                    />
                    <button type="button" onClick={() => { setIsManualName(false); setNewItemName(''); }} className="p-3 text-gray-500 hover:bg-gray-100 rounded-xl border border-gray-200">
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>`
);

code = code.replace(
  "setIsAddModalOpen(false);",
  "setIsAddModalOpen(false);\n      setIsManualName(false);"
);

fs.writeFileSync('src/POSTactile.tsx', code);
