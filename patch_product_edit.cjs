const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte (Min. Stock)</label>
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={selectedProduct.minStock} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                  <span className="text-gray-500 text-sm">{selectedProduct.unit}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur Préféré</label>
                <input type="text" defaultValue={selectedProduct.supplier} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                onClick={() => {
                  showToast(\`Paramètres mis à jour pour \${selectedProduct.name}\`);
                  setIsSettingsModalOpen(false);
                }}`;

const replacement = `            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input id="edit-cat" type="text" defaultValue={selectedProduct.category} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                  <div className="flex items-center gap-2">
                    <input id="edit-qty" type="number" step="0.01" defaultValue={selectedProduct.quantity} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte (Min. Stock)</label>
                <div className="flex items-center gap-2">
                  <input id="edit-min" type="number" defaultValue={selectedProduct.minStock} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                  <span className="text-gray-500 text-sm">{selectedProduct.unit}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur Préféré</label>
                <input id="edit-sup" type="text" defaultValue={selectedProduct.supplier} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                onClick={async () => {
                  const newCat = (document.getElementById('edit-cat') as HTMLInputElement)?.value;
                  const newQty = Number((document.getElementById('edit-qty') as HTMLInputElement)?.value);
                  const newMin = Number((document.getElementById('edit-min') as HTMLInputElement)?.value);
                  const newSup = (document.getElementById('edit-sup') as HTMLInputElement)?.value;
                  
                  if (selectedProduct.id && !selectedProduct.id.startsWith('INV00')) {
                    try {
                      await updateDoc(doc(db, 'inventoryItems', selectedProduct.id), {
                        category: newCat,
                        quantity: newQty,
                        minStock: newMin,
                        supplier: newSup,
                        updatedAt: serverTimestamp()
                      });
                      showToast(\`Paramètres mis à jour pour \${selectedProduct.name}\`);
                    } catch (err) {
                      console.error("Erreur update", err);
                      showToast("Erreur lors de la mise à jour", "error");
                    }
                  } else {
                    showToast(\`Paramètres simulés pour \${selectedProduct.name}\`);
                  }
                  setIsSettingsModalOpen(false);
                }}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
