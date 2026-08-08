const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const staticDataSearch = `  const monthlyRevenueData = [
    { name: 'Juin', revenus: 85000, depenses: 32000 },
    { name: 'Juil', revenus: 110000, depenses: 45000 },
    { name: 'Août', revenus: 135000, depenses: 51000 },
    { name: 'Sept', revenus: 95000, depenses: 38000 },
    { name: 'Oct', revenus: 105000, depenses: 40000 },
    { name: 'Nov', revenus: 124500, depenses: 42800 },
  ];

  const expensesByCategoryData = [
    { name: 'Marchandise', value: 45000 },
    { name: 'Salaires', value: 35000 },
    { name: 'Loyer & Charges', value: 15000 },
    { name: 'Marketing', value: 5000 },
    { name: 'Divers', value: 2500 },
  ];
  const COLORS = ['#F4C75B', '#1A1A1A', '#4b5563', '#9ca3af', '#e5e7eb'];`;

const dynamicDataReplace = `
  const monthlyRevenueData = useMemo(() => {
    const data = {};
    const months = ['Janv', 'Fév', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mName = months[past.getMonth()];
      data[\`\${past.getFullYear()}-\${past.getMonth()}\`] = { name: mName, revenus: 0, depenses: 0, sortKey: past.getTime() };
    }

    receipts.forEach(r => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.date || Date.now());
      const key = \`\${date.getFullYear()}-\${date.getMonth()}\`;
      if (data[key]) {
        data[key].revenus += parseFloat(r.amount) || 0;
      }
    });

    expenses.forEach(e => {
      const date = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.date || Date.now());
      const key = \`\${date.getFullYear()}-\${date.getMonth()}\`;
      if (data[key]) {
        data[key].depenses += parseFloat(e.amount) || 0;
      }
    });

    return Object.values(data).sort((a,b) => a.sortKey - b.sortKey);
  }, [receipts, expenses]);

  const expensesByCategoryData = useMemo(() => {
    const categories = {};
    expenses.forEach(e => {
      const cat = e.category || 'Divers';
      categories[cat] = (categories[cat] || 0) + (parseFloat(e.amount) || 0);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [expenses]);
  
  const COLORS = ['#F4C75B', '#1A1A1A', '#4b5563', '#9ca3af', '#e5e7eb', '#8b5cf6', '#ef4444', '#10b981'];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthRevenue = receipts.reduce((sum, r) => {
    const d = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.date || Date.now());
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) return sum + (parseFloat(r.amount) || 0);
    return sum;
  }, 0);
  const lastMonthRevenue = receipts.reduce((sum, r) => {
    const d = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.date || Date.now());
    if (d.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1) && d.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear)) return sum + (parseFloat(r.amount) || 0);
    return sum;
  }, 0);
  const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 100;

  const currentMonthExpenses = expenses.reduce((sum, e) => {
    const d = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.date || Date.now());
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) return sum + (parseFloat(e.amount) || 0);
    return sum;
  }, 0);
  const lastMonthExpenses = expenses.reduce((sum, e) => {
    const d = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.date || Date.now());
    if (d.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1) && d.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear)) return sum + (parseFloat(e.amount) || 0);
    return sum;
  }, 0);
  const expensesGrowth = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 100;

  const pendingInvoicesTotal = invoices.filter(i => i.status === 'En attente' || i.status === 'Retard').reduce((sum, i) => sum + (parseFloat(i.amount.replace(/ /g, '')) || 0), 0);
  const pendingInvoicesCount = invoices.filter(i => i.status === 'En attente' || i.status === 'Retard').length;
`;

code = code.replace(staticDataSearch, dynamicDataReplace);

const staticWidget1Search = `<p className="text-3xl font-serif text-gray-900 mb-1">124 500 MAD</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp size={14} /> +12% vs mois dernier
          </p>`;
const dynamicWidget1Replace = `<p className="text-3xl font-serif text-gray-900 mb-1">{currentMonthRevenue.toLocaleString('fr-FR')} MAD</p>
          <p className={\`text-sm flex items-center gap-1 \${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
            {revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% vs mois dernier
          </p>`;
code = code.replace(staticWidget1Search, dynamicWidget1Replace);

const staticWidget2Search = `<p className="text-3xl font-serif text-gray-900 mb-1">42 800 MAD</p>
          <p className="text-sm text-red-600 flex items-center gap-1">
            <TrendingUp size={14} /> +5% vs mois dernier
          </p>`;
const dynamicWidget2Replace = `<p className="text-3xl font-serif text-gray-900 mb-1">{currentMonthExpenses.toLocaleString('fr-FR')} MAD</p>
          <p className={\`text-sm flex items-center gap-1 \${expensesGrowth <= 0 ? 'text-green-600' : 'text-red-600'}\`}>
            {expensesGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {expensesGrowth > 0 ? '+' : ''}{expensesGrowth.toFixed(1)}% vs mois dernier
          </p>`;
code = code.replace(staticWidget2Search, dynamicWidget2Replace);

const staticWidget3Search = `<p className="text-3xl font-serif text-gray-900 mb-1">7 700 MAD</p>
          <p className="text-sm text-gray-500">2 factures impayées</p>`;
const dynamicWidget3Replace = `<p className="text-3xl font-serif text-gray-900 mb-1">{pendingInvoicesTotal.toLocaleString('fr-FR')} MAD</p>
          <p className="text-sm text-gray-500">{pendingInvoicesCount} facture(s) impayée(s)</p>`;
code = code.replace(staticWidget3Search, dynamicWidget3Replace);

fs.writeFileSync('src/Accounting.tsx', code);
