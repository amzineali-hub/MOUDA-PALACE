const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const importRegex = /const \[fournisseurs, setFournisseurs\] = useState<any\[\]>\(\[\]\);/;
const injectState = `  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);
`;
code = code.replace(importRegex, injectState);

// Replace the <form> content of Nouvelle Commande
const modalFormRegex = /<form className="space-y-4" onSubmit=\{async \(e\) => \{[\s\S]*?<\/form>/;

const newModalForm = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const supplierId = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              
              // gather selected items
              const selectedProducts: string[] = [];
              document.querySelectorAll('.product-checkbox:checked').forEach((el: any) => {
                const qtyInput = document.getElementById(\`qty-\${el.value}\`) as HTMLInputElement;
                selectedProducts.push(\`\${el.dataset.name} - \${qtyInput?.value || '1'}\`);
              });

              if (selectedProducts.length === 0) {
                showToast("Veuillez sélectionner au moins un produit", "error");
                return;
              }

              const articles = selectedProducts.join(', ');
              
              const selectedSupplier = fournisseurs.find(f => f.id === supplierId);
              const supplierName = selectedSupplier ? selectedSupplier.nom : supplierId;

              const newCmd = {
                  id: 'CMD-' + Date.now(),
                  fournisseur: supplierName,
                  fournisseurId: supplierId,
                  date: new Date().toLocaleDateString('fr-FR'),
                  deliveryDate,
                  montant: '0 MAD',
                  status: 'En attente',
                  items: selectedProducts.length,
                  articles,
                  categorie: 'Multi-catégories',
                  createdAt: serverTimestamp()
              };
              
              setIsNewOrderModalOpen(false);
              showToast("Génération du bon de commande...");

              try {
                await addDoc(collection(db, 'commandes'), newCmd);

                // Generate HTML content for the Bon de Commande
                let printWindow = window.open('', '', 'width=800,height=900');
                if (printWindow) {
                  printWindow.document.write(\`
                    <html>
                      <head>
                        <title>Bon de Commande - \${supplierName}</title>
                        <style>
                          body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
                          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #DDA956; padding-bottom: 20px; }
                          .logo-text { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; }
                          .logo-sub { font-size: 14px; color: #666; letter-spacing: 4px; text-transform: uppercase; margin-top: 5px; }
                          .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                          .info { margin-bottom: 30px; line-height: 1.6; }
                          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                          th { background-color: #f8f9fa; font-weight: bold; }
                          .footer { text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; position: fixed; bottom: 40px; width: calc(100% - 80px); }
                          @media print { .no-print { display: none; } }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div class="logo-text">MOUDA PALACE</div>
                          <div class="logo-sub">Restaurant Traditionnel Marocain</div>
                        </div>
                        <div class="title">BON DE COMMANDE N° \${newCmd.id}</div>
                        
                        <div class="info">
                          <strong>Émetteur:</strong> Restaurant Mouda Palace<br>
                          <strong>Date d'émission:</strong> \${new Date().toLocaleDateString('fr-FR')}<br>
                          <strong>Fournisseur:</strong> \${supplierName}<br>
                          <strong>Date de livraison prévue:</strong> \${deliveryDate}<br>
                        </div>

                        <table>
                          <thead>
                            <tr>
                              <th>Désignation de l'article</th>
                              <th>Quantité</th>
                            </tr>
                          </thead>
                          <tbody>
                            \${selectedProducts.map(p => {
                              const parts = p.split(' - ');
                              return \`<tr><td>\${parts[0]}</td><td>\${parts[1] || ''}</td></tr>\`;
                            }).join('')}
                          </tbody>
                        </table>

                        <p>Merci de bien vouloir confirmer la réception de cette commande et respecter les délais de livraison convenus.</p>
                        
                        <div style="margin-top: 50px;">
                          <strong>Signature de la direction:</strong>
                        </div>

                        <div class="footer">
                          Restaurant Mouda Palace - Fès, Maroc | contact@moudapalace.com | Tél: +212 5 35 XX XX XX
                        </div>
                        <script>
                          window.onload = function() { window.print(); }
                        </script>
                      </body>
                    </html>
                  \`);
                  printWindow.document.close();
                }
              } catch (err) {
                console.error("Error adding order", err);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select name="supplier" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option value="">Sélectionnez un fournisseur</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison prévue</label>
                <input name="deliveryDate" type="date" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Articles à commander</label>
                <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100 bg-gray-50/50">
                  {inventoryItems.map(item => (
                    <div key={item.id} className="p-3 hover:bg-white transition-colors flex items-center justify-between gap-3">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input type="checkbox" value={item.id} data-name={item.name} className="product-checkbox w-4 h-4 text-[#DDA956] rounded border-gray-300 focus:ring-[#DDA956]" />
                        <span className="text-sm font-medium text-gray-900">{item.name} <span className="text-xs text-gray-500 font-normal ml-1">({item.category || 'Général'})</span></span>
                      </label>
                      <input type="text" id={\`qty-\${item.id}\`} placeholder={\`Qté (\${item.unit || 'u'})\`} className="w-24 text-sm border border-gray-200 rounded-md p-1.5 focus:outline-none focus:border-[#DDA956]" />
                    </div>
                  ))}
                  {inventoryItems.length === 0 && (
                     <div className="p-4 text-sm text-gray-500 text-center">Aucun produit dans l'inventaire</div>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Générer Bon de Commande
              </button>
            </form>`;

code = code.replace(modalFormRegex, newModalForm);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
