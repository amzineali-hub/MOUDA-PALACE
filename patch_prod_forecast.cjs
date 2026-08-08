const fs = require('fs');
let code = fs.readFileSync('src/ProductionJournaliere.tsx', 'utf8');

const hookAnchor = `  const [subZones, setSubZones] = useState<any[]>([]);`;
const hookRep = `  const [subZones, setSubZones] = useState<any[]>([]);
  const [expectedCovers, setExpectedCovers] = useState(0);`;
code = code.replace(hookAnchor, hookRep);

const effectAnchor = `  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'subZones'), (snapshot) => {
      setSubZones(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);`;
const effectRep = `  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'subZones'), (snapshot) => {
      setSubZones(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    
    // Fetch today's reservations for forecast
    const unsubRes = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const todayStr = new Date().toISOString().split('T')[0];
      let covers = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // date format might be YYYY-MM-DD, HH:MM
        if (data.date && data.date.startsWith(todayStr) && data.status === 'Confirmé') {
          covers += parseInt(data.pax) || 0;
        }
      });
      setExpectedCovers(covers);
    });
    
    return () => {
      unsub();
      unsubRes();
    };
  }, []);`;
code = code.replace(effectAnchor, effectRep);

const renderAnchor = `        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#265C6D]/10 rounded-xl flex items-center justify-center text-[#265C6D]">
            <Activity size={24} />
          </div>`;
          
const renderRep = `        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-gradient-to-br from-[#265C6D] to-[#1a4250] p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Prévisions Couverts (Auj.)</p>
            <p className="text-2xl font-bold">{expectedCovers}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#265C6D]/10 rounded-xl flex items-center justify-center text-[#265C6D]">
            <ChefHat size={24} />
          </div>`;
          
code = code.replace(renderAnchor, renderRep);

// Since I removed one div, I have 5 cards now. Let's make sure I'm not duplicating Activity.
// Wait, the original first card was Activity for "Ordres en cours". Let's change the first card's icon to something else like Users or TrendingUp if we added expectedCovers.
fs.writeFileSync('src/ProductionJournaliere.tsx', code);
