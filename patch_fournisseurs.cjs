const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add supplierSearchQuery state
const stateTarget = `  const [fournisseurs, setFournisseurs] = useState<any[]>([]);`;
const stateReplacement = `  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');`;

if (code.includes(stateTarget)) {
  code = code.replace(stateTarget, stateReplacement);
}

// Replace the suppliers table with a card grid
const uiTarget = `                {/* Suppliers List */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                        <tr>
                          <th className="px-6 py-4">Fournisseur</th>
                          <th className="px-6 py-4">Catégorie</th>
                          <th className="px-6 py-4">Contact</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fournisseurs.length > 0 ? fournisseurs.map((supplier, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{supplier.name}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <MapPin size={12} /> {supplier.city}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs">
                                {supplier.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900">{supplier.contact}</div>
                              <div className="flex flex-col gap-1 mt-1">
                                <a href={\`tel:\${supplier.phone}\`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#F4C75B] transition-colors">
                                  <Phone size={12} /> {supplier.phone}
                                </a>
                                <a href={\`mailto:\${supplier.email}\`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#F4C75B] transition-colors">
                                  <Mail size={12} /> {supplier.email}
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                          <button onClick={() => { setSelectedSupplier(supplier); setIsEditSupplierModalOpen(true); }} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Modifier</button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              Aucun fournisseur enregistré.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>`;

const uiReplacement = `                {/* Suppliers List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Rechercher un fournisseur..." 
                        value={supplierSearchQuery}
                        onChange={(e) => setSupplierSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C75B] focus:ring-2 focus:ring-[#F4C75B]/20 transition-all bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fournisseurs
                      .filter(s => {
                        const q = supplierSearchQuery.toLowerCase();
                        return (s.name || s.nom || '').toLowerCase().includes(q) || 
                               (s.category || s.categorie || '').toLowerCase().includes(q) ||
                               (s.contact || '').toLowerCase().includes(q);
                      })
                      .map((supplier, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{supplier.name || supplier.nom}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <MapPin size={14} /> {supplier.city || 'Ville non précisée'}
                            </div>
                          </div>
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                            {supplier.category || supplier.categorie}
                          </span>
                        </div>
                        
                        <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <User size={16} className="text-gray-400" />
                            <span className="font-medium">{supplier.contact || 'Contact non renseigné'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={16} className="text-gray-400" />
                            <a href={\`tel:\${supplier.phone || supplier.telephone}\`} className="text-blue-600 hover:underline">
                              {supplier.phone || supplier.telephone || 'Non renseigné'}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={16} className="text-gray-400" />
                            <a href={\`mailto:\${supplier.email}\`} className="text-blue-600 hover:underline truncate">
                              {supplier.email || 'Non renseigné'}
                            </a>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 flex justify-end">
                          <button 
                            onClick={() => { setSelectedSupplier(supplier); setIsEditSupplierModalOpen(true); }} 
                            className="px-4 py-2 text-sm font-medium text-[#265C6D] bg-[#F4C75B]/20 hover:bg-[#F4C75B]/40 rounded-lg transition-colors w-full text-center"
                          >
                            Modifier les informations
                          </button>
                        </div>
                      </div>
                    ))}
                    {fournisseurs.length === 0 && (
                      <div className="col-span-full py-12 text-center bg-white border border-gray-200 rounded-xl">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <User size={24} className="text-gray-400" />
                        </div>
                        <h4 className="text-gray-900 font-medium mb-1">Aucun fournisseur</h4>
                        <p className="text-gray-500 text-sm">Vous n'avez pas encore ajouté de fournisseurs.</p>
                      </div>
                    )}
                  </div>
                </div>`;

if (code.includes(uiTarget)) {
  code = code.replace(uiTarget, uiReplacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Successfully patched UI logic');
} else {
  console.error('Target not found in App.tsx');
}
