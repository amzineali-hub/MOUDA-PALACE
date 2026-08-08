const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

// Invoices
const filteredInvoicesDecl = `
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => (inv.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (inv.client || '').toLowerCase().includes(searchQuery.toLowerCase()) || (inv.ice || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [invoices, searchQuery]);
`;
if (!code.includes('filteredInvoices')) {
  code = code.replace(
    '  return (\n    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">',
    filteredInvoicesDecl + '\n  return (\n    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">'
  );
  code = code.replace(
    `{invoices.filter(inv => (inv.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (inv.client || '').toLowerCase().includes(searchQuery.toLowerCase()) || (inv.ice || '').toLowerCase().includes(searchQuery.toLowerCase())).map((invoice, idx) => (`,
    `{filteredInvoices.map((invoice, idx) => (`
  );
  code = code.replace(
    `                ))}
              </tbody>
            </table>
          </div>
        )}`,
    `                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Aucune facture trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}`
  );
}

// Receipts
const filteredReceiptsDecl = `
  const filteredReceipts = useMemo(() => {
    return receipts.filter(rec => (rec.displayId || '').toLowerCase().includes(searchQuery.toLowerCase()) || (rec.id || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [receipts, searchQuery]);
`;
if (!code.includes('filteredReceipts')) {
  code = code.replace(
    '  return (\n    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">',
    filteredReceiptsDecl + '\n  return (\n    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">'
  );
  code = code.replace(
    `{receipts.filter(rec => (rec.displayId || '').toLowerCase().includes(searchQuery.toLowerCase()) || (rec.id || '').toLowerCase().includes(searchQuery.toLowerCase())).map((receipt, idx) => (`,
    `{filteredReceipts.map((receipt, idx) => (`
  );
  code = code.replace(
    `                {receipts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Aucune recette caisse trouvée. Les encaissements du POS apparaîtront ici.
                    </td>
                  </tr>
                )}`,
    `                {filteredReceipts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Aucune recette caisse trouvée. Les encaissements du POS apparaîtront ici.
                    </td>
                  </tr>
                )}`
  );
}

fs.writeFileSync('src/Accounting.tsx', code);
