const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  const \[recentTransactions, setRecentTransactions\] = useState<any\[\]>\(\[\]\);/;

const inject = `  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const handleExportPDF = () => {
    let printWindow = window.open('', '', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(\`
        <html>
          <head>
            <title>État de l'Inventaire - Mouda Palace</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #DDA956; padding-bottom: 20px; }
              .logo-text { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; }
              .logo-sub { font-size: 14px; color: #666; letter-spacing: 4px; text-transform: uppercase; margin-top: 5px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
              .info { margin-bottom: 30px; line-height: 1.6; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .footer { text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; position: fixed; bottom: 40px; width: calc(100% - 80px); }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo-text">MOUDA PALACE</div>
              <div class="logo-sub">Restaurant Traditionnel Marocain</div>
            </div>
            <div class="title">RAPPORT D'INVENTAIRE</div>
            
            <div class="info">
              <strong>Date d'édition:</strong> \${new Date().toLocaleDateString('fr-FR')} à \${new Date().toLocaleTimeString('fr-FR')}<br>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Quantité Actuelle</th>
                  <th>Seuil Min.</th>
                  <th>Fournisseur</th>
                </tr>
              </thead>
              <tbody>
                \${filteredStockItems.map(item => \`
                  <tr>
                    <td>\${item.name}</td>
                    <td>\${item.category || '-'}</td>
                    <td>\${item.quantity || 0} \${item.unit || ''}</td>
                    <td>\${item.minStock || 0} \${item.unit || ''}</td>
                    <td>\${item.supplier || '-'}</td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>

            <div class="footer">
              Restaurant Mouda Palace - Fès, Maroc | contact@moudapalace.com | Tél: +212 5 35 XX XX XX
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      \`);
      printWindow.document.close();
    }
  };
`;

code = code.replace(regex, inject);
fs.writeFileSync('src/App.tsx', code);
