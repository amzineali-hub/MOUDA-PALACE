const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const search = `              const categorie = formData.get('categorie') as string;
              
              // gather selected items
              const selectedProducts: any[] = [];
              let computedTotal = 0;
              Object.entries(orderSelections).forEach(([itemId, selection]) => {
                if (selection.checked) {
                  const item = inventoryItems.find(i => i.id === itemId);
                  if (item) {
                    const price = parseFloat(selection.price || item.unitPrice || '0');
                    const qty = parseFloat(selection.qty || '1');
                    computedTotal += (price * qty);
                    selectedProducts.push({
                      id: item.id,
                      name: item.name,
                      quantity: qty,
                      quantityOrdered: qty,
                      expectedPrice: price,
                      unit: item.unit
                    });
                  }
                }
              });

              if (selectedProducts.length === 0) {
                showToast("Veuillez sélectionner au moins un produit", "error");
                return;
              }

              
              
              const selectedSupplier = fournisseurs.find(f => f.id === supplierId);
              const supplierName = selectedSupplier ? selectedSupplier.nom : supplierId;
              
              const newCmd = {
                  id: selectedCommande ? selectedCommande.id : 'CMD-' + Date.now(),
                  fournisseur: supplierName,
                  fournisseurId: supplierId,
                  date: selectedCommande ? selectedCommande.date : new Date().toLocaleDateString('fr-FR'),
                  deliveryDate,
                  montant: selectedCommande ? selectedCommande.montant : \`\${computedTotal.toFixed(2)} MAD\`,
                  status: selectedCommande ? selectedCommande.status : 'En attente',
                  items: selectedProducts,
                  articles: selectedProducts.map(p => \`\${p.name} - \${p.quantity}\`).join(', '),
                  categorie,
                  createdAt: selectedCommande ? selectedCommande.createdAt : serverTimestamp()
              };`;

const replace = `              const categorie = formData.get('categorie') as string;
              const tva = parseFloat(formData.get('tva') as string || '20');
              
              // gather selected items
              const selectedProducts: any[] = [];
              let computedHT = 0;
              Object.entries(orderSelections).forEach(([itemId, selection]) => {
                if (selection.checked) {
                  const item = inventoryItems.find(i => i.id === itemId);
                  if (item) {
                    const price = parseFloat(selection.price || item.unitPrice || '0');
                    const qty = parseFloat(selection.qty || '1');
                    computedHT += (price * qty);
                    selectedProducts.push({
                      id: item.id,
                      name: item.name,
                      quantity: qty,
                      quantityOrdered: qty,
                      expectedPrice: price,
                      unit: item.unit
                    });
                  }
                }
              });

              if (selectedProducts.length === 0) {
                showToast("Veuillez sélectionner au moins un produit", "error");
                return;
              }

              const tvaAmount = (computedHT * tva) / 100;
              const computedTTC = computedHT + tvaAmount;
              
              const selectedSupplier = fournisseurs.find(f => f.id === supplierId);
              const supplierName = selectedSupplier ? selectedSupplier.nom : supplierId;
              
              const newCmd = {
                  id: selectedCommande ? selectedCommande.id : 'CMD-' + Date.now(),
                  fournisseur: supplierName,
                  fournisseurId: supplierId,
                  date: selectedCommande ? selectedCommande.date : new Date().toLocaleDateString('fr-FR'),
                  deliveryDate,
                  montantHT: selectedCommande ? selectedCommande.montantHT : computedHT,
                  tva: selectedCommande ? selectedCommande.tva : tva,
                  montant: selectedCommande ? selectedCommande.montant : \`\${computedTTC.toFixed(2)} MAD\`,
                  status: selectedCommande ? selectedCommande.status : 'En attente',
                  items: selectedProducts,
                  articles: selectedProducts.map(p => \`\${p.name} - \${p.quantity}\`).join(', '),
                  categorie,
                  createdAt: selectedCommande ? selectedCommande.createdAt : serverTimestamp()
              };`;

code = code.replace(search, replace);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
