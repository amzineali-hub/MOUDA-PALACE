const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const expensesMapSearch = `{expenses
  .filter(e => (e.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.category || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.id || '').toLowerCase().includes(searchQuery.toLowerCase()))
  .filter(e => filterCategory ? e.category === filterCategory : true)
  .filter(e => filterSupplier ? e.supplier === filterSupplier : true)
  .filter(e => filterDate ? e.date === filterDate : true)
  .map((expense, idx) => (`

const filteredExpensesDecl = `
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => (e.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.category || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.id || '').toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(e => filterCategory ? e.category === filterCategory : true)
      .filter(e => filterSupplier ? e.supplier === filterSupplier : true)
      .filter(e => filterDate ? e.date === filterDate : true);
  }, [expenses, searchQuery, filterCategory, filterSupplier, filterDate]);
`;

// Insert the useMemo right before return (
if (!code.includes('filteredExpenses')) {
  code = code.replace(
    '  return (\n    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">',
    filteredExpensesDecl + '\n  return (\n    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">'
  );
  
  code = code.replace(expensesMapSearch, '{filteredExpenses.map((expense, idx) => (');
  
  const oldEmptyCheckSearch = `                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Aucune dépense trouvée. Les achats apparaîtront ici.
                    </td>
                  </tr>
                )}`;
  const oldEmptyCheckReplace = `                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Aucune dépense trouvée. Les achats apparaîtront ici.
                    </td>
                  </tr>
                )}`;
  code = code.replace(oldEmptyCheckSearch, oldEmptyCheckReplace);
}

fs.writeFileSync('src/Accounting.tsx', code);
