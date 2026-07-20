const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const modalComponent = `
function PayrollModal({ isOpen, onClose, staffData, onGenerate }: { isOpen: boolean, onClose: () => void, staffData: any[], onGenerate: (data: any) => void }) {
  const [baseSalary, setBaseSalary] = useState<number>(4000);
  
  // Calculs Code du Travail Marocain (simplifiés)
  // CNSS Salariale: 4.48% plafonné à 6000 MAD
  const cnss = Math.min(baseSalary, 6000) * 0.0448;
  // AMO Salariale: 2.26% sans plafond
  const amo = baseSalary * 0.0226;
  // Frais Pro: 20% plafonné à 2500 MAD (pour IGR, on simplifie)
  const fraisPro = Math.min(baseSalary * 0.2, 2500);
  const sni = baseSalary - cnss - amo - fraisPro; // Salaire Net Imposable
  
  // Barème IGR (simplifié, annuel / 12)
  let igr = 0;
  if (sni > 2500 && sni <= 4166) igr = sni * 0.1 - 250;
  else if (sni > 4166 && sni <= 5000) igr = sni * 0.2 - 666.67;
  else if (sni > 5000 && sni <= 6666) igr = sni * 0.3 - 1166.67;
  else if (sni > 6666 && sni <= 15000) igr = sni * 0.34 - 1433.33;
  else if (sni > 15000) igr = sni * 0.38 - 2033.33;
  igr = Math.max(0, igr);

  const netSalary = baseSalary - cnss - amo - igr;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-serif font-medium text-gray-900">
            Générer Fiche de Paie (Maroc)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onGenerate({
            period: formData.get('period'),
            staffName: formData.get('staffName'),
            base: baseSalary,
            cnss,
            amo,
            igr,
            net: netSalary
          });
        }} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
              <select name="staffName" required className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]">
                {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
              <input type="text" name="period" required defaultValue="Juil 2026" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire de Base (MAD)</label>
              <input 
                type="number" 
                value={baseSalary || ''} 
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                required 
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" 
              />
            </div>
            
            {/* Calculs Live */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Cotisation CNSS (4.48%)</span>
                <span className="font-medium text-red-600">-{cnss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Cotisation AMO (2.26%)</span>
                <span className="font-medium text-red-600">-{amo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Retenue IR (Impôt)</span>
                <span className="font-medium text-red-600">-{igr.toFixed(2)}</span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-900">Salaire Net à Payer</span>
                <span className="font-bold text-[#DDA956] text-lg">{netSalary.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
            <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors flex items-center gap-2">
              <CheckCircle size={16} /> Valider & Générer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function StaffHR() {
`;

content = content.replace("function StaffHR() {", modalComponent);

const oldModalTarget = `      {/* Payroll Modal */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Générer Fiche de Paie
              </h3>
              <button onClick={() => setIsPayrollModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setPayrollList([...payrollList, {
                id: Date.now(),
                period: formData.get('period') as string,
                name: formData.get('staffName') as string,
                net: \`\${formData.get('net')} MAD\`,
                status: "Payé"
              }]);
              showToast("Fiche de paie générée");
              setIsPayrollModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="staffName" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]">
                    {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Période (Ex: Juil 2026)</label>
                  <input type="text" name="period" required defaultValue="Juil 2026" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire Net (MAD)</label>
                  <input type="number" name="net" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsPayrollModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">Générer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}`;

const newModalReplace = `      {/* Payroll Modal */}
      <PayrollModal 
        isOpen={isPayrollModalOpen} 
        onClose={() => setIsPayrollModalOpen(false)}
        staffData={staffData}
        onGenerate={(data) => {
          setPayrollList([...payrollList, {
            id: Date.now(),
            period: data.period as string,
            name: data.staffName as string,
            net: \`\${data.net.toFixed(2)} MAD\`,
            status: "Payé"
          }]);
          showToast("Fiche de paie générée (Normes Marocaines)");
          setIsPayrollModalOpen(false);
        }}
      />`;

content = content.replace(oldModalTarget, newModalReplace);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated payroll modal");
