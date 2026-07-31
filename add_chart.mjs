import fs from "fs";

let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* Recent Movements \*\/\}/;

const chartCode = `
      {/* Evolution du Chiffre d'Affaires */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 p-6">
        <div className="mb-6">
          <h3 className="font-serif text-lg font-medium text-gray-900">Évolution du Chiffre d'Affaires (Aujourd'hui)</h3>
          <p className="text-sm text-gray-500">Données en temps réel (MAD)</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { time: '08:00', ca: 0 },
                { time: '10:00', ca: 1200 },
                { time: '12:00', ca: 3500 },
                { time: '14:00', ca: 8900 },
                { time: '16:00', ca: 10500 },
                { time: '18:00', ca: 14500 }
              ]}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(val) => \`\${val} MAD\`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [\`\${value} MAD\`, "Chiffre d'affaires"]}
                labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="ca" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Movements */}`;

code = code.replace(regex, chartCode);
fs.writeFileSync('src/App.tsx', code);
console.log("Added chart.");
