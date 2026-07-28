const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const modalSearch = `              <button 
                onClick={() => {
                  showToast(\`Transaction enregistrée pour \${selectedProduct.name}\`);
                  setIsTxModalOpen(false);
                }}
                className={\`w-full py-3 rounded-xl font-medium mt-4 text-white transition-colors \${txType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}\`}
              >
                Valider {txType === 'in' ? "l'entrée" : "la sortie"}
              </button>`;

const modalReplace = `              <button 
                onClick={async () => {
                  const qtyInput = document.getElementById('tx-qty') as HTMLInputElement;
                  const reasonInput = document.getElementById('tx-reason') as HTMLInputElement;
                  const qty = Number(qtyInput?.value || 0);
                  if (qty <= 0) {
                    showToast("Veuillez entrer une quantité valide", "error");
                    return;
                  }
                  
                  try {
                    const newQuantity = txType === 'in' ? selectedProduct.quantity + qty : selectedProduct.quantity - qty;
                    
                    if (newQuantity < 0) {
                      showToast("Stock insuffisant pour cette sortie", "error");
                      return;
                    }

                    await updateDoc(doc(db, 'inventoryItems', selectedProduct.id), {
                      quantity: newQuantity,
                      updatedAt: serverTimestamp()
                    });

                    await addDoc(collection(db, 'inventoryTransactions'), {
                      itemId: selectedProduct.id,
                      itemName: selectedProduct.name,
                      type: txType,
                      quantity: qty,
                      reason: reasonInput?.value || '',
                      createdAt: serverTimestamp()
                    });

                    showToast(\`Transaction enregistrée avec succès\`);
                    setIsTxModalOpen(false);
                    if (qtyInput) qtyInput.value = '';
                    if (reasonInput) reasonInput.value = '';
                  } catch (err) {
                    console.error("Erreur lors de la transaction", err);
                    showToast("Erreur lors de la mise à jour du stock", "error");
                  }
                }}
                className={\`w-full py-3 rounded-xl font-medium mt-4 text-white transition-colors \${txType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}\`}
              >
                Valider {txType === 'in' ? "l'entrée" : "la sortie"}
              </button>`;

if (code.includes(modalSearch)) {
  code = code.replace(modalSearch, modalReplace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Stock transaction logic updated.");
} else {
  console.log("Could not find the button to replace.");
}
