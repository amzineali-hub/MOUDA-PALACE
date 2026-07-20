const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update initialStaff
const staffTarget = `  const initialStaff = [
    { id: 'EMP-01', name: 'Ahmed Benali', role: 'Chef de Cuisine', department: 'Cuisine', phone: '+212 6 00 11 22 33', status: 'Actif', shift: 'Soir' },
    { id: 'EMP-02', name: 'Karima Idrissi', role: 'Maître d\\'Hôtel', department: 'Salle', phone: '+212 6 00 11 22 34', status: 'Actif', shift: 'Matin' },
    { id: 'EMP-03', name: 'Youssef Tazi', role: 'Serveur', department: 'Salle', phone: '+212 6 00 11 22 35', status: 'En congé', shift: '-' },
    { id: 'EMP-04', name: 'Sofia Amrani', role: 'Réceptionniste', department: 'Accueil', phone: '+212 6 00 11 22 36', status: 'Actif', shift: 'Soir' },
  ];`;

const staffReplace = `  const initialStaff = [
    { id: 'EMP-01', name: 'Ahmed Benali', role: 'Chef de Cuisine', department: 'Cuisine', phone: '+212 6 00 11 22 33', status: 'Actif', shift: 'Soir', baseSalary: 14500 },
    { id: 'EMP-02', name: 'Karima Idrissi', role: 'Maître d\\'Hôtel', department: 'Salle', phone: '+212 6 00 11 22 34', status: 'Actif', shift: 'Matin', baseSalary: 9500 },
    { id: 'EMP-03', name: 'Youssef Tazi', role: 'Serveur', department: 'Salle', phone: '+212 6 00 11 22 35', status: 'En congé', shift: '-', baseSalary: 4000 },
    { id: 'EMP-04', name: 'Sofia Amrani', role: 'Réceptionniste', department: 'Accueil', phone: '+212 6 00 11 22 36', status: 'Actif', shift: 'Soir', baseSalary: 6000 },
  ];`;

content = content.replace(staffTarget, staffReplace);

// Update PayrollModal
const modalTarget = `function PayrollModal({ isOpen, onClose, staffData, onGenerate }: { isOpen: boolean, onClose: () => void, staffData: any[], onGenerate: (data: any) => void }) {
  const [baseSalary, setBaseSalary] = useState<number>(4000);`;

const modalReplace = `function PayrollModal({ isOpen, onClose, staffData, onGenerate }: { isOpen: boolean, onClose: () => void, staffData: any[], onGenerate: (data: any) => void }) {
  const [selectedStaffName, setSelectedStaffName] = useState(staffData[0]?.name || '');
  const [baseSalary, setBaseSalary] = useState<number>(staffData[0]?.baseSalary || 4000);

  useEffect(() => {
    const staff = staffData.find(s => s.name === selectedStaffName);
    if (staff && staff.baseSalary) {
      setBaseSalary(staff.baseSalary);
    }
  }, [selectedStaffName, staffData]);`;

content = content.replace(modalTarget, modalReplace);

// Update select element inside PayrollModal
const selectTarget = `              <select name="staffName" required className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]">
                {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>`;

const selectReplace = `              <select 
                name="staffName" 
                required 
                value={selectedStaffName}
                onChange={(e) => setSelectedStaffName(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
              >
                {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>`;

content = content.replace(selectTarget, selectReplace);

fs.writeFileSync('src/App.tsx', content);
