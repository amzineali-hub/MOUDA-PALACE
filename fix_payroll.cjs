const fs = require('fs');
let code = fs.readFileSync('src/RH.tsx', 'utf8');

const regex = /\{payrollList\.map\(\(item, idx\) => \([\s\S]*?\)\)\}\n\s*\{payrollList\.length === 0[\s\S]*?\n\s*\}/;

const replacement = `{staffData.map((staff, idx) => {
                     const item = payrollList.find(p => p.name === staff.name) || {
                       period: '-',
                       base: staff.baseSalary,
                       net: '-',
                       status: 'Non généré',
                       id: null
                     };
                     
                     return (
                     <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                       <td className="p-4 font-medium text-gray-900">{staff.name}</td>
                       <td className="p-4 text-gray-600">{item.period}</td>
                       <td className="p-4 text-gray-600">{staff.baseSalary} MAD</td>
                       <td className="p-4 font-bold text-green-600">{item.net}</td>
                       <td className="p-4"><span className={\`px-2 py-1 text-xs rounded-full \${item.status === 'Payé' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}\`}>{item.status}</span></td>
                       <td className="p-4 text-right">
                         {item.id ? (
                           <button onClick={() => { setSelectedPayslip(item); setIsPayslipDocOpen(true); }} className="text-[#F4C75B] hover:text-[#E5B745] p-2 bg-amber-50 rounded-lg" title="Voir la fiche">
                             <FileText size={16} />
                           </button>
                         ) : (
                           <button onClick={() => { /* We could open modal pre-selected for this staff */ setIsPayrollModalOpen(true); }} className="text-gray-400 hover:text-[#F4C75B] p-2 bg-gray-50 rounded-lg" title="Générer une fiche">
                             <Calculator size={16} />
                           </button>
                         )}
                       </td>
                     </tr>
                   )})}
                   {staffData.length === 0 && (
                     <tr>
                       <td colSpan={6} className="p-8 text-center text-gray-500">Aucun employé dans l'annuaire.</td>
                     </tr>
                   )}`;

code = code.replace(regex, replacement);

// Also change the title to "État des Paies (Annuaire)" or keep it as is.
code = code.replace(/<h3 className="text-xl font-bold text-gray-900">Historique des Paies<\/h3>/, '<h3 className="text-xl font-bold text-gray-900">État des Paies & Staff</h3>');

fs.writeFileSync('src/RH.tsx', code);
