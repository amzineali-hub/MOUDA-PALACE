const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const overviewRegex = /function Overview\(\{ setActiveTab \}: \{ setActiveTab: \(tab: string\) => void \}\) \{\n  const \{ showToast \} = useToast\(\);\n  const \[isSummaryModalOpen, setIsSummaryModalOpen\] = useState\(false\);/;
const overviewReplacement = `function Overview({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { showToast } = useToast();
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);`;

code = code.replace(overviewRegex, overviewReplacement);

const headerRegex = /<header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">\s*<div>\s*<h2 className="text-4xl font-serif text-white font-semibold mb-2 drop-shadow-md">Tableau de Bord<\/h2>\s*<p className="text-\[#FDFBF7\]\/90 text-lg drop-shadow-sm">Vue consolidée des activités du restaurant et des intégrations\.<\/p>\s*<\/div>\s*<div className="flex flex-wrap items-center gap-3">/;
const headerReplacement = `<header className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-serif text-white font-semibold mb-2 drop-shadow-md">Tableau de Bord</h2>
            <p className="text-[#FDFBF7]/90 text-lg drop-shadow-sm">Vue consolidée des activités du restaurant et des intégrations.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-white/20 shadow-sm mr-2">
              <Calendar className="text-gray-500 ml-2" size={16} />
              <div className="flex items-center text-gray-700 bg-transparent rounded-md overflow-hidden">
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-transparent border-none py-1 px-2 text-sm font-medium focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                  <option value="custom">Personnalisé</option>
                </select>
              </div>
              {dateRange === 'custom' && (
                <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                  <input 
                    type="date" 
                    value={customStartDate} 
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="border border-gray-200 rounded-md py-1 px-2 text-sm text-gray-700 outline-none focus:border-[#DDA956] bg-white"
                  />
                  <span className="text-gray-500 text-sm">-</span>
                  <input 
                    type="date" 
                    value={customEndDate} 
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border border-gray-200 rounded-md py-1 px-2 text-sm text-gray-700 outline-none focus:border-[#DDA956] bg-white"
                  />
                </div>
              )}
            </div>`;

code = code.replace(headerRegex, headerReplacement);
fs.writeFileSync('src/App.tsx', code);
