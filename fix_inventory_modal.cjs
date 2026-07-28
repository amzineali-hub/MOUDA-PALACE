const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetModal = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raison / Commentaire</label>
                <input id="tx-reason" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder={txType === 'in' ? "Ex: Achat du jour" : "Ex: Service Cuisine"} />
              </div>
              <button 
                onClick={async () => {
                  const qtyInput = document.getElementById('tx-qty') as HTMLInputElement;
                  const reasonInput = document.getElementById('tx-reason') as HTMLInputElement;
                  const qty = Number(qtyInput?.value || 0);`;

const replaceModal = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raison / Commentaire</label>
                <input id="tx-reason" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder={txType === 'in' ? "Ex: Achat du jour" : "Ex: Service Cuisine"} />
              </div>
              {txType === 'in' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                    <input id="tx-supplier" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Marché Central" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix U. (MAD)</label>
                    <input id="tx-price" type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="0.00" />
                  </div>
                </div>
              )}
              <button 
                onClick={async () => {
                  const qtyInput = document.getElementById('tx-qty') as HTMLInputElement;
                  const reasonInput = document.getElementById('tx-reason') as HTMLInputElement;
                  const supplierInput = document.getElementById('tx-supplier') as HTMLInputElement;
                  const priceInput = document.getElementById('tx-price') as HTMLInputElement;
                  
                  const qty = Number(qtyInput?.value || 0);`;

const targetSave = `                    await addDoc(collection(db, 'inventoryTransactions'), {
                      itemId: selectedProduct.id,
                      itemName: selectedProduct.name,
                      type: txType,
                      quantity: qty,
                      reason: reasonInput?.value || '',
                      createdAt: serverTimestamp()
                    });`;

const replaceSave = `                    const txData: any = {
                      itemId: selectedProduct.id,
                      itemName: selectedProduct.name,
                      type: txType,
                      quantity: qty,
                      reason: reasonInput?.value || '',
                      date: new Date().toLocaleDateString('fr-FR'),
                      user: 'Admin',
                      amount: qty, // legacy support
                      unit: selectedProduct.unit, // legacy support
                      item: selectedProduct.name, // legacy support
                      createdAt: serverTimestamp()
                    };
                    
                    if (txType === 'in') {
                      txData.supplier = supplierInput?.value || '';
                      txData.unitPrice = Number(priceInput?.value || 0);
                    }
                    
                    await addDoc(collection(db, 'inventoryTransactions'), txData);`;

if (code.includes(targetModal) && code.includes(targetSave)) {
  code = code.replace(targetModal, replaceModal);
  code = code.replace(targetSave, replaceSave);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated transaction modal and save logic");
} else {
  console.log("Could not find modal or save target");
}
