const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetAreaChart = `<AreaChart
                      data={recentTransactions.filter(tx => tx.type === 'in' && tx.unitPrice).map(tx => ({
                        date: tx.date,
                        prix: Number(tx.unitPrice) || 0,
                        fournisseur: tx.supplier || 'Inconnu',
                        produit: tx.item || tx.itemName || 'Produit'
                      })).reverse()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(val) => \`\${val} MAD\`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name, props) => [\`\${value} MAD\`, \`\${props.payload.produit} (\${props.payload.fournisseur})\`]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="prix" 
                        stroke="#F4C75B" 
                        strokeWidth={2}
                        fill="#F4C75B" 
                        fillOpacity={0.1}
                      />
                    </AreaChart>`;

const replacementBarChart = `<BarChart
                      data={recentTransactions.filter(tx => tx.type === 'in' && tx.unitPrice).map(tx => ({
                        date: tx.date,
                        prix: Number(tx.unitPrice) || 0,
                        fournisseur: tx.supplier || 'Inconnu',
                        produit: tx.item || tx.itemName || 'Produit'
                      })).reverse()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      barSize={40}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(val) => \`\${val} MAD\`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name, props) => [\`\${value} MAD\`, \`\${props.payload.produit} (\${props.payload.fournisseur})\`]}
                        cursor={{fill: '#f3f4f6'}}
                      />
                      <Bar 
                        dataKey="prix" 
                        fill="#F4C75B" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>`;

if (code.includes(targetAreaChart)) {
  code = code.replace(targetAreaChart, replacementBarChart);
  console.log('Fixed chart to BarChart');
} else {
  console.log('Target chart not found');
}

fs.writeFileSync('src/App.tsx', code);
