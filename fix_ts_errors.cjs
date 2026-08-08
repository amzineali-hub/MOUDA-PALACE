const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const dynamicDataSearch = `
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
`;

const dynamicDataReplace = `
  const monthlyRevenueData = useMemo(() => {
    const data: Record<string, { name: string, revenus: number, depenses: number, sortKey: number }> = {};
    const months = ['Janv', 'Fév', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mName = months[past.getMonth()];
      data[\`\${past.getFullYear()}-\${past.getMonth()}\`] = { name: mName, revenus: 0, depenses: 0, sortKey: past.getTime() };
    }

    receipts.forEach((r: any) => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.date || Date.now());
      const key = \`\${date.getFullYear()}-\${date.getMonth()}\`;
      if (data[key]) {
        data[key].revenus += parseFloat(r.amount) || 0;
      }
    });

    expenses.forEach((e: any) => {
      const date = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.date || Date.now());
      const key = \`\${date.getFullYear()}-\${date.getMonth()}\`;
      if (data[key]) {
        data[key].depenses += parseFloat(e.amount) || 0;
      }
    });

    return Object.values(data).sort((a,b) => a.sortKey - b.sortKey);
  }, [receipts, expenses]);

  const expensesByCategoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const cat = e.category || 'Divers';
      categories[cat] = (categories[cat] || 0) + (parseFloat(e.amount) || 0);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [expenses]);
`;

code = code.replace(dynamicDataSearch, dynamicDataReplace);

// We also need to fix line 111 error: src/Accounting.tsx(111,31): error TS2339: Property 'name' does not exist on type 'unknown'.
// The error is in handleDownloadReport

const handleDownloadReportSearch = `    } else {
      csvContent += \`Mois;Revenus;Depenses\\n\`;
      monthlyRevenueData.forEach(data => {
        csvContent += \`\${data.name};\${data.revenus};\${data.depenses}\\n\`;
      });
    }`;

const handleDownloadReportReplace = `    } else {
      csvContent += \`Mois;Revenus;Depenses\\n\`;
      monthlyRevenueData.forEach((data: any) => {
        csvContent += \`\${data.name};\${data.revenus};\${data.depenses}\\n\`;
      });
    }`;
    
code = code.replace(handleDownloadReportSearch, handleDownloadReportReplace);

fs.writeFileSync('src/Accounting.tsx', code);
