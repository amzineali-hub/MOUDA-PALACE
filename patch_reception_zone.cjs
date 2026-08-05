const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

// In ValidateReceptionModal, add zone and subZone to the items state
const initialItemsTarget = `qualityOk: i.qualityOk !== undefined ? i.qualityOk : true
    }))`;
const initialItemsReplacement = `qualityOk: i.qualityOk !== undefined ? i.qualityOk : true,
      zone: i.zone || '',
      subZone: i.subZone || ''
    }))`;
content = content.replace(initialItemsTarget, initialItemsReplacement);

// Add zone column to the table header
const headerTarget = `<th className="px-4 py-3 font-medium text-center">Qualité OK?</th>`;
const headerReplacement = `<th className="px-4 py-3 font-medium text-center">Qualité OK?</th>
                  <th className="px-4 py-3 font-medium text-left">Zone d'affectation</th>`;
content = content.replace(headerTarget, headerReplacement);

// Add zone selector to the table body
const bodyTarget = `<td className="px-4 py-4 text-center">
                      <input 
                        type="checkbox"
                        checked={item.qualityOk}`;
const bodyReplacement = `<td className="px-4 py-4 text-center">
                      <input 
                        type="checkbox"
                        checked={item.qualityOk}`;
content = content.replace(bodyTarget, bodyReplacement);

const rowEndTarget = `</td>
                  </tr>`;
const rowEndReplacement = `</td>
                    <td className="px-4 py-4">
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
                    </td>
                  </tr>`;
content = content.replace(rowEndTarget, rowEndReplacement);

// We need to make sure we replace globally or just the first occurrence in the tbody
// Since we have multiple occurrences of </td></tr> in the file maybe? Let's use string replace with a specific regex or match exactly.
fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log("Patched Reception Zone Display partially");
