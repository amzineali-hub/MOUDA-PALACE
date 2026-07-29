const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const target1 = `              const supplierId = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              const articles = formData.get('articles') as string;
              
              const selectedSupplier = fournisseurs.find(f => f.id === supplierId);`;

const replacement1 = `              const supplierId = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              const articles = formData.get('articles') as string;
              const quantite = formData.get('quantite') as string;
              const categorie = formData.get('categorie') as string;
              
              const selectedSupplier = fournisseurs.find(f => f.id === supplierId);`;

const target2 = `                  items: articles.split(',').length,
                  articles,
                  createdAt: serverTimestamp()
              };`;

const replacement2 = `                  items: articles.split(',').length,
                  articles,
                  quantite,
                  categorie,
                  createdAt: serverTimestamp()
              };`;

const target3 = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Articles</label>
                <textarea name="articles" required rows={3} placeholder="Ex: Safran 500g, Huile d'olive 20L..." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none"></textarea>
              </div>`;

const replacement3 = `              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie d'achat</label>
                  <input name="categorie" type="text" placeholder="Ex: Alimentaire" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Totale</label>
                  <input name="quantite" type="text" placeholder="Ex: 50 kg" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Articles</label>
                <textarea name="articles" required rows={3} placeholder="Ex: Safran 500g, Huile d'olive 20L..." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none"></textarea>
              </div>`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);
content = content.replace(target3, replacement3);

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
