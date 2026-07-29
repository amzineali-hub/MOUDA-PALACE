const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add state for scanned barcode
code = code.replace(
  "const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);",
  "const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);\n  const [scannedBarcode, setScannedBarcode] = useState('');"
);

// Update barcode scanner onResult
const oldOnResult = `                  onResult={(decodedText) => {
                    console.log("Scanned code:", decodedText);
                    const existingProduct = stockItems.find(item => item.barcode === decodedText || item.sku === decodedText);
                    
                    setIsScannerModalOpen(false);
                    
                    if (existingProduct) {
                      showToast(\`Produit trouvé : \${existingProduct.name}\`, "success");
                      setIsTxModalOpen(true);
                      setSelectedProduct(existingProduct);
                      setTxType('in');
                    } else {
                      showToast(\`Nouveau code scanné : \${decodedText}. Redirection vers création...\`, "info");
                      setIsAutoCreateModalOpen(true);
                      // In a real app we might pass the barcode to the create modal
                    }
                  }}`;

const newOnResult = `                  onResult={(decodedText) => {
                    console.log("Scanned code:", decodedText);
                    const existingProduct = stockItems.find(item => item.barcode === decodedText || item.sku === decodedText || item.id === decodedText);
                    
                    setIsScannerModalOpen(false);
                    
                    if (existingProduct) {
                      showToast(\`Produit trouvé : \${existingProduct.name}\`, "success");
                      setIsTxModalOpen(true);
                      setSelectedProduct(existingProduct);
                      setTxType('in');
                    } else {
                      showToast(\`Nouveau code scanné : \${decodedText}. Redirection vers création...\`, "info");
                      setScannedBarcode(decodedText);
                      setIsAutoCreateModalOpen(true);
                    }
                  }}`;

code = code.replace(oldOnResult, newOnResult);

// Update AutoCreateModal button
const oldAutoCreateBtn = `              <button 
                onClick={() => {
                  showToast("Nouveau produit créé et entrée en stock enregistrée avec succès.");
                  setIsAutoCreateModalOpen(false);
                }}
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Valider la création automatique
              </button>`;

const newAutoCreateBtn = `              <button 
                onClick={async () => {
                  try {
                    const newProduct = {
                      name: "Cœur d'Artichaut Extra (Scanné)",
                      category: "Légumes",
                      quantity: 15,
                      unit: "kg",
                      minStock: 5,
                      barcode: scannedBarcode || 'SCANNED-' + Date.now(),
                      createdAt: serverTimestamp()
                    };
                    const docRef = await addDoc(collection(db, 'inventoryItems'), newProduct);
                    
                    await addDoc(collection(db, 'inventoryTransactions'), {
                      itemId: docRef.id,
                      itemName: newProduct.name,
                      type: 'in',
                      quantity: 15,
                      reason: 'Création auto via scan',
                      date: new Date().toLocaleDateString('fr-FR'),
                      user: 'Admin',
                      amount: 15,
                      unit: 'kg',
                      item: newProduct.name,
                      supplier: 'Coop Fès Primeurs',
                      createdAt: serverTimestamp()
                    });
                    
                    showToast("Nouveau produit créé et entrée en stock enregistrée avec succès.", "success");
                    setIsAutoCreateModalOpen(false);
                  } catch (e) {
                    console.error("Error creating from scan", e);
                    showToast("Erreur lors de la création", "error");
                  }
                }}
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors flex items-center justify-center gap-2"
              >
                Valider la création automatique
              </button>`;

code = code.replace(oldAutoCreateBtn, newAutoCreateBtn);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated AutoCreate logic");
