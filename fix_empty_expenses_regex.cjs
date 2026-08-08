const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const regex = /\}\)\}\s*<\/tbody>\s*<\/table>\s*<\/div>\s*\)\}\s*\{\/\* Déclaration TVA \*\/\}/g;
const replacement = `})}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Aucune dépense trouvée. Les achats apparaîtront ici.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Déclaration TVA */}`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/Accounting.tsx', code);
