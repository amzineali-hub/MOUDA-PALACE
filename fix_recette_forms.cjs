const fs = require('fs');
let code = fs.readFileSync('src/Recettes.tsx', 'utf8');

const newFormRegex = /<form className="space-y-4" onSubmit=\{async \(e\) => \{[\s\S]*?Ajouter la Recette\s*<\/button>\s*<\/form>/;
const editFormRegex = /<form className="space-y-4" onSubmit=\{async \(e\) => \{[\s\S]*?Sauvegarder\s*<\/button>\s*<\/form>/;

const newFormReplacement = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                await addDoc(collection(db, 'recettes'), {
                  nom: formData.get('nom'),
                  categorie: formData.get('categorie'),
                  portion: formData.get('portion'),
                  temps: formData.get('temps'),
                  difficulte: formData.get('difficulte'),
                  cout: formData.get('cout') + ' MAD',
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input 
                    name="categorie" 
                    required 
                    list="recipe-categories-list"
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white" 
                    placeholder="Sélectionner ou saisir..." 
                  />
                  <datalist id="recipe-categories-list">
                    <option value="Plats" />
                    <option value="Entrées" />
                    <option value="Desserts" />
                    <option value="Boissons" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portion</label>
                  <input name="portion" required type="text" placeholder="Ex: 4 personnes" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps</label>
                  <input name="temps" required type="text" placeholder="Ex: 1h" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                  <select name="difficulte" required className="w-full border border-gray-200 rounded-lg p-2.5 bg-white">
                    <option value="Facile">Facile</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Difficile">Difficile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coût estimé (MAD)</label>
                  <input name="cout" required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Ajouter la Recette
              </button>
            </form>`;

const editFormReplacement = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const updatedData = {
                  nom: formData.get('nom'),
                  categorie: formData.get('categorie'),
                  portion: formData.get('portion'),
                  temps: formData.get('temps'),
                  difficulte: formData.get('difficulte'),
                  cout: formData.get('cout') + ' MAD',
                };
                if (selectedRecette.id && !selectedRecette.id.startsWith('R00')) {
                  await updateDoc(doc(db, 'recettes', selectedRecette.id), updatedData);
                } else {
                  // Fallback for mock items
                  setRecettes(prev => prev.map(r => r.id === selectedRecette.id ? { ...r, ...updatedData } : r));
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
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portion</label>
                  <input name="portion" defaultValue={selectedRecette.portion} required type="text" placeholder="Ex: 4 personnes" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps</label>
                  <input name="temps" defaultValue={selectedRecette.temps} required type="text" placeholder="Ex: 1h" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                  <select name="difficulte" defaultValue={selectedRecette.difficulte} required className="w-full border border-gray-200 rounded-lg p-2.5 bg-white">
                    <option value="Facile">Facile</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Difficile">Difficile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coût estimé (MAD)</label>
                  <input name="cout" defaultValue={typeof selectedRecette.cout === 'string' ? selectedRecette.cout.replace(/[^0-9.]/g, '') : selectedRecette.cout} required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Sauvegarder
              </button>
            </form>`;

code = code.replace(newFormRegex, newFormReplacement);
code = code.replace(editFormRegex, editFormReplacement);

fs.writeFileSync('src/Recettes.tsx', code);
