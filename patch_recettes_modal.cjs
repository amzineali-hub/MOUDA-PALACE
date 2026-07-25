const fs = require('fs');

let content = fs.readFileSync('src/Recettes.tsx', 'utf-8');

// Add state for modal
content = content.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [isNewRecetteModalOpen, setIsNewRecetteModalOpen] = useState(false);"
);

// Add click handler to button
content = content.replace(
  '<button className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-[#C89845] transition-colors shadow-sm">',
  '<button onClick={() => setIsNewRecetteModalOpen(true)} className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-[#C89845] transition-colors shadow-sm">'
);

// Add the modal at the end, right before the last closing div.
const lastDivIndex = content.lastIndexOf("</div>");
const modalCode = `
      {isNewRecetteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsNewRecetteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              x
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Nouvelle Recette</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                await addDoc(collection(db, 'recettes'), {
                  nom: formData.get('nom'),
                  categorie: formData.get('categorie'),
                  cout: Number(formData.get('cout')),
                  prix: Number(formData.get('prix')),
                  marge: Math.round(((Number(formData.get('prix')) - Number(formData.get('cout'))) / Number(formData.get('prix'))) * 100) || 0,
                  tempsPrep: formData.get('tempsPrep'),
                  chef: formData.get('chef'),
                  createdAt: serverTimestamp()
                });
                showToast("Recette ajoutée avec succès");
                setIsNewRecetteModalOpen(false);
              } catch (err) {
                console.error("Error adding recette", err);
                showToast("Erreur lors de l'ajout");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la recette</label>
                <input name="nom" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select name="categorie" required className="w-full border border-gray-200 rounded-lg p-2.5 bg-white">
                  <option value="Plats">Plats</option>
                  <option value="Entrées">Entrées</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Boissons">Boissons</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coût (MAD)</label>
                  <input name="cout" required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
                  <input name="prix" required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps de prép.</label>
                  <input name="tempsPrep" required type="text" placeholder="Ex: 45 min" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chef</label>
                  <input name="chef" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Ajouter la Recette
              </button>
            </form>
          </div>
        </div>
      )}
`;

content = content.slice(0, lastDivIndex) + modalCode + content.slice(lastDivIndex);

fs.writeFileSync('src/Recettes.tsx', content);
