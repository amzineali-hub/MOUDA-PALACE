const fs = require('fs');
let code = fs.readFileSync('src/TableauDeBord.tsx', 'utf8');

const placeholder = `<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Historique d'Évolution</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Connectez le module POS / Caisse pour visualiser l'évolution du chiffre d'affaires et croiser les ventes réelles avec la production.
            </p>
        </div>`;

const chartCode = `
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#265C6D]" />
            Historique d'Évolution (CA)
          </h3>
          <div className="flex-1 min-h-[300px]">
            {evolutionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#265C6D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#265C6D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} width={60} tickFormatter={(value) => \`\${value} DH\`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [\`\${value} MAD\`, 'Chiffre d\\'affaires']}
                  />
                  <Area type="monotone" dataKey="CA" stroke="#265C6D" strokeWidth={3} fillOpacity={1} fill="url(#colorCA)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Historique d'Évolution</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Connectez le module POS / Caisse pour visualiser l'évolution du chiffre d'affaires.
                </p>
              </div>
            )}
          </div>
        </div>
`;

if (code.includes(placeholder)) {
  code = code.replace(placeholder, chartCode);
  fs.writeFileSync('src/TableauDeBord.tsx', code);
  console.log('Replaced placeholder with chart');
} else {
  // Let's try to match with regex just in case whitespace is different
  const regex = /<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center">[\s\S]*?<\/div>/;
  const match = code.match(regex);
  if (match) {
    code = code.replace(match[0], chartCode);
    fs.writeFileSync('src/TableauDeBord.tsx', code);
    console.log('Replaced placeholder with chart (regex match)');
  } else {
    console.log('Could not find placeholder');
  }
}
