const fs = require('fs');
let content = fs.readFileSync('src/Recettes.tsx', 'utf-8');

const oldForm = `<form className="space-y-4" onSubmit={async (e) => {
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps (min)</label>
                  <input name="tempsPrep" required type="number" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chef associé</label>
                  <input name="chef" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Créer la fiche
              </button>
            </form>`;

const newForm = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                await addDoc(collection(db, 'recettes'), {
                  nom: formData.get('nom'),
                  categorie: formData.get('categorie'),
                  cout: formData.get('cout') + ' MAD',
                  temps: formData.get('temps'),
                  portion: formData.get('portion'),
                  difficulte: formData.get('difficulte'),
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
                  <select name="categorie" required className="w-full border border-gray-200 rounded-lg p-2.5 bg-white">
                    <option value="Plats Principaux">Plats Principaux</option>
                    <option value="Entrées">Entrées</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Boissons">Boissons</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                  <select name="difficulte" required className="w-full border border-gray-200 rounded-lg p-2.5 bg-white">
                    <option value="Facile">Facile</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Difficile">Difficile</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coût estimé (MAD)</label>
                  <input name="cout" required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portion</label>
                  <input name="portion" required type="text" placeholder="Ex: 4 personnes" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temps</label>
                  <input name="temps" required type="text" placeholder="Ex: 1h 30m" className="w-full border border-gray-200 rounded-lg p-2.5" />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Créer la fiche technique
              </button>
            </form>`;

content = content.replace(oldForm, newForm);
fs.writeFileSync('src/Recettes.tsx', content);
