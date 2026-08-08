const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

const handleDeleteExpenseCode = `
  const handleDeleteExpense = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette dépense ?")) {
      try {
        await deleteDoc(doc(db, "expenses", id));
        showToast("Dépense supprimée avec succès");
      } catch (error) {
        console.error(error);
        showToast("Erreur lors de la suppression", "error");
      }
    }
  };
`;

code = code.replace(
  "const handleDeleteReceipt = async (id: string) => {",
  handleDeleteExpenseCode + "\n  const handleDeleteReceipt = async (id: string) => {"
);

// Replace the expense row actions
const expenseRowSearch = `<button onClick={() => { setSelectedExpense(expense); setIsExpenseModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Voir le justificatif">
                          <Eye size={16} />
                        </button>`;
                        
const expenseRowReplace = `<button onClick={() => { setSelectedExpense(expense); setIsExpenseModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Voir le justificatif">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => {
                          let printWindow = window.open('', '', 'width=800,height=900');
                          if (printWindow) {
                            printWindow.document.write(\`
                              <html>
                                <head>
                                  <title>Dépense \${expense.id}</title>
                                  <style>
                                    body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
                                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #F4C75B; padding-bottom: 20px; }
                                    .logo-text { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; }
                                    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
                                    table { w-full text-left border-collapse: collapse; width: 100%; margin-bottom: 40px; }
                                    th, td { padding: 15px; border-bottom: 1px solid #eee; }
                                    th { background-color: #f9fafb; font-weight: bold; }
                                    .total-row { font-weight: bold; font-size: 20px; background-color: #f9fafb; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <div class="logo-text">MOUDA PALACE</div>
                                    <div>FÈS</div>
                                  </div>
                                  <h2 style="text-align: center; margin-bottom: 30px;">DÉPENSE / ACHAT</h2>
                                  <div class="invoice-info">
                                    <div>
                                      <strong>N° Dépense:</strong> \${expense.id}<br>
                                      <strong>Date:</strong> \${expense.date}
                                    </div>
                                    <div style="text-align: right;">
                                      <strong>Bénéficiaire:</strong> \${expense.supplier || '-'}<br>
                                      <strong>Catégorie:</strong> \${expense.category}
                                    </div>
                                  </div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Description</th>
                                        <th style="text-align: right;">Montant</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>\${expense.description || expense.category}</td>
                                        <td style="text-align: right;">\${Number(expense.amount).toFixed(2)} MAD</td>
                                      </tr>
                                      <tr class="total-row">
                                        <td>Total</td>
                                        <td style="text-align: right;">\${Number(expense.amount).toFixed(2)} MAD</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <div style="text-align: center; color: #666; margin-top: 50px; font-size: 14px;">
                                    Méthode de paiement: \${expense.method}<br>
                                    Document généré le \${new Date().toLocaleDateString('fr-FR')}
                                  </div>
                                </body>
                              </html>
                            \`);
                            printWindow.document.close();
                            printWindow.focus();
                            setTimeout(() => {
                              printWindow.print();
                              printWindow.close();
                            }, 250);
                          }
                        }} className="p-1.5 text-gray-400 hover:text-green-500 transition-colors rounded-lg hover:bg-gray-100" title="Imprimer">
                          <Printer size={16} />
                        </button>
                        <button onClick={() => handleDeleteExpense(expense.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100" title="Supprimer">
                          <Trash2 size={16} />
                        </button>`;

code = code.replace(expenseRowSearch, expenseRowReplace);

if (!code.includes('Printer')) {
  code = code.replace("import { LayoutDashboard, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, FileText, Search, Plus, Filter, Download, CreditCard, Banknote, Building2, Upload, AlertCircle, Clock, Eye, Trash2, Pencil, Calendar, Save, CheckCircle2, X } from 'lucide-react';",
  "import { LayoutDashboard, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, FileText, Search, Plus, Filter, Download, CreditCard, Banknote, Building2, Upload, AlertCircle, Clock, Eye, Trash2, Pencil, Calendar, Save, CheckCircle2, X, Printer } from 'lucide-react';");
}

fs.writeFileSync('src/Accounting.tsx', code);
