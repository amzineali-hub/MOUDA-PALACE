const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. New Product Modal
const oldNewProduct = `<form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = formData.get('category') as string;
              const unit = formData.get('unit') as string;
              
              if (!categories.includes(category)) {
                setCategories([...categories, category]);
              }
              
              const newProduct = {
                id: \`INV-00\${stockItems.length + 1}\`,
                name,
                category,
                supplier: 'Non renseigné',
                quantity: 0,
                unit,
                minStock: 10
              };
              setStockItemsData([...stockItemsData, newProduct]);
              showToast("Produit ajouté avec succès");
              setIsAddModalOpen(false);
            }}>`;

const newNewProduct = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = formData.get('category') as string;
              const unit = formData.get('unit') as string;
              
              if (!categories.includes(category)) {
                setCategories([...categories, category]);
              }
              
              const newProduct = {
                name,
                category,
                supplier: 'Non renseigné',
                quantity: 0,
                unit,
                minStock: 10,
                createdAt: serverTimestamp()
              };
              const optimisticProduct = { id: 'INV-' + Date.now(), ...newProduct };
              setStockItemsData([optimisticProduct, ...stockItemsData]);
              showToast("Produit ajouté avec succès");
              setIsAddModalOpen(false);
              
              try {
                await addDoc(collection(db, 'inventoryItems'), newProduct);
              } catch (err) {
                console.error("Error adding product", err);
              }
            }}>`;
            
content = content.replace(oldNewProduct, newNewProduct);

// 2. Transaction Modal
const oldTxModal = `<button 
                onClick={() => {
                  showToast(\`Transaction enregistrée pour \${selectedProduct.name}\`);
                  setIsTxModalOpen(false);
                }}
                className={\`w-full text-white py-3 rounded-xl font-medium mt-4 transition-colors \${
                  txType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }\`}
              >
                Confirmer la {txType === 'in' ? 'réception' : 'sortie'}
              </button>`;
              
const newTxModal = `<button 
                type="button"
                onClick={async () => {
                  const qtyInput = document.getElementById('tx-qty') as HTMLInputElement;
                  const reasonInput = document.getElementById('tx-reason') as HTMLInputElement;
                  const qty = Number(qtyInput?.value || 0);
                  const reason = reasonInput?.value || (txType === 'in' ? 'Entrée manuelle' : 'Sortie manuelle');
                  
                  if (qty <= 0) {
                    showToast("Veuillez saisir une quantité valide", "error");
                    return;
                  }
                  
                  const newTx = {
                    type: txType,
                    item: selectedProduct.name,
                    amount: qty,
                    unit: selectedProduct.unit,
                    reason,
                    date: new Date().toLocaleString('fr-FR'),
                    user: 'Admin',
                    createdAt: serverTimestamp()
                  };
                  
                  const newQuantity = txType === 'in' ? selectedProduct.quantity + qty : selectedProduct.quantity - qty;
                  
                  showToast(\`Transaction enregistrée pour \${selectedProduct.name}\`);
                  setIsTxModalOpen(false);
                  
                  try {
                    await addDoc(collection(db, 'inventoryTransactions'), newTx);
                    
                    if (selectedProduct.id && !selectedProduct.id.startsWith('INV-')) {
                       await updateDoc(doc(db, 'inventoryItems', selectedProduct.id), {
                         quantity: newQuantity
                       });
                    }
                  } catch (err) {
                    console.error("Error saving tx", err);
                  }
                }}
                className={\`w-full text-white py-3 rounded-xl font-medium mt-4 transition-colors \${
                  txType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }\`}
              >
                Confirmer la {txType === 'in' ? 'réception' : 'sortie'}
              </button>`;

content = content.replace(oldTxModal, newTxModal);

// In Tx Modal, need to add IDs to inputs
content = content.replace(/<input type="number" min="0" step="0\.1" className="w-full border border-gray-200 rounded-lg p-2\.5 focus:outline-none focus:border-\[\#DDA956\]" placeholder="0" \/>/,
  `<input id="tx-qty" type="number" min="0" step="0.1" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="0" />`);
content = content.replace(/<input type="text" className="w-full border border-gray-200 rounded-lg p-2\.5 focus:outline-none focus:border-\[\#DDA956\]" placeholder=\{txType === 'in' \? "Ex: Achat du jour" : "Ex: Service Cuisine"\} \/>/,
  `<input id="tx-reason" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder={txType === 'in' ? "Ex: Achat du jour" : "Ex: Service Cuisine"} />`);


fs.writeFileSync('src/App.tsx', content);
