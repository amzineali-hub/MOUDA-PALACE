const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const searchWidget = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">`;
const replaceWidget = `
  const currentMonthProfit = currentMonthRevenue - currentMonthExpenses;
  const lastMonthProfit = lastMonthRevenue - lastMonthExpenses;
  const profitGrowth = lastMonthProfit !== 0 ? ((currentMonthProfit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100 : (currentMonthProfit > 0 ? 100 : 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">Facturation & Comptabilité</h2>
          <p className="text-gray-500">Gérez vos factures, suivez vos dépenses et analysez vos finances.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsFilterModalOpen(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium">
            <Filter size={18} />
            <span className="hidden sm:inline">Filtrer</span>
          </button>
          <button onClick={handleExportCSV} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium">
            <Download size={18} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button 
            onClick={() => {
              if (activeTab === 'invoices') setIsNewModalOpen(true);
              else if (activeTab === 'expenses') setIsNewExpenseModalOpen(true);
              else if (activeTab === 'receipts') setIsNewReceiptModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#333] transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">
              {activeTab === 'invoices' ? 'Nouvelle Facture' : activeTab === 'expenses' ? 'Nouvelle Dépense' : activeTab === 'receipts' ? 'Nouvel Encaissement' : 'Nouveau'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

const searchWholeBlock = `  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">Facturation & Comptabilité</h2>
          <p className="text-gray-500">Gérez vos factures, suivez vos dépenses et analysez vos finances.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsFilterModalOpen(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium">
            <Filter size={18} />
            <span className="hidden sm:inline">Filtrer</span>
          </button>
          <button onClick={handleExportCSV} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium">
            <Download size={18} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button 
            onClick={() => {
              if (activeTab === 'invoices') setIsNewModalOpen(true);
              else if (activeTab === 'expenses') setIsNewExpenseModalOpen(true);
              else if (activeTab === 'receipts') setIsNewReceiptModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#333] transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">
              {activeTab === 'invoices' ? 'Nouvelle Facture' : activeTab === 'expenses' ? 'Nouvelle Dépense' : activeTab === 'receipts' ? 'Nouvel Encaissement' : 'Nouveau'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">`;

code = code.replace(searchWholeBlock, replaceWidget);
fs.writeFileSync('src/Accounting.tsx', code);
