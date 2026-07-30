const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// Replace the input with a select
const inputCategoryTarget = `<input name="categorie" type="text" placeholder="Ex: Alimentaire" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />`;
const inputCategoryReplacement = `<select name="categorie" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Alimentaire">Alimentaire</option>
                    <option value="Boissons">Boissons</option>
                    <option value="Matériel">Matériel</option>
                    <option value="Fournitures">Fournitures</option>
                    <option value="Services">Services</option>
                    <option value="Autre">Autre</option>
                  </select>`;
code = code.replace(inputCategoryTarget, inputCategoryReplacement);

// Replace the submit handler in isNewOrderModalOpen
const submitRegex = /(<form className="space-y-4" onSubmit={async \(e\) => \{[\s\S]*?)(let fileContent = `BON DE COMMANDE\\n\\n`;[\s\S]*?link\.remove\(\);)([\s\S]*?\}\}>)/;
const replacementLogic = `
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
                          <strong>Catégorie d'achat:</strong> \${categorie}<br>
                        </div>
                        <table>
                          <thead>
                            <tr>
                              <th>Désignation de l'article</th>
                            </tr>
                          </thead>
                          <tbody>
                            \${articles.split(',').map(a => \`<tr><td>\${a.trim()}</td></tr>\`).join('')}
                          </tbody>
                        </table>

                        <p><strong>Quantité Totale estimée :</strong> \${quantite}</p>
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
`;
code = code.replace(submitRegex, '$1' + replacementLogic + '$3');

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
