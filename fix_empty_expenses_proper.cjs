const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const search = `                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Déclaration TVA */}`;

const replace = `                ))}
                {expenses.length === 0 && (
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

code = code.replace(search, replace);
fs.writeFileSync('src/Accounting.tsx', code);
