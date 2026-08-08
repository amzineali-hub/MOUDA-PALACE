const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const search = `              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison</label>
                  <input name="deliveryDate" type="date" required defaultValue={selectedCommande?.deliveryDate || ''} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie d'achat</label>
                  <input name="categorie" list="dl-prta6x-1" defaultValue={selectedCommande?.categorie || ''} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Alimentaire" />
                  <datalist id="dl-prta6x-1">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>`;

const replace = `              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison</label>
                  <input name="deliveryDate" type="date" required defaultValue={selectedCommande?.deliveryDate || ''} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie d'achat</label>
                  <input name="categorie" list="dl-prta6x-1" defaultValue={selectedCommande?.categorie || ''} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Alimentaire" />
                  <datalist id="dl-prta6x-1">
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TVA (%)</label>
                  <input name="tva" type="number" min="0" max="100" value={orderTvaRate} onChange={(e) => setOrderTvaRate(Number(e.target.value))} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
              </div>`;

code = code.replace(search, replace);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
