const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `              const unit = formData.get('unit') as string;
              
              if (!categories.includes(category)) {`;

const replacement1 = `              const unit = formData.get('unit') as string;
              const quantity = Number(formData.get('quantity') || 0);
              
              if (!categories.includes(category)) {`;

const target2 = `              const newProduct = {
                name,
                category,
                supplier: 'Non renseigné',
                quantity: 0,
                unit,
                minStock: 10,
                createdAt: serverTimestamp()
              };`;

const replacement2 = `              const newProduct = {
                name,
                category,
                supplier: 'Non renseigné',
                quantity: quantity,
                unit,
                minStock: 10,
                createdAt: serverTimestamp()
              };`;

const target3 = `                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select name="unit" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="unité">unité</option>
                  </select>
                </div>
              </div>`;

const replacement3 = `                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select name="unit" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="unité">unité</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Initiale</label>
                <input name="quantity" required type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 50" />
              </div>`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);
content = content.replace(target3, replacement3);

fs.writeFileSync('src/App.tsx', content);
