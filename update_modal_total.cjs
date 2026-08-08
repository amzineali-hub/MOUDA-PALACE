const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const search = `                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#F4C75B] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#E5B745] transition-colors"
              >`;

const replace = `                </div>
              </div>
              {(() => {
                let computedHT = 0;
                Object.entries(orderSelections).forEach(([itemId, selection]) => {
                  if (selection.checked) {
                    const item = inventoryItems.find(i => i.id === itemId);
                    if (item) {
                      const price = parseFloat(selection.price || item.unitPrice || '0');
                      const qty = parseFloat(selection.qty || '1');
                      computedHT += (price * qty);
                    }
                  }
                });
                const tvaAmount = (computedHT * orderTvaRate) / 100;
                const computedTTC = computedHT + tvaAmount;
                return computedHT > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 mt-4 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Total HT</span>
                      <span>{computedHT.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>TVA ({orderTvaRate}%)</span>
                      <span>{tvaAmount.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex justify-between text-[#1A1A1A] font-bold text-base pt-2 border-t border-gray-200">
                      <span>Total TTC</span>
                      <span>{computedTTC.toFixed(2)} MAD</span>
                    </div>
                  </div>
                ) : null;
              })()}
              <button 
                type="submit"
                className="w-full bg-[#F4C75B] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#E5B745] transition-colors"
              >`;

code = code.replace(search, replace);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
