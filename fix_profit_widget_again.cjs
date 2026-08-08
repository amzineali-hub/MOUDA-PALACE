const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const searchGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">`;
const replaceGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">`;

code = code.replace(searchGrid, replaceGrid);

const profitWidget = `
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Bénéfice (Mois)</h3>
            <div className={\`p-2 rounded-lg \${currentMonthProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}\`}>
              {currentMonthProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
          </div>
          <p className="text-3xl font-serif text-gray-900 mb-1">{currentMonthProfit.toLocaleString('fr-FR')} MAD</p>
          <p className={\`text-sm flex items-center gap-1 \${profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
            {profitGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {profitGrowth > 0 ? '+' : ''}{profitGrowth.toFixed(1)}% vs mois dernier
          </p>
        </div>
`;

if (!code.includes('Bénéfice (Mois)')) {
  // Add calculations if missing
  const searchGrowth = `  const pendingInvoicesTotal =`;
  const replaceGrowth = `
  const currentMonthProfit = currentMonthRevenue - currentMonthExpenses;
  const lastMonthProfit = lastMonthRevenue - lastMonthExpenses;
  const profitGrowth = lastMonthProfit !== 0 ? ((currentMonthProfit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100 : (currentMonthProfit > 0 ? 100 : 0);

  const pendingInvoicesTotal =`;
  code = code.replace(searchGrowth, replaceGrowth);

  // Inject widget before Factures en attente
  const searchFactures = `        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Factures en attente</h3>`;
  code = code.replace(searchFactures, profitWidget + searchFactures);
}

fs.writeFileSync('src/Accounting.tsx', code);
