const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const search = `                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Déclaration TVA */}`;

const replace = `                  </tr>
                ))}
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

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/Accounting.tsx', code);
  console.log("Success");
} else {
  console.log("Failed to find search string");
}
