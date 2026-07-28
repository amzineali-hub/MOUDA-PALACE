const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// 1. Add states
const stateSearch = "const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);";
const stateReplace = "const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);\n  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);\n  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);";
code = code.replace(stateSearch, stateReplace);

// 2. Add onClick to Edit button
const editBtnSearch = `                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Éditer
                      </button>
                    </td>`;
const editBtnReplace = `                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedFournisseur(fournisseur); setIsEditSupplierModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Éditer
                      </button>
                    </td>`;
code = code.replace(editBtnSearch, editBtnReplace);

// 3. Add Edit modal right after New Supplier modal
const newSupplierModalSearch = `{/* Modal Nouveau Fournisseur */}`;
const editSupplierModalStr = `{/* Modal Edit Fournisseur */}
      {isEditSupplierModalOpen && selectedFournisseur && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsEditSupplierModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Éditer Fournisseur</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nom = formData.get('nom') as string;
              const categorie = formData.get('categorie') as string;
              const contact = formData.get('contact') as string;
              const tel = formData.get('tel') as string;
              const email = formData.get('email') as string;
              
              const updatedFournisseur = {
                  ...selectedFournisseur,
                  nom,
                  categorie,
                  contact,
                  tel,
                  email
              };
              
              setFournisseurs(fournisseurs.map(f => f.id === selectedFournisseur.id ? updatedFournisseur : f));
              showToast("Fournisseur mis à jour avec succès");
              setIsEditSupplierModalOpen(false);
              
              try {
                if (selectedFournisseur.fbId) {
                  await updateDoc(doc(db, 'fournisseurs', selectedFournisseur.fbId), updatedFournisseur);
                }
              } catch (err) {
                console.error("Error updating fournisseur", err);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input name="nom" defaultValue={selectedFournisseur.nom} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select name="categorie" defaultValue={selectedFournisseur.categorie} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white max-h-48 overflow-y-auto">
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="Fruits & Légumes">Fruits & Légumes</option>
                  <option value="Viandes & Volailles">Viandes & Volailles</option>
                  <option value="Poissons & Fruits de mer">Poissons & Fruits de mer</option>
                  <option value="Épices & Safran">Épices & Safran</option>
                  <option value="Épicerie & Sec">Épicerie & Sec</option>
                  <option value="Produits Laitiers">Produits Laitiers</option>
                  <option value="Boissons">Boissons</option>
                  <option value="Nettoyage & Hygiène">Nettoyage & Hygiène</option>
                  <option value="Emballages">Emballages</option>
                  <option value="Matériel Cuisine">Matériel Cuisine</option>
                  <option value="Services Extérieurs">Services Extérieurs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label>
                <input name="contact" defaultValue={selectedFournisseur.contact} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input name="tel" defaultValue={selectedFournisseur.tel || ''} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" defaultValue={selectedFournisseur.email || ''} type="email" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button type="submit" className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-black transition-colors">
                Mettre à jour
              </button>
            </form>
          </div>
        </div>
      )}\n\n      `;
code = code.replace(newSupplierModalSearch, editSupplierModalStr + newSupplierModalSearch);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
console.log("Fixed edits");
