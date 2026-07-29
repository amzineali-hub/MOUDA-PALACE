const fs = require('fs');
let content = fs.readFileSync('src/Recettes.tsx', 'utf8');

content = content.replace(
  "const [isNewRecetteModalOpen, setIsNewRecetteModalOpen] = useState(false);\n  const { showToast } = useToast();",
  "const [isNewRecetteModalOpen, setIsNewRecetteModalOpen] = useState(false);\n  const [isEditRecetteModalOpen, setIsEditRecetteModalOpen] = useState(false);\n  const [selectedRecette, setSelectedRecette] = useState<any>(null);\n  const { showToast } = useToast();"
);

content = content.replace(
  '<button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Modifier">',
  '<button onClick={() => { setSelectedRecette(recette); setIsEditRecetteModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Modifier">'
);

const editModal = `
      {isEditRecetteModalOpen && selectedRecette && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsEditRecetteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Modifier Recette</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                if (selectedRecette.id && !selectedRecette.id.startsWith('R00')) {
                  await updateDoc(doc(db, 'recettes', selectedRecette.id), {
                    nom: formData.get('nom'),
                    categorie: formData.get('categorie'),
                    cout: Number(formData.get('cout')),
                    prix: Number(formData.get('prix')),
                    marge: Math.round(((Number(formData.get('prix')) - Number(formData.get('cout'))) / Number(formData.get('prix'))) * 100) || 0,
                    tempsPrep: formData.get('tempsPrep'),
                    chef: formData.get('chef')
                  });
                }
                showToast("Recette modifiée avec succès");
                setIsEditRecetteModalOpen(false);
              } catch (err) {
                console.error("Error updating recette", err);
                showToast("Erreur lors de la modification");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la recette</label>
                <input name="nom" defaultValue={selectedRecette.nom} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <input 
                  name="categorie" 
                  defaultValue={selectedRecette.categorie}
                  required 
                  list="recipe-categories-list"
                  className="w-full border border-gray-200 rounded-lg p-2.5 bg-white" 
                  placeholder="Sélectionner ou saisir..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coût (MAD)</label>
                  <input name="cout" defaultValue={selectedRecette.cout} required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
                  <input name="prix" defaultValue={selectedRecette.prix} required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps de prép.</label>
                  <input name="tempsPrep" defaultValue={selectedRecette.tempsPrep} required type="text" placeholder="Ex: 45 min" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chef</label>
                  <input name="chef" defaultValue={selectedRecette.chef} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Sauvegarder
              </button>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace(
  "</div>\n  );\n}",
  editModal + "\n    </div>\n  );\n}"
);

// We need to import X from lucide-react if it's not there
if (!content.includes('X, ') && !content.includes(', X')) {
  content = content.replace("Edit3 } from 'lucide-react';", "Edit3, X } from 'lucide-react';");
}

fs.writeFileSync('src/Recettes.tsx', content);
