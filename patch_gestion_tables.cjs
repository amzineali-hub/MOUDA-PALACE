const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  "return <GestionTables />;",
  "return <GestionTables setActiveTab={setActiveTab} />;"
);
// Also in Reservations add an effect to listen to events
let resStart = appContent.indexOf("function Reservations() {");
let resInsert = appContent.indexOf("const { showToast }", resStart) + 33;
const effectCode = `
  useEffect(() => {
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
appContent = appContent.slice(0, resInsert) + effectCode + appContent.slice(resInsert);
fs.writeFileSync('src/App.tsx', appContent);

let gtContent = fs.readFileSync('src/GestionTables.tsx', 'utf8');
gtContent = gtContent.replace(
  "export default function GestionTables() {",
  "export default function GestionTables({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {"
);
gtContent = gtContent.replace(
  '<button className="flex items-center gap-2 bg-white border border-gray-200 text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">',
  '<button onClick={() => { setActiveTab?.("reservations"); window.dispatchEvent(new CustomEvent("open-calendar")); }} className="flex items-center gap-2 bg-white border border-gray-200 text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">'
);
gtContent = gtContent.replace(
  '<button className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-[#C89845] transition-colors shadow-sm">',
  '<button onClick={() => { setActiveTab?.("reservations"); window.dispatchEvent(new CustomEvent("open-floorplan")); }} className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-[#C89845] transition-colors shadow-sm">'
);

fs.writeFileSync('src/GestionTables.tsx', gtContent);
console.log("Done");
