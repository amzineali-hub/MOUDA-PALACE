const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

// Update Details Modal
const detailModalOld = `                    const articlesList = (selectedCommande.articles || '').split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0);
                    let totalGlobal = 0;
                    return (
                      <>
                        {articlesList.map((article: string, idx: number) => {
                          // Génération d'un prix unitaire mocké basé sur le nom de l'article pour avoir des données cohérentes
                          const unitPrice = (article.length * 5.5) + 15; 
                          const quantity = 1;
                          const total = unitPrice * quantity;
                          totalGlobal += total;
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 font-medium text-[#1A1A1A]">{article}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{unitPrice.toFixed(2)} DH</td>
                              <td className="px-4 py-3 text-right font-medium text-[#1A1A1A]">{total.toFixed(2)} DH</td>
                            </tr>
                          );
                        })}`;

const detailModalNew = `                    let totalGlobal = 0;
                    
                    const itemsToRender = Array.isArray(selectedCommande.items) ? selectedCommande.items : (selectedCommande.articles || '').split(',').map((a: string) => {
                      const parts = a.split(' - ');
                      return { name: parts[0], quantity: parseFloat(parts[1]) || 1, expectedPrice: 0 };
                    }).filter((i: any) => i.name.trim().length > 0);

                    return (
                      <>
                        {itemsToRender.map((item: any, idx: number) => {
                          const unitPrice = item.expectedPrice || item.price || 0; 
                          const quantity = item.quantity || item.quantityOrdered || 1;
                          const total = unitPrice * quantity;
                          totalGlobal += total;
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 font-medium text-[#1A1A1A]">{item.name}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{unitPrice.toFixed(2)} DH</td>
                              <td className="px-4 py-3 text-right font-medium text-[#1A1A1A]">{total.toFixed(2)} DH</td>
                            </tr>
                          );
                        })}`;

content = content.replace(detailModalOld, detailModalNew);

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log('Fixed details modal');
