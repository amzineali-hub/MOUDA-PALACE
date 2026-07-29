const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldScannerModal = `      {/* Scanner Modal */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Scanner Bon de Livraison</h3>
              <button onClick={() => setIsScannerModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="w-full bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 overflow-hidden relative min-h-[300px]">
                <BarcodeScanner 
                  onResult={(decodedText) => {
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
                  }} 
                  onError={(err) => {
                    // Ignore frequent read errors from html5-qrcode
                  }} 
                />
              </div>
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button 
                  onClick={() => {
                    showToast("Simulation : Code scanné avec succès");
                    setIsScannerModalOpen(false);
                    setIsTxModalOpen(true);
                    setSelectedProduct(stockItems[0]); // Simulate picking a product
                    setTxType('in');
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Simuler scan (Produit Existant)
                </button>
                <button 
                  onClick={() => {
                    showToast("IA: Extraction des données du nouveau produit...");
                    setIsScannerModalOpen(false);
                    setIsAutoCreateModalOpen(true);
                  }}
                  className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} className="text-[#DDA956]" />
                  Simuler scan (Nouveau Produit)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}`;

const newScannerModal = `      {/* Scanner Modal */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Scanner Bon de Livraison</h3>
              <button onClick={() => { setIsScannerModalOpen(false); setMultiScanItems([]); }} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button 
                onClick={() => setScanMode('single')}
                className={\`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors \${scanMode === 'single' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
              >
                Scan Unique
              </button>
              <button 
                onClick={() => setScanMode('multiple')}
                className={\`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors \${scanMode === 'multiple' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
              >
                Scan Multiple
              </button>
            </div>

            <div className="space-y-4">
              <div className="w-full bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 overflow-hidden relative min-h-[300px]">
                <BarcodeScanner 
                  onResult={(decodedText) => {
                    console.log("Scanned code:", decodedText);
                    const existingProduct = stockItems.find(item => item.barcode === decodedText || item.sku === decodedText || item.id === decodedText);
                    
                    if (scanMode === 'single') {
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
                    } else {
                      // Multiple scan mode
                      if (existingProduct) {
                        // Check if already in multiScanItems
                        setMultiScanItems(prev => {
                          const existingIdx = prev.findIndex(p => p.id === existingProduct.id);
                          if (existingIdx >= 0) {
                            const newItems = [...prev];
                            newItems[existingIdx].scanQty += 1;
                            showToast(\`Quantité +1 pour \${existingProduct.name}\`, "info");
                            return newItems;
                          } else {
                            showToast(\`Ajouté : \${existingProduct.name}\`, "success");
                            return [...prev, { ...existingProduct, scanQty: 1 }];
                          }
                        });
                      } else {
                        showToast(\`Produit inconnu ignoré en scan multiple: \${decodedText}\`, "error");
                      }
                    }
                  }} 
                  onError={(err) => {
                    // Ignore frequent read errors from html5-qrcode
                  }} 
                />
              </div>

              {scanMode === 'multiple' && multiScanItems.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Produits scannés ({multiScanItems.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                    {multiScanItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm bg-white px-2 py-1 rounded border border-gray-200">
                            {item.scanQty} {item.unit}
                          </span>
                          <button 
                            onClick={() => setMultiScanItems(prev => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        for (const item of multiScanItems) {
                          const newQuantity = item.quantity + item.scanQty;
                          await updateDoc(doc(db, 'inventoryItems', item.id), {
                            quantity: newQuantity,
                            updatedAt: serverTimestamp()
                          });
                          
                          await addDoc(collection(db, 'inventoryTransactions'), {
                            itemId: item.id,
                            itemName: item.name,
                            type: 'in',
                            quantity: item.scanQty,
                            reason: 'Scan multiple',
                            date: new Date().toLocaleDateString('fr-FR'),
                            user: 'Admin',
                            amount: item.scanQty,
                            unit: item.unit,
                            item: item.name,
                            createdAt: serverTimestamp()
                          });
                        }
                        showToast(\`Entrée en stock de \${multiScanItems.length} produits réussie\`);
                        setIsScannerModalOpen(false);
                        setMultiScanItems([]);
                      } catch (err) {
                        console.error("Erreur scan multiple", err);
                        showToast("Erreur lors de la mise à jour des stocks", "error");
                      }
                    }}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Valider l'entrée groupée
                  </button>
                </div>
              )}

              {scanMode === 'single' && (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <button 
                    onClick={() => {
                      showToast("Simulation : Code scanné avec succès");
                      setIsScannerModalOpen(false);
                      setIsTxModalOpen(true);
                      setSelectedProduct(stockItems[0]); // Simulate picking a product
                      setTxType('in');
                    }}
                    className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Simuler scan (Produit Existant)
                  </button>
                  <button 
                    onClick={() => {
                      showToast("IA: Extraction des données du nouveau produit...");
                      setIsScannerModalOpen(false);
                      setIsAutoCreateModalOpen(true);
                    }}
                    className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} className="text-[#DDA956]" />
                    Simuler scan (Nouveau Produit)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}`;

if (code.includes(oldScannerModal)) {
  code = code.replace(oldScannerModal, newScannerModal);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully replaced scanner modal code.");
} else {
  console.log("Could not find the exact string to replace.");
}

