const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

const targetEditOld = `                            const initialSelections: Record<string, {checked: boolean, qty: string}> = {};
                            if (cmd.articles) {
                              cmd.articles.split(', ').forEach((a: string) => {
                                const parts = a.split(' - ');
                                const name = parts[0];
                                const qty = parts[1] || '';
                                const item = inventoryItems.find(i => i.name === name);
                                if (item) {
                                  initialSelections[item.id] = { checked: true, qty };
                                }
                              });
                            }`;
const targetEditNew = `                            const initialSelections: Record<string, {checked: boolean, qty: string, price?: string}> = {};
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
                            }`;

content = content.replace(targetEditOld, targetEditNew);
fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log('Fixed edit button');
