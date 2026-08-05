const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

const badPart = `<td className="px-4 py-4">
                      <select 
                        value={item.zone}
                        onChange={e => handleItemChange(idx, 'zone', e.target.value)}
                        className="w-full text-xs rounded-lg border-gray-200 focus:border-[#265C6D] focus:ring-[#265C6D]"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="economat">Économat</option>
                        <option value="chambre_froide">Chambre Froide</option>
                        <option value="cave">Cave</option>
                        <option value="consommables">Consommables</option>
                      </select>
                    </td>`;

content = content.replace(badPart, '');

const targetStr = `onChange={e => handleItemChange(idx, 'qualityOk', e.target.checked)}
                        className="w-5 h-5 text-[#265C6D] rounded border-gray-300 focus:ring-[#265C6D] cursor-pointer mx-auto block"
                      />
                    </td>
                  </tr>`;

const replacementStr = `onChange={e => handleItemChange(idx, 'qualityOk', e.target.checked)}
                        className="w-5 h-5 text-[#265C6D] rounded border-gray-300 focus:ring-[#265C6D] cursor-pointer mx-auto block"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <select 
                        value={item.zone}
                        onChange={e => handleItemChange(idx, 'zone', e.target.value)}
                        className="w-full text-xs rounded-lg border-gray-200 focus:border-[#265C6D] focus:ring-[#265C6D]"
                      >
                        <option value="">(Automatique)</option>
                        <option value="economat">Économat</option>
                        <option value="chambre_froide">Chambre Froide</option>
                        <option value="cave">Cave</option>
                        <option value="consommables">Consommables</option>
                      </select>
                    </td>
                  </tr>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
