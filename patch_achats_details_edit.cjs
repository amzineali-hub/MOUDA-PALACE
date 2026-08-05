const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

const targetButtonsOld = `            <div className="flex justify-end gap-3">
              <button 
                onClick={async () => {
                  if (window.confirm('Voulez-vous vraiment supprimer cette commande ?')) {`;

const targetButtonsNew = `            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  const cmd = selectedCommande;
                  setIsDetailsModalOpen(false);
                  setProductSearch(''); 
                  const initialSelections: Record<string, {checked: boolean, qty: string, price?: string}> = {};
                  if (Array.isArray(cmd.items)) {
                    cmd.items.forEach((itemObj: any) => {
                      if (itemObj.id) {
                        initialSelections[itemObj.id] = { checked: true, qty: String(itemObj.quantity || 1), price: String(itemObj.expectedPrice || itemObj.price || 0) };
                      } else {
                        const item = inventoryItems.find(i => i.name === itemObj.name);
                        if (item) {
                          initialSelections[item.id] = { checked: true, qty: String(itemObj.quantity || 1), price: String(itemObj.expectedPrice || itemObj.price || 0) };
                        }
                      }
                    });
                  } else if (cmd.articles) {
                    cmd.articles.split(', ').forEach((a: string) => {
                      const parts = a.split(' - ');
                      const name = parts[0];
                      const qty = parts[1] || '';
                      const item = inventoryItems.find(i => i.name === name);
                      if (item) {
                        initialSelections[item.id] = { checked: true, qty };
                      }
                    });
                  }
                  setOrderSelections(initialSelections);
                  setIsNewOrderModalOpen(true); 
                }}
                className="px-4 py-2 text-[#265C6D] bg-[#F4C75B]/20 hover:bg-[#F4C75B]/30 rounded-lg font-medium transition-colors"
              >
                Éditer
              </button>
              <button 
                onClick={async () => {
                  if (window.confirm('Voulez-vous vraiment supprimer cette commande ?')) {`;

content = content.replace(targetButtonsOld, targetButtonsNew);
fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log('Fixed edit button in details modal');
