const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetFormStart = `            <AutoSaveForm formId="add_product" className="space-y-4" onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {`;
const targetFormEnd = `                Ajouter à l'inventaire
              </button>
            </AutoSaveForm>`;

const targetCode = `            <AutoSaveForm formId="add_product" className="space-y-4" onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = normalizeCategory(formData.get('category') as string);
              const unit = formData.get('unit') as string;
              const quantity = Number(formData.get('quantity') || 0);
              const unitPrice = Number(formData.get('unitPrice') || 0);
              const expirationDate = formData.get('expirationDate') as string;
              
              if (!categories.includes(category)) {
                try {
                  await addDoc(collection(db, 'inventoryCategories'), { name: category });
                } catch (err) {
                  console.error("Error adding category", err);
                }
              }
              
              const newProduct = {
                name,
                category,
                supplier: 'Non renseigné',
                quantity: quantity,
                unit,
                unitPrice,
                minStock: 10,
                expirationDate: expirationDate || null,
                createdAt: serverTimestamp()
              };
              try {
                await addDoc(collection(db, 'inventoryItems'), newProduct);
                showToast("Produit ajouté avec succès");
                setIsAddModalOpen(false);
              } catch (err) {
                console.error("Error adding product", err);
                showToast("Erreur lors de l'ajout", "error");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                <input name="name" list="dl-v9oy8w-2" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Miel pur" />
                <datalist id="dl-v9oy8w-2">
                  {[
                    "Agneau", "Amandes", "Beurre", "Cannelle", "Carottes", "Citron confit", "Coriandre", "Courgettes", "Cumin", 
                    "Curcuma", "Dattes", "Farine", "Gingembre", "Huile d'olive", "Huile de tournesol", "Lait", "Miel pur", "Noix", 
                    "Oeufs", "Oignons", "Olives", "Persil", "Poivre noir", "Pommes de terre", "Poulet", "Safran", "Sel", "Semoule", 
                    "Sucre", "Tomates", "Viande de boeuf", "Viande hachée"
                  ].map(name => <option key={name} value={name} />)}
                  {Array.from(new Set(stockItemsData.map((item: any) => item.name)))
                    .filter((name: any) => ![
                      "Agneau", "Amandes", "Beurre", "Cannelle", "Carottes", "Citron confit", "Coriandre", "Courgettes", "Cumin", 
                      "Curcuma", "Dattes", "Farine", "Gingembre", "Huile d'olive", "Huile de tournesol", "Lait", "Miel pur", "Noix", 
                      "Oeufs", "Oignons", "Olives", "Persil", "Poivre noir", "Pommes de terre", "Poulet", "Safran", "Sel", "Semoule", 
                      "Sucre", "Tomates", "Viande de boeuf", "Viande hachée"
                    ].includes(name))
                    .sort()
                    .map((name: any, idx) => (
                      <option key={\`existing-\${idx}\`} value={name} />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input name="category" list="dl-add-cat" required type="text" placeholder="Sélectionner ou taper..." className="w-full border border-gray-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-[#F4C75B]" />
                  <datalist id="dl-add-cat">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select name="unit" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    <option value="kg">Kg</option>
                    <option value="g">G</option>
                    <option value="L">L</option>
                    <option value="cl">Cl</option>
                    <option value="ml">Ml</option>
                    <option value="pièce">Pièce</option>
                    <option value="boîte">Boîte</option>
                    <option value="bouteille">Bouteille</option>
                    <option value="sachet">Sachet</option>
                    <option value="carton">Carton</option>
                    <option value="botte">Botte</option>
                    <option value="cannette">Cannette</option>
                    <option value="bidon">Bidon</option>
                    <option value="plateau">Plateau</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Initiale</label>
                  <input name="quantity" required type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix Unitaire (MAD)</label>
                  <input name="unitPrice" type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 15.50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration (Optionnel)</label>
                <input name="expirationDate" type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#265C6D] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#2F6B7F] transition-colors"
              >
                Ajouter à l'inventaire
              </button>
            </AutoSaveForm>`;

const startIdx = content.indexOf(targetFormStart);
const endIdx = content.indexOf(targetFormEnd) + targetFormEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
  const newContent = content.substring(0, startIdx) + targetCode + content.substring(endIdx);
  fs.writeFileSync('src/App.tsx', newContent);
  console.log('Fixed unit price');
} else {
  console.log('Target form not found');
}
