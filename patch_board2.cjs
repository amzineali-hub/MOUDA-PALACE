const fs = require('fs');
let code = fs.readFileSync('src/TableauDeBord.tsx', 'utf8');

const aggCode = `
  const revByDate = cashReceipts.reduce((acc, cr) => {
    const d = cr.date || 'Inconnu';
    if (!acc[d]) acc[d] = 0;
    acc[d] += Number(cr.amount) || 0;
    return acc;
  }, {});

  const evolutionData = Object.entries(revByDate)
    .sort((a, b) => {
      // sort dates assuming format like '07 oct. 2023' or '2023-10-07'
      // For simplicity, string sort or parse to Date if it works.
      // If dates are DD MMM YYYY, it's tricky, but let's just reverse or keep as is.
      // Actually, let's just sort by key if it's sortable, or use original order.
      const dateA = new Date(a[0]).getTime();
      const dateB = new Date(b[0]).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
      return a[0].localeCompare(b[0]);
    })
    .map(([date, revenue]) => ({
      name: date,
      CA: revenue
    }));
`;

code = code.replace("  return (", aggCode + "\n  return (");

fs.writeFileSync('src/TableauDeBord.tsx', code);
