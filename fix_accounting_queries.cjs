const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

// Fix invoices query
code = code.replace(
  "onSnapshot(query(collection(db, 'invoices'), orderBy('createdAt', 'desc')), (snapshot) => {",
  "onSnapshot(collection(db, 'invoices'), (snapshot) => {"
);
code = code.replace(
  "setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));",
  "setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));"
);

// Fix receipts query
code = code.replace(
  "onSnapshot(query(collection(db, 'cash_receipts'), orderBy('createdAt', 'desc')), (snapshot) => {",
  "onSnapshot(collection(db, 'cash_receipts'), (snapshot) => {"
);
code = code.replace(
  "setReceipts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));",
  "setReceipts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));"
);

// Fix expenses query
code = code.replace(
  "onSnapshot(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')), (snapshot) => {",
  "onSnapshot(collection(db, 'expenses'), (snapshot) => {"
);
code = code.replace(
  "setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));",
  "setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));"
);

// Fix reports query
code = code.replace(
  "onSnapshot(query(collection(db, 'financialReports'), orderBy('createdAt', 'desc')), (snapshot) => {",
  "onSnapshot(collection(db, 'financialReports'), (snapshot) => {"
);
code = code.replace(
  "setFinancialReports(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));",
  "setFinancialReports(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));"
);

fs.writeFileSync('src/Accounting.tsx', code);
