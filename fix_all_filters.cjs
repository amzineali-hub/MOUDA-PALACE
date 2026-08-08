const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const invoiceSearch = `{invoices.map((invoice, idx) => (`;
const invoiceReplace = `{invoices.filter(inv => (inv.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (inv.client || '').toLowerCase().includes(searchQuery.toLowerCase()) || (inv.ice || '').toLowerCase().includes(searchQuery.toLowerCase())).map((invoice, idx) => (`;
code = code.replace(invoiceSearch, invoiceReplace);

const reportSearch = `{financialReports.map((report, idx) => (`;
const reportReplace = `{financialReports.filter(rpt => (rpt.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (rpt.type || '').toLowerCase().includes(searchQuery.toLowerCase())).map((report, idx) => (`;
code = code.replace(reportSearch, reportReplace);

const expensesSearch = `{expenses.filter(e => e.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) || e.category?.toLowerCase().includes(searchQuery.toLowerCase()) || e.id?.toLowerCase().includes(searchQuery.toLowerCase())).map((expense, idx) => (`;
const expensesReplace = `{expenses.filter(e => (e.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.category || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.id || '').toLowerCase().includes(searchQuery.toLowerCase())).map((expense, idx) => (`;
code = code.replace(expensesSearch, expensesReplace);

const receiptsSearch = `{receipts.filter(r => r.displayId?.toLowerCase().includes(searchQuery.toLowerCase()) || r.id?.toLowerCase().includes(searchQuery.toLowerCase()) || r.method?.toLowerCase().includes(searchQuery.toLowerCase())).map((receipt, idx) => (`;
const receiptsReplace = `{receipts.filter(r => (r.displayId || '').toLowerCase().includes(searchQuery.toLowerCase()) || (r.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (r.method || '').toLowerCase().includes(searchQuery.toLowerCase())).map((receipt, idx) => (`;
code = code.replace(receiptsSearch, receiptsReplace);

fs.writeFileSync('src/Accounting.tsx', code);
