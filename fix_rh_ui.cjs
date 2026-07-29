const fs = require('fs');
let code = fs.readFileSync('src/RH.tsx', 'utf8');

// I need to inject the main UI between the </header> and the {/* Payslip Document Modal */}
const brokenSectionStart = `      </header>`;
const brokenSectionEnd = `      {/* Payslip Document Modal */}`;

const mainUI = `      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        {[
          { id: 'directory', label: 'Annuaire & Staff', icon: Users },
          { id: 'schedule', label: 'Plannings', icon: CalendarRange },
          { id: 'payroll', label: 'Paie & Fiches', icon: Banknote },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={\`pb-4 px-2 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap \${activeTab === tab.id ? 'border-[#DDA956] text-[#DDA956]' : 'border-transparent text-gray-500 hover:text-gray-900'}\`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'directory' && (
        <div className="space-y-6">
           <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Rechercher un employé..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DDA956]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <select className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DDA956]" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="Tous">Tous les départements</option>
                <option value="Cuisine">Cuisine</option>
                <option value="Salle">Salle</option>
                <option value="Direction">Direction</option>
              </select>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStaff.map(staff => (
                 <div key={staff.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400 overflow-hidden">
                             {staff.photo ? <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" /> : staff.name.charAt(0)}
                          </div>
                          <div>
                             <h3 className="font-bold text-gray-900">{staff.name}</h3>
                             <p className="text-sm text-gray-500">{staff.role}</p>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                       <p><span className="font-medium text-gray-900">Département:</span> {staff.department}</p>
                       <p><span className="font-medium text-gray-900">Email:</span> {staff.email}</p>
                       <p><span className="font-medium text-gray-900">Tél:</span> {staff.phone}</p>
                    </div>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                       <span className={\`px-3 py-1 text-xs font-medium rounded-full \${staff.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}\`}>{staff.status}</span>
                       <button onClick={() => { setEditingStaff(staff); setIsModalOpen(true); }} className="text-[#DDA956] hover:text-[#c4954b] p-2 bg-amber-50 rounded-lg">
                          <Edit2 size={16} />
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Historique des Paies</h3>
              <button onClick={() => setIsPayrollModalOpen(true)} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-black transition-colors">
                 <Calculator size={18} /> Générer une fiche
              </button>
           </div>
           
           <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50 border-b border-gray-100">
                     <th className="p-4 font-medium text-gray-600">Employé</th>
                     <th className="p-4 font-medium text-gray-600">Période</th>
                     <th className="p-4 font-medium text-gray-600">Base</th>
                     <th className="p-4 font-medium text-gray-600">Net</th>
                     <th className="p-4 font-medium text-gray-600">Statut</th>
                     <th className="p-4 font-medium text-gray-600 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {payrollList.map((item, idx) => (
                     <tr key={idx} className="hover:bg-gray-50 transition-colors">
                       <td className="p-4 font-medium text-gray-900">{item.name}</td>
                       <td className="p-4 text-gray-600">{item.period}</td>
                       <td className="p-4 text-gray-600">{item.base} MAD</td>
                       <td className="p-4 font-bold text-green-600">{item.net}</td>
                       <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{item.status}</span></td>
                       <td className="p-4 text-right">
                         <button onClick={() => { setSelectedPayslip(item); setIsPayslipDocOpen(true); }} className="text-[#DDA956] hover:text-[#c4954b] p-2 bg-amber-50 rounded-lg">
                           <FileText size={16} />
                         </button>
                       </td>
                     </tr>
                   ))}
                   {payrollList.length === 0 && (
                     <tr>
                       <td colSpan={6} className="p-8 text-center text-gray-500">Aucune fiche de paie générée.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      )}
      
      {activeTab === 'schedule' && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
           <Timer size={48} className="mx-auto text-gray-300 mb-4" />
           <h3 className="text-xl font-bold text-gray-900 mb-2">Module Planning</h3>
           <p className="text-gray-500 mb-6">Le gestionnaire de planning est en cours de maintenance.</p>
        </div>
      )}

      {/* Payslip Document Modal */}`;

code = code.replace(brokenSectionStart + "\n\n" + brokenSectionEnd, mainUI);
fs.writeFileSync('src/RH.tsx', code);
console.log("Restored main UI in RH.tsx");
