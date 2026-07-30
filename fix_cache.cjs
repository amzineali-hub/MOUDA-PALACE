const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `function Overview({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { showToast } = useToast();
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);`;

const rep1 = `function Overview({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { showToast } = useToast();
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const metricsCache = useRef<Record<string, any>>({});
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metrics, setMetrics] = useState({
    users: "324",
    aov: "1,076 MAD",
    reservations: "42",
    revenue: "45,200 MAD",
    pos: "Actif",
    crm: "1,204",
    commissions: "3,450 MAD"
  });

  useEffect(() => {
    const cacheKey = dateRange === 'custom' ? \`\${customStartDate}-\${customEndDate}\` : dateRange;
    
    if (metricsCache.current[cacheKey]) {
      setMetrics(metricsCache.current[cacheKey]);
      showToast(\`Métriques \${cacheKey} chargées depuis le cache local\`);
      return;
    }

    setIsLoadingMetrics(true);
    
    // Simulate Firestore fetch
    const fetchTimeout = setTimeout(() => {
      let multiplier = 1;
      if (dateRange === 'week') multiplier = 7;
      if (dateRange === 'month') multiplier = 30;
      if (dateRange === 'year') multiplier = 365;
      if (dateRange === 'custom') multiplier = 3;

      const newMetrics = {
        users: (324 * multiplier + Math.floor(Math.random() * 50)).toLocaleString(),
        aov: (1076 + Math.floor(Math.random() * 100)).toLocaleString() + " MAD",
        reservations: (42 * multiplier + Math.floor(Math.random() * 10)).toString(),
        revenue: (45200 * multiplier + Math.floor(Math.random() * 1000)).toLocaleString() + " MAD",
        pos: "Actif",
        crm: (1204 + (multiplier > 1 ? Math.floor(Math.random() * 100) : 0)).toLocaleString(),
        commissions: (3450 * multiplier).toLocaleString() + " MAD"
      };

      metricsCache.current[cacheKey] = newMetrics;
      setMetrics(newMetrics);
      setIsLoadingMetrics(false);
      showToast(\`Nouvelles données \${cacheKey} récupérées depuis Firestore\`);
    }, 600);

    return () => clearTimeout(fetchTimeout);
  }, [dateRange, customStartDate, customEndDate, showToast]);`;

code = code.replace(target1, rep1);

fs.writeFileSync('src/App.tsx', code);
