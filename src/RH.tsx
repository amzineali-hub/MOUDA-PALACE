import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, FileText, CheckCircle, Clock, CalendarCheck, Settings, Search, Edit2, AlertTriangle, Plus, X, UploadCloud, Download, BookOpen, Star, Calculator, Lock, Filter, Timer, CalendarRange, Banknote, Shield, UserCheck, Printer, Trash2 } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import PlanningScheduler from './components/PlanningScheduler';
import { computePayroll } from './lib/payroll';

function DashboardCard({ title, value, subtitle, icon, delay = 0 }: { title: string, value: string, subtitle: string, icon: React.ReactNode, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
    </motion.div>
  );
}

function PayrollModal({ isOpen, onClose, staffData, onGenerate }: { isOpen: boolean, onClose: () => void, staffData: any[], onGenerate: (data: any) => void }) {
  const [selectedStaffName, setSelectedStaffName] = useState(staffData[0]?.name || '');
  const [baseSalary, setBaseSalary] = useState<number>(staffData[0]?.baseSalary || 4000);

  useEffect(() => {
    const staff = staffData.find(s => s.name === selectedStaffName);
    if (staff && staff.baseSalary) {
      setBaseSalary(staff.baseSalary);
    }
  }, [selectedStaffName, staffData]);
  
  // Calculs Code du Travail Marocain (simplifiés) — voir src/lib/payroll.ts
  const { cnss, amo, igr, netSalary } = computePayroll(baseSalary);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:bg-white print:backdrop-blur-none print:items-start print:p-0 print:absolute">
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
              <select 
                name="staffName" 
                required 
                value={selectedStaffName}
                onChange={(e) => setSelectedStaffName(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
              >
                {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
              <input type="text" name="period" required defaultValue="Juil 2026" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaire de Base (MAD)</label>
              <input 
                type="number" 
                value={baseSalary || ''} 
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                required 
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" 
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
                <span className="font-bold text-[#F4C75B] text-lg">{netSalary.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
            <button type="submit" className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors flex items-center gap-2">
              <CheckCircle size={16} /> Valider & Générer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


export default function RH() {

  const [activeTab, setActiveTab] = useState('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const [staffData, setStaffData] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'staff'), (snapshot) => {
      setStaffData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
  
  const [leavesList, setLeavesList] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'leaves'), (snapshot) => {
      setLeavesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
  
  const [evaluationsList, setEvaluationsList] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'evaluations'), (snapshot) => {
      setEvaluationsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const [trainingSessions, setTrainingSessions] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'training'), (snapshot) => {
      setTrainingSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const [rolesList, setRolesList] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'roles'), (snapshot) => {
      setRolesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const [scheduleData, setScheduleData] = useState<any[]>([]);

  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      setAttendanceList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const [payrollList, setPayrollList] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'payroll'), orderBy('createdAt', 'desc')), (snapshot) => {
      setPayrollList(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      console.error("Error fetching payroll", error);
    });
    return () => unsub();
  }, []);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  
  const [isLeaveBalanceModalOpen, setIsLeaveBalanceModalOpen] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<{empId: number, dayKey: string, current: string} | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isPayslipDocOpen, setIsPayslipDocOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDept, setFilterDept] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');

  const handleSaveStaff = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let photoDataUrl = editingStaff?.photo || "";
    const file = formData.get('photoFile') as File;
    if (file && file.size > 0) {
      photoDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const newStaff = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      status: formData.get('status') as string,
      shift: formData.get('shift') as string || '-',
      baseSalary: Number(formData.get('baseSalary')) || 4000,
      photo: photoDataUrl,
      cin: formData.get('cin') as string,
      cnss: formData.get('cnss') as string,
      hireDate: formData.get('hireDate') as string,
      language: formData.get('language') as string,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingStaff?.id) {
        await updateDoc(doc(db, 'staff', editingStaff.id), newStaff);
        showToast("Employé mis à jour avec succès");
      } else {
        await addDoc(collection(db, 'staff'), { ...newStaff, createdAt: serverTimestamp(), empId: `EMP-${Date.now().toString().slice(-4)}` });
        showToast("Employé ajouté avec succès");
      }
      setIsModalOpen(false);
      setEditingStaff(null);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la sauvegarde", "error");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet employé ?')) return;
    try {
      if (id) {
        await deleteDoc(doc(db, 'staff', id));
      }
      showToast("Employé supprimé");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la suppression");
    }
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const filteredStaff = staffData.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'Tous' || s.department === filterDept;
    const matchesStatus = filterStatus === 'Tous' || s.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Staff & RH</h2>
          <p className="text-gray-500">Gestion du personnel, plannings et accès.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-black transition-colors"
          >
            <Plus size={20} />
            Ajouter un employé
          </button>
        </div>
      </header>

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
            className={`pb-4 px-2 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'border-[#F4C75B] text-[#F4C75B]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
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
                <input type="text" placeholder="Rechercher un employé..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F4C75B]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <select className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F4C75B]" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="Tous">Tous les départements</option>
                <option value="Cuisine">Cuisine</option>
                <option value="Salle">Salle</option>
                <option value="Accueil">Accueil</option>
                <option value="Management">Management</option>
              </select>
           </div>
           
           {filteredStaff.length === 0 ? (
             <div className="text-center text-gray-500 py-12 border border-dashed border-gray-200 bg-white rounded-2xl">
               {staffData.length === 0 ? "Aucun employé pour le moment. Ajoutez votre équipe pour commencer." : "Aucun employé ne correspond à ces filtres."}
             </div>
           ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStaff.map((staff, idx) => (
                 <div key={staff.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400 overflow-hidden">
                             {(() => {
  const isDefaultMan = staff.photo === "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" || staff.photo === "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100";
  const finalPhoto = (staff.photo && !isDefaultMan) ? staff.photo : ["https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100"][idx % 5];
  return finalPhoto ? <img src={finalPhoto} alt={staff.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : staff.name.charAt(0);
})()}
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
                       <span className={`px-3 py-1 text-xs font-medium rounded-full ${staff.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{staff.status}</span>
                       <div className="flex gap-2">
                         <button onClick={() => { setEditingStaff(staff); setIsModalOpen(true); }} className="text-[#F4C75B] hover:text-[#E5B745] p-2 bg-amber-50 rounded-lg">
                            <Edit2 size={16} />
                         </button>
                         <button onClick={() => handleDeleteStaff(staff.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg" title="Supprimer">
                            <Trash2 size={16} />
                         </button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           )}
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
                         <button onClick={() => { setSelectedPayslip(item); setIsPayslipDocOpen(true); }} className="text-[#F4C75B] hover:text-[#E5B745] p-2 bg-amber-50 rounded-lg">
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
      
      {activeTab === 'schedule' && ( <div className='mt-6'><PlanningScheduler staffData={staffData} /></div> )}

      {/* Payslip Document Modal */}
      {isPayslipDocOpen && selectedPayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-100 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Bulletin de Paie - {selectedPayslip.name}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setTimeout(() => window.print(), 100);
                  }} 
                  className="px-4 py-1.5 bg-[#F4C75B] text-[#1A1A1A] text-sm font-medium rounded-lg hover:bg-[#E5B745] transition-colors flex items-center gap-2"
                >
                  <Printer size={16} /> Imprimer
                </button>
                <button onClick={() => setIsPayslipDocOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-900 bg-white rounded-lg border border-gray-200 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="p-8 bg-white" id="payslip-print-area">
              <div className="border border-black p-0.5">
                {/* Header */}
                <div className="grid grid-cols-2 mb-2">
                  <div className="bg-amber-600 text-white font-bold text-center py-1 text-lg">MOUDA PALACE</div>
                  <div className="text-center font-bold text-green-700 text-lg flex items-center justify-center">BULLETIN DE PAIE</div>
                  <div className="bg-amber-100 text-center font-bold text-black py-1 col-span-1">MAROC</div>
                </div>

                {/* Employee Info */}
                <table className="w-full border-collapse border border-black text-xs text-center mb-1">
                  <tbody>
                    <tr>
                      <td className="border border-black py-1 font-bold w-1/3">NOM-PRENOM</td>
                      <td className="border border-black py-1 font-bold w-1/3">QUALIFICATION</td>
                      <td className="border border-black py-1 font-bold">SALAIRE MENSUEL</td>
                      <td className="border border-black py-1 font-bold">MATRICULE</td>
                    </tr>
                    <tr>
                      <td className="border border-black py-1 h-6">{selectedPayslip.name}</td>
                      <td className="border border-black py-1 h-6">Employé</td>
                      <td className="border border-black py-1 bg-yellow-300 font-bold">{(Number(selectedPayslip.base) || 0).toFixed(2) || '0.00'}</td>
                      <td className="border border-black py-1">{selectedPayslip.id}</td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-full border-collapse border border-black text-xs text-center mb-4">
                  <tbody>
                    <tr className="font-bold">
                      <td className="border border-black py-1" colSpan={2}>DATE EMBAUCHE</td>
                      <td className="border border-black py-1">N°CIMR</td>
                      <td className="border border-black py-1">N°CNSS</td>
                      <td className="border border-black py-1">NAISSANCE</td>
                      <td className="border border-black py-1">SF</td>
                      <td className="border border-black py-1">DEDUCT</td>
                      <td className="border border-black py-1">SALAIRE PAR HEURE</td>
                      <td className="border border-black py-1" colSpan={3}>PERIODE DE PAIE</td>
                    </tr>
                    <tr>
                      <td className="border border-black py-1 bg-yellow-300 w-8">1</td>
                      <td className="border border-black py-1 bg-yellow-300 w-12">12</td>
                      <td className="border border-black py-1">-</td>
                      <td className="border border-black py-1">123456789</td>
                      <td className="border border-black py-1">01/01/1990</td>
                      <td className="border border-black py-1 bg-yellow-300">M</td>
                      <td className="border border-black py-1 bg-yellow-300">0</td>
                      <td className="border border-black py-1 font-bold">{(selectedPayslip.base / 191).toFixed(2)}</td>
                      <td className="border border-black py-1 bg-yellow-300 w-8">31</td>
                      <td className="border border-black py-1 bg-yellow-300 w-8">1</td>
                      <td className="border border-black py-1 bg-yellow-300 w-12">2026</td>
                    </tr>
                  </tbody>
                </table>

                {/* Main Details */}
                <table className="w-full border-collapse border border-black text-xs mb-0 h-[400px]">
                  <thead>
                    <tr className="font-bold text-center">
                      <td className="border border-black py-1 w-12">C.PAIE</td>
                      <td className="border border-black py-1">LIBELLE</td>
                      <td className="border border-black py-1 w-32">BASE/NOMBRE</td>
                      <td className="border border-black py-1 w-20">TAUX</td>
                      <td className="border border-black py-1 w-28">A PAYER</td>
                      <td className="border border-black py-1 w-28">A RETENIR</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="align-top">
                      <td className="border-l border-r border-black p-1"></td>
                      <td className="border-l border-r border-black p-1 font-medium space-y-1">
                        <div>SALAIRE DE BASE</div>
                        <div>PRIME D'ANCIENETE</div>
                        <div>PRIME</div>
                        <div>SALAIRE BRUT</div>
                        <div>COTISATION CNSS</div>
                        <div>RETRAITE CIMR</div>
                        <div>AMO</div>
                        <div>PRELEVEMENT IGR</div>
                        <div>AVANTAGE EN NATURE</div>
                        <div>AVANCE</div>
                        <div>PRÊT</div>
                      </td>
                      <td className="border-l border-r border-black p-1 text-right space-y-1">
                        <div className="bg-yellow-300 pr-1">191.00</div>
                        <div>{(Number(selectedPayslip.base) || 0).toFixed(2)}</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div>{(Number(selectedPayslip.base) || 0).toFixed(2)}</div>
                        <div>{(Number(selectedPayslip.base) || 0).toFixed(2)}</div>
                        <div>{(Number(selectedPayslip.base) || 0).toFixed(2)}</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                      </td>
                      <td className="border-l border-r border-black p-1 text-center space-y-1">
                        <div>{(selectedPayslip.base / 191).toFixed(2)}</div>
                        <div>-</div>
                        <div>-</div>
                        <div className="h-4"></div>
                        <div>4.48</div>
                        <div>-</div>
                        <div>2.26</div>
                        <div>10.00</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                      </td>
                      <td className="border-l border-r border-black p-1 text-right space-y-1 pr-2">
                        <div>{(Number(selectedPayslip.base) || 0).toFixed(2)}</div>
                        <div>-</div>
                        <div>-</div>
                        <div>{(Number(selectedPayslip.base) || 0).toFixed(2)}</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                      </td>
                      <td className="border-l border-r border-black p-1 text-right space-y-1 pr-2">
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div>{(Number(selectedPayslip.cnss) || 0).toFixed(2)}</div>
                        <div>-</div>
                        <div>{(Number(selectedPayslip.amo) || 0).toFixed(2)}</div>
                        <div>{(Number(selectedPayslip.igr) || 0).toFixed(2)}</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                      </td>
                    </tr>
                    {/* Fill remaining space */}
                    <tr>
                      <td className="border-l border-r border-black h-full"></td>
                      <td className="border-l border-r border-black h-full"></td>
                      <td className="border-l border-r border-black h-full"></td>
                      <td className="border-l border-r border-black h-full"></td>
                      <td className="border-l border-r border-black h-full"></td>
                      <td className="border-l border-r border-black h-full"></td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer Totals */}
                <table className="w-full border-collapse border border-black text-xs text-center">
                  <tbody>
                    <tr className="font-bold">
                      <td className="border border-black py-1 w-[15%]">CUMUL<br/>JOUR</td>
                      <td className="border border-black py-1 w-[20%]">CUMUL<br/>BASE CONGRES</td>
                      <td className="border border-black py-1 w-[20%]">CUMUL BASE<br/>IMPOSABLE</td>
                      <td className="border border-black py-1 w-[25%]">CUMUL<br/>RETENUE CIMR</td>
                      <td className="border border-black py-1 w-[20%]">CUMUL<br/>IGR</td>
                      <td className="border-t border-black bg-white" colSpan={2} rowSpan={2}></td>
                    </tr>
                    <tr>
                      <td className="border border-black py-2"></td>
                      <td className="border border-black py-2"></td>
                      <td className="border border-black py-2"></td>
                      <td className="border border-black py-2"></td>
                      <td className="border border-black py-2"></td>
                    </tr>
                    <tr>
                      <td className="border-0 bg-white" colSpan={4} rowSpan={2}></td>
                      <td className="border border-black font-bold py-1 bg-gray-50 text-right pr-4" colSpan={2}>NET A PAYER</td>
                    </tr>
                    <tr>
                      <td className="border border-black font-bold py-1 text-right pr-4 text-sm" colSpan={2}>
                        {Number(selectedPayslip.net.replace(/[^0-9.-]+/g,"")).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                {editingStaff ? "Modifier l'employé" : "Ajouter un employé"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            
              <form onSubmit={handleSaveStaff} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Importer une photo</label>
                  <div className="flex items-center gap-4">
                    {editingStaff?.photo && (
                       <img src={editingStaff?.photo} alt="Current" className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0" />
                    )}
                    <input name="photoFile" type="file" accept="image/*" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B] bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#F4C75B]/10 file:text-[#265C6D] hover:file:bg-[#F4C75B]/20" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input name="name" defaultValue={editingStaff?.name} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Karim El Fassi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                  <input name="cin" defaultValue={editingStaff?.cin} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: A123456" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNSS</label>
                  <input name="cnss" defaultValue={editingStaff?.cnss} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 123456789" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <input name="role" defaultValue={editingStaff?.role} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Serveur" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <select name="department" defaultValue={editingStaff?.department || 'Salle'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    <option value="Salle">Salle</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Accueil">Accueil</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche</label>
                  <input name="hireDate" defaultValue={editingStaff?.hireDate} type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langues (séparées par virgule)</label>
                  <input name="language" defaultValue={editingStaff?.language} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Français, Arabe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" defaultValue={editingStaff?.email} type="email" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="email@exemple.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" defaultValue={editingStaff?.phone} type="tel" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="+212..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select name="status" defaultValue={editingStaff?.status || 'Actif'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    <option value="Actif">Actif</option>
                    <option value="En congé">En congé</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service (Optionnel)</label>
                  <select name="shift" defaultValue={editingStaff?.shift || '-'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    <option value="-">- Non assigné -</option>
                    <option value="Matin">Matin</option>
                    <option value="Soir">Soir</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire de Base (MAD)</label>
                  <input name="baseSalary" defaultValue={editingStaff?.baseSalary || 4000} type="number" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 4000" />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                {editingStaff ? (
                  <button 
                    type="button" 
                    onClick={() => handleDeleteStaff(editingStaff.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    <Trash2 size={16} /> Supprimer
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors"
                  >
                    {editingStaff ? 'Sauvegarder' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Leave Balance Modal */}
      {isLeaveBalanceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Gestion des soldes de congés
              </h3>
              <button onClick={() => setIsLeaveBalanceModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className={`p-6 ${isPayslipDocOpen ? "print:hidden" : ""}`}>
              <p className="text-sm text-gray-500 mb-6">Mettez à jour le solde de congés annuels pour les employés.</p>
              <div className="space-y-4">
                {staffData.map(staff => (
                  <div key={staff.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                    <span className="font-medium text-gray-900">{staff.name}</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        defaultValue={21}
                        className="w-20 p-2 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" 
                      />
                      <span className="text-sm text-gray-500">jours</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsLeaveBalanceModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    showToast("Soldes mis à jour");
                    setIsLeaveBalanceModalOpen(false);
                  }}
                  className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Eval Modal */}
      {isEvalModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Nouvelle Évaluation
              </h3>
              <button onClick={() => setIsEvalModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addDoc(collection(db, 'evaluations'), {
                name: formData.get('staffName') as string,
                role: "Poste",
                score: `${formData.get('score')}/5`,
                date: "Aujourd'hui",
                next: "Dans 6 mois",
                createdAt: serverTimestamp()
              }).then(() => {
                showToast("Évaluation enregistrée");
                setIsEvalModalOpen(false);
              });
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="staffName" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]">
                    {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score global (sur 5)</label>
                  <input type="number" name="score" min="1" max="5" step="0.1" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires et points d'amélioration</label>
                  <textarea rows={4} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEvalModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors">Sauvegarder</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Training Modal */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Nouvelle Session de Formation
              </h3>
              <button onClick={() => setIsTrainingModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setTrainingSessions([...trainingSessions, {
                id: Date.now(),
                title: formData.get('title') as string,
                date: formData.get('date') as string,
                participants: parseInt(formData.get('participants') as string) || 0,
                status: "Planifié",
                trainer: formData.get('trainer') as string
              }]);
              showToast("Formation planifiée");
              setIsTrainingModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la formation</label>
                  <input type="text" name="title" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" name="date" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formateur</label>
                  <input type="text" name="trainer" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre prévu de participants</label>
                  <input type="number" name="participants" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTrainingModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors">Planifier</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                {editingRole ? 'Modifier le Rôle' : 'Nouveau Rôle'}
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newRole = {
                id: editingRole?.id || Date.now(),
                role: formData.get('role') as string,
                users: editingRole?.users || 0,
                access: formData.get('access') as string
              };
              if (editingRole?.id && typeof editingRole.id === 'string') {
                updateDoc(doc(db, 'roles', editingRole.id), newRole).then(() => {
                  showToast("Rôle mis à jour");
                  setIsRoleModalOpen(false);
                });
              } else {
                addDoc(collection(db, 'roles'), newRole).then(() => {
                  showToast("Rôle créé");
                  setIsRoleModalOpen(false);
                });
              }
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Rôle</label>
                  <input type="text" name="role" defaultValue={editingRole?.role} required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description des Accès</label>
                  <textarea name="access" defaultValue={editingRole?.access} rows={4} required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors">{editingRole ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Shift Edit Modal */}
      {isShiftModalOpen && editingShift && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Modifier l'horaire
              </h3>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newShift = formData.get('shift') as string;
              setScheduleData(scheduleData.map(s => {
                if (s.id === editingShift.empId) {
                  return { ...s, [editingShift.dayKey]: newShift };
                }
                return s;
              }));
              showToast("Horaire mis à jour");
              setIsShiftModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horaire</label>
                  <select name="shift" defaultValue={editingShift.current} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]">
                    <option value="Repos">Repos</option>
                    <option value="08:00 - 16:30">Matin (08:00 - 16:30)</option>
                    <option value="15:00 - 23:30">Soir (15:00 - 23:30)</option>
                    <option value="09:00 - 18:00">Journée (09:00 - 18:00)</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsShiftModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Saisir un Pointage
              </h3>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addDoc(collection(db, 'attendance'), {
                name: formData.get('staffName') as string,
                in: formData.get('timeIn') as string || "-",
                out: formData.get('timeOut') as string || "-",
                status: formData.get('timeOut') ? "Terminé" : "En poste",
                createdAt: serverTimestamp()
              }).then(() => {
                showToast("Pointage enregistré");
                setIsAttendanceModalOpen(false);
              }).catch(e => {
                console.error(e);
                showToast("Erreur d'enregistrement", "error");
              });
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="staffName" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]">
                    {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure d'arrivée</label>
                    <input type="time" name="timeIn" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure de départ (Optionnel)</label>
                    <input type="time" name="timeOut" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAttendanceModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Payroll Modal */}
      <PayrollModal 
        isOpen={isPayrollModalOpen} 
        onClose={() => setIsPayrollModalOpen(false)}
        staffData={staffData}
        onGenerate={async (data) => {
          const newPayslip = {
            period: data.period as string,
            name: data.staffName as string,
            net: `${data.net.toFixed(2)} MAD`,
            status: "Payé",
            base: data.base,
            cnss: data.cnss,
            amo: data.amo,
            igr: data.igr,
            createdAt: serverTimestamp()
          };
          
          try {
            const docRef = await addDoc(collection(db, 'payroll'), newPayslip);
            showToast("Fiche de paie générée (Normes Marocaines)");
            setIsPayrollModalOpen(false);
            setSelectedPayslip({ id: docRef.id, ...newPayslip });
            setIsPayslipDocOpen(true);
          } catch (err) {
            console.error("Error adding payslip", err);
            showToast("Erreur lors de la génération");
          }
        }}
      />
    </div>
  );
}

