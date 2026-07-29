const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldScannerUI = `            <div className="space-y-4">
              <div className="w-full aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <QrCode size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">Placez le QR Code ou le code barre ici</p>
                <p className="text-xs mt-1">La caméra va scanner automatiquement</p>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#DDA956] shadow-[0_0_8px_#DDA956] animate-scan"></div>
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
            </div>`;

const newScannerUI = `            <div className="space-y-4">
              <div className="w-full bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 overflow-hidden relative min-h-[300px]">
                <BarcodeScanner 
                  onResult={(decodedText) => {
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
            </div>`;

code = code.replace(oldScannerUI, newScannerUI);
fs.writeFileSync('src/App.tsx', code);
console.log("Scanner updated");
