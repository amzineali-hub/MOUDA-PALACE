const fs = require('fs');

// 1. Fix GestionTables.tsx
let gtContent = fs.readFileSync('src/GestionTables.tsx', 'utf8');
gtContent = gtContent.replace(
  'window.dispatchEvent(new CustomEvent("open-calendar"));',
  'sessionStorage.setItem("open-calendar", "true");'
);
gtContent = gtContent.replace(
  'window.dispatchEvent(new CustomEvent("open-floorplan"));',
  'sessionStorage.setItem("open-floorplan", "true");'
);
fs.writeFileSync('src/GestionTables.tsx', gtContent);

// 2. Fix App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
const effectCode = `  useEffect(() => {
    const handleOpenFloorplan = () => setActiveTab('floorplan');
    const handleOpenCalendar = () => setIsCalendarOpen(true);
    window.addEventListener('open-floorplan', handleOpenFloorplan);
    window.addEventListener('open-calendar', handleOpenCalendar);
    return () => {
      window.removeEventListener('open-floorplan', handleOpenFloorplan);
      window.removeEventListener('open-calendar', handleOpenCalendar);
    };
  }, []);
`;
appContent = appContent.replace(effectCode, "");

appContent = appContent.replace(
  "const [activeTab, setActiveTab] = useState('upcoming');",
  `const [activeTab, setActiveTab] = useState(() => {
    if (sessionStorage.getItem('open-floorplan')) {
      sessionStorage.removeItem('open-floorplan');
      return 'floorplan';
    }
    return 'upcoming';
  });`
);
appContent = appContent.replace(
  "const [isCalendarOpen, setIsCalendarOpen] = useState(false);",
  `const [isCalendarOpen, setIsCalendarOpen] = useState(() => {
    if (sessionStorage.getItem('open-calendar')) {
      sessionStorage.removeItem('open-calendar');
      return true;
    }
    return false;
  });`
);

fs.writeFileSync('src/App.tsx', appContent);
console.log("Done");
