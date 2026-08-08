const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const search = `                        <table>
                          <thead>
                            <tr>
                              <th>Désignation de l'article</th>
                              <th>Quantité</th>
                            </tr>
                          </thead>
                          <tbody>
                            \${selectedProducts.map(p => {
                              return \`<tr><td>\${p.name}</td><td>\${p.quantity} \${p.unit || ''}</td></tr>\`;
                            }).join('')}
                          </tbody>
                        </table>`;

const replace = `                        <table>
                          <thead>
                            <tr>
                              <th>Désignation de l'article</th>
                              <th>Quantité</th>
                              <th>Prix unitaire HT</th>
                              <th>Total HT</th>
                            </tr>
                          </thead>
                          <tbody>
                            \${selectedProducts.map(p => {
                              return \`<tr><td>\${p.name}</td><td>\${p.quantity} \${p.unit || ''}</td><td>\${parseFloat(p.expectedPrice || '0').toFixed(2)} MAD</td><td>\${(parseFloat(p.expectedPrice || '0') * parseFloat(p.quantity || '0')).toFixed(2)} MAD</td></tr>\`;
                            }).join('')}
                          </tbody>
                        </table>
                        
                        <div style="text-align: right; margin-top: 20px;">
                          <p><strong>Total HT:</strong> \${computedHT.toFixed(2)} MAD</p>
                          <p><strong>TVA (\${tva}%):</strong> \${tvaAmount.toFixed(2)} MAD</p>
                          <p style="font-size: 1.2em;"><strong>Total TTC:</strong> \${computedTTC.toFixed(2)} MAD</p>
                        </div>`;

code = code.replace(search, replace);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
