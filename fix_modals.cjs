const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const modalNewRegex = /\{\/\* Modal Nouveau Fournisseur \*\/\}[\s\S]*?<\/div>\s*\}\)\s*\s*<\/div>\s*\);\s*\}/;

const injection = `      {/* Modal Nouveau Fournisseur */}
      {isNewSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsNewSupplierModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Nouveau Fournisseur</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = formData.get('category') as string;
              const contact = formData.get('contact') as string;
              const phone = formData.get('phone') as string;
              const email = formData.get('email') as string;
              const city = formData.get('city') as string;
              
              const newFournisseur = {
                  name,
                  category,
                  contact,
                  phone,
                  email,
                  city,
                  createdAt: serverTimestamp()
              };
              
              showToast("Ajout en cours...");
              setIsNewSupplierModalOpen(false);
              try {
                await addDoc(collection(db, 'fournisseurs'), newFournisseur);
                showToast("Fournisseur ajouté avec succès");
              } catch (err) {
                console.error(err);
                showToast("Erreur lors de l'ajout", "error");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input name="name" type="text" required placeholder="Ex: Grossiste Bio Plus" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input name="category" type="text" required placeholder="Ex: Fruits & Légumes" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input name="city" type="text" required placeholder="Ex: Fès" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personne à contacter</label>
                <input name="contact" type="text" required placeholder="Ex: Ahmed" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" type="text" required placeholder="Ex: +212..." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" placeholder="Ex: contact@bioplus.ma" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Ajouter le Fournisseur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier Fournisseur */}
      {isEditSupplierModalOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsEditSupplierModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Modifier Fournisseur</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = formData.get('category') as string;
              const contact = formData.get('contact') as string;
              const phone = formData.get('phone') as string;
              const email = formData.get('email') as string;
              const city = formData.get('city') as string;
              
              const updatedData = {
                  name,
                  category,
                  contact,
                  phone,
                  email,
                  city
              };
              
              showToast("Modification en cours...");
              setIsEditSupplierModalOpen(false);
              try {
                if (selectedSupplier.id) {
                  await updateDoc(doc(db, 'fournisseurs', selectedSupplier.id), updatedData);
                  showToast("Fournisseur mis à jour avec succès");
                }
              } catch (err) {
                console.error(err);
                showToast("Erreur lors de la modification", "error");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input name="name" type="text" required defaultValue={selectedSupplier.name} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input name="category" type="text" required defaultValue={selectedSupplier.category} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input name="city" type="text" required defaultValue={selectedSupplier.city} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personne à contacter</label>
                <input name="contact" type="text" required defaultValue={selectedSupplier.contact} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" type="text" required defaultValue={selectedSupplier.phone} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" defaultValue={selectedSupplier.email} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors"
                >
                  Mettre à jour
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    if (window.confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) {
                      try {
                        setIsEditSupplierModalOpen(false);
                        if (selectedSupplier.id) {
                          await deleteDoc(doc(db, 'fournisseurs', selectedSupplier.id));
                          showToast("Fournisseur supprimé");
                        }
                      } catch (e) {
                        console.error(e);
                        showToast("Erreur lors de la suppression", "error");
                      }
                    }
                  }}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}`;

if (modalNewRegex.test(code)) {
    code = code.replace(modalNewRegex, injection);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success");
} else {
    console.log("Regex not found");
}

