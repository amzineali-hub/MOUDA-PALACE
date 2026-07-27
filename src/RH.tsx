import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, FileText, CheckCircle, Clock, CalendarCheck, Settings, Search, Edit2, AlertTriangle, Plus, X, UploadCloud, Download, BookOpen, Star, Calculator, Lock, Filter, Upload, Timer, CalendarRange, Banknote, Shield, UserCheck, Printer, Trash2 } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

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
              <select 
                name="staffName" 
                required 
                value={selectedStaffName}
                onChange={(e) => setSelectedStaffName(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
              >
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


export default function RH() {

  const [activeTab, setActiveTab] = useState('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const initialStaff = [
    { id: 'EMP-01', name: 'Ahmed Benali', role: 'Chef de Cuisine', department: 'Cuisine', phone: '+212 6 00 11 22 33', email: 'ahmed.b@moudapalace.com', status: 'Actif', shift: 'Soir', baseSalary: 14500, photo: '', cin: 'A123456', cnss: '123456789', hireDate: '2022-03-15', language: 'Français, Arabe' },
    { id: 'EMP-02', name: 'Karima Idrissi', role: 'Maître d\'Hôtel', department: 'Salle', phone: '+212 6 00 11 22 34', email: 'karima.i@moudapalace.com', status: 'Actif', shift: 'Matin', baseSalary: 9500, photo: '', cin: 'AB98765', cnss: '987654321', hireDate: '2023-01-10', language: 'Français, Anglais, Arabe' },
    { id: 'EMP-03', name: 'Youssef Tazi', role: 'Serveur', department: 'Salle', phone: '+212 6 00 11 22 35', email: 'youssef.t@moudapalace.com', status: 'En congé', shift: '-', baseSalary: 4000, photo: '', cin: 'C456789', cnss: '456123789', hireDate: '2024-06-01', language: 'Français, Arabe' },
    { id: 'EMP-04', name: 'Sofia Amrani', role: 'Réceptionniste', department: 'Accueil', phone: '+212 6 00 11 22 36', email: 'sofia.a@moudapalace.com', status: 'Actif', shift: 'Soir', baseSalary: 6000, photo: '', cin: 'D654321', cnss: '789123456', hireDate: '2024-02-20', language: 'Français, Anglais, Espagnol' },
  ];

  const [staffData, setStaffData] = useState(initialStaff);
  
  const [leavesList, setLeavesList] = useState([
    { id: 1, name: "Sofia Amrani", type: "Congé Annuel", dates: "12 Août - 26 Août", status: "En attente" },
    { id: 2, name: "Karima Idrissi", type: "Maladie", dates: "Aujourd'hui", status: "Approuvé" }
  ]);
  
  const [evaluationsList, setEvaluationsList] = useState([
    { id: 1, name: "Ahmed Benali", role: "Chef de Cuisine", score: "4.8/5", date: "Juin 2026", next: "Déc 2026" },
    { id: 2, name: "Karima Idrissi", role: "Maître d'Hôtel", score: "4.9/5", date: "Jan 2026", next: "Juil 2026" },
    { id: 3, name: "Sofia Amrani", role: "Réceptionniste", score: "4.5/5", date: "Fév 2026", next: "Août 2026" }
  ]);

  const [trainingSessions, setTrainingSessions] = useState([
    { id: 1, title: "Hygiène et Sécurité Alimentaire (HACCP)", date: "15 Juillet 2026", participants: 8, status: "Planifié", trainer: "Expert Externe" },
    { id: 2, title: "Standards de Service Salle", date: "02 Juin 2026", participants: 12, status: "Complété", trainer: "Karima Idrissi" },
    { id: 3, title: "Introduction aux Vins Locaux", date: "10 Août 2026", participants: 5, status: "Planifié", trainer: "Sommelier Invité" }
  ]);

  const [rolesList, setRolesList] = useState([
    { id: 1, role: "Administrateur", users: 2, access: "Accès total à tous les modules" },
    { id: 2, role: "Manager", users: 3, access: "Accès à la gestion des stocks, personnel et réservations. Pas d'accès financier." },
    { id: 3, role: "Cuisine", users: 5, access: "Accès aux commandes, recettes et plan de production." },
    { id: 4, role: "Réception", users: 4, access: "Accès aux réservations et annuaire client." }
  ]);

  const [scheduleData, setScheduleData] = useState([
    { id: 1, name: "Ahmed Benali", mon: "15:00 - 23:30", tue: "15:00 - 23:30", wed: "15:00 - 23:30", thu: "15:00 - 23:30", fri: "15:00 - 23:30", sat: "Repos", sun: "Repos" },
    { id: 2, name: "Karima Idrissi", mon: "08:00 - 16:30", tue: "08:00 - 16:30", wed: "08:00 - 16:30", thu: "08:00 - 16:30", fri: "Repos", sat: "Repos", sun: "08:00 - 16:30" },
    { id: 3, name: "Youssef Tazi", mon: "Repos", tue: "Repos", wed: "15:00 - 23:30", thu: "15:00 - 23:30", fri: "15:00 - 23:30", sat: "15:00 - 23:30", sun: "15:00 - 23:30" },
  ]);

  const [attendanceList, setAttendanceList] = useState([
    { id: 1, name: "Ahmed Benali", in: "08:15", out: "-", status: "En poste" },
    { id: 2, name: "Karima Idrissi", in: "08:30", out: "-", status: "En poste" },
    { id: 3, name: "Youssef Tazi", in: "-", out: "-", status: "Absent" }
  ]);

  const [payrollList, setPayrollList] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'payroll'), orderBy('createdAt', 'desc')), (snapshot) => {
      setPayrollList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
  const [isImportAttendanceModalOpen, setIsImportAttendanceModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isPayslipDocOpen, setIsPayslipDocOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDept, setFilterDept] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');

  const handleSaveStaff = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newStaff = {
      id: editingStaff?.id || `EMP-${Date.now().toString().slice(-4)}`,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      status: formData.get('status') as string,
      shift: formData.get('shift') as string || '-',
      baseSalary: Number(formData.get('baseSalary')) || 4000,
      photo: formData.get('photo') as string,
      cin: formData.get('cin') as string,
      cnss: formData.get('cnss') as string,
      hireDate: formData.get('hireDate') as string,
      language: formData.get('language') as string,
    };

    if (editingStaff) {
      setStaffData(prev => prev.map(s => s.id === editingStaff.id ? newStaff : s));
      showToast("Employé mis à jour avec succès");
    } else {
      setStaffData(prev => [...prev, newStaff]);
      showToast("Employé ajouté avec succès");
    }
    
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      if (!id.startsWith('EMP-')) {
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
            onClick={() => {
              setEditingStaff(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Ajouter un employé
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Employés" value={staffData.length.toString()} subtitle={`${staffData.filter(s => s.status === 'En congé').length} en congé`} icon={<Users size={20} />} />
        <DashboardCard title="En service (Actuel)" value={staffData.filter(s => s.status === 'Actif').length.toString()} subtitle="Employés actifs" icon={<CheckCircle size={20} />} />
        <DashboardCard title="Heures sup. (Mois)" value="45h" subtitle="+12% vs le mois dernier" icon={<Clock size={20} />} />
        <DashboardCard title="Prochains congés" value="5" subtitle="Dans les 7 prochains jours" icon={<CalendarCheck size={20} />} />
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] rounded-2xl shadow-xl flex overflow-x-auto hide-scrollbar p-2 gap-2 mb-6">
        {[
          { id: 'directory', label: 'Annuaire' },
          { id: 'attendance', label: 'Pointage' },
          { id: 'planning', label: 'Horaires & Planning' },
          { id: 'leaves', label: 'Congés & Absences' },
          { id: 'evaluations', label: 'Évaluations' },
          { id: 'training', label: 'Formations' },
          { id: 'payroll', label: 'Fiches de Paie' },
          { id: 'roles', label: 'Droits & Accès' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab.id ? 'bg-[#DDA956]/20 text-[#DDA956]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'directory' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-50/50 gap-4">
            <div className="relative flex-1 md:w-64 md:flex-none">
              <input 
                type="text" 
                placeholder="Rechercher un employé..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors ${isFilterOpen ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Filter size={14} />
                Filtres
                {(filterDept !== 'Tous' || filterStatus !== 'Tous') && (
                  <span className="w-2 h-2 rounded-full bg-[#DDA956] ml-1"></span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-20">
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Département</label>
                    <select 
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#DDA956]"
                    >
                      <option value="Tous">Tous les départements</option>
                      <option value="Cuisine">Cuisine</option>
                      <option value="Salle">Salle</option>
                      <option value="Accueil">Accueil</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Statut</label>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#DDA956]"
                    >
                      <option value="Tous">Tous les statuts</option>
                      <option value="Actif">Actif</option>
                      <option value="En congé">En congé</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                    <button 
                      onClick={() => {
                        setFilterDept('Tous');
                        setFilterStatus('Tous');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Employé</th>
                  <th className="px-6 py-4">Département</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Identifiants</th>
                  <th className="px-6 py-4">Détails</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Service Actuel</th>
                  <th className="px-6 py-4">Salaire de Base</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map(staff => (
                    <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {staff.photo ? (
                            <img src={staff.photo} alt={staff.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#DDA956]/20 text-[#DDA956] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                              {staff.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{staff.name}</div>
                            <div className="text-xs text-gray-500">{staff.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {staff.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="text-sm">{staff.phone}</div>
                        {staff.email && <div className="text-xs text-gray-400 mt-0.5">{staff.email}</div>}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {staff.cin && <div className="mb-0.5">CIN: <span className="font-medium text-gray-900">{staff.cin}</span></div>}
                        {staff.cnss && <div>CNSS: <span className="font-medium text-gray-900">{staff.cnss}</span></div>}
                        {!staff.cin && !staff.cnss && '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {staff.hireDate && <div className="mb-0.5">Embauche: <span className="font-medium text-gray-900">{staff.hireDate}</span></div>}
                        {staff.language && <div className="truncate max-w-[150px]" title={staff.language}>Langues: <span className="font-medium text-gray-900">{staff.language}</span></div>}
                        {!staff.hireDate && !staff.language && '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                          staff.status === 'Actif' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Actif' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                          {staff.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {staff.shift}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {staff.baseSalary ? `${staff.baseSalary} MAD` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingStaff(staff);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucun employé ne correspond à votre recherche ou à vos filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Planning Hebdomadaire</h3>
            <button 
              onClick={() => showToast("Publication du planning...")}
              className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
            >
              <CheckCircle size={16} /> Publier Planning
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Employé</th>
                  <th className="px-6 py-4">Lun 13</th>
                  <th className="px-6 py-4">Mar 14</th>
                  <th className="px-6 py-4">Mer 15</th>
                  <th className="px-6 py-4">Jeu 16</th>
                  <th className="px-6 py-4">Ven 17</th>
                  <th className="px-6 py-4">Sam 18</th>
                  <th className="px-6 py-4">Dim 19</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scheduleData.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{schedule.name}</td>
                    {[
                      { key: 'mon', val: schedule.mon },
                      { key: 'tue', val: schedule.tue },
                      { key: 'wed', val: schedule.wed },
                      { key: 'thu', val: schedule.thu },
                      { key: 'fri', val: schedule.fri },
                      { key: 'sat', val: schedule.sat },
                      { key: 'sun', val: schedule.sun }
                    ].map((shift, j) => (
                      <td key={j} className="px-6 py-4">
                        <button 
                          onClick={() => {
                            setEditingShift({ empId: schedule.id, dayKey: shift.key, current: shift.val });
                            setIsShiftModalOpen(true);
                          }}
                          className={`px-2 py-1 text-xs rounded-md w-full text-center hover:opacity-80 transition-opacity ${shift.val === 'Repos' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700 font-medium border border-blue-100'}`}
                        >
                          {shift.val}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Pointage du jour</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsImportAttendanceModalOpen(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <Upload size={16} /> Importer (Fichier)
              </button>
              <button 
                onClick={() => setIsAttendanceModalOpen(true)}
                className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-black transition-colors"
              >
                <Plus size={16} /> Saisir Pointage
              </button>
              <button 
                onClick={() => showToast("Exportation des pointages du jour...")}
                className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
              >
                <Timer size={16} /> Exporter Pointages
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Employé</th>
                  <th className="px-6 py-4">Heure d'arrivée</th>
                  <th className="px-6 py-4">Heure de départ</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceList.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{att.name}</td>
                    <td className="px-6 py-4">{att.in}</td>
                    <td className="px-6 py-4">{att.out}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${att.status === 'En poste' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Demandes de congés & Absences</h3>
            <div className="space-y-4">
              {leavesList.map((leave) => (
                <div key={leave.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900">{leave.name}</h4>
                    <p className="text-sm text-gray-500">{leave.type} • {leave.dates}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      leave.status === 'Approuvé' ? 'bg-green-100 text-green-700' : 
                      leave.status === 'Refusé' ? 'bg-red-100 text-red-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {leave.status}
                    </span>
                    {leave.status === 'En attente' && (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            setLeavesList(leavesList.map(l => l.id === leave.id ? { ...l, status: 'Approuvé' } : l));
                            showToast("Demande de congé approuvée");
                          }}
                          className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setLeavesList(leavesList.map(l => l.id === leave.id ? { ...l, status: 'Refusé' } : l));
                            showToast("Demande de congé refusée");
                          }}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
             <h3 className="text-lg font-medium text-gray-900 mb-4">Solde Congés</h3>
             <p className="text-sm text-gray-500 mb-6 flex-1">Gérez les compteurs de jours de congé annuel pour chaque employé.</p>
             <button 
               onClick={() => showToast("Ouverture du gestionnaire de soldes...")}
               className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex justify-center items-center gap-2 hover:bg-gray-200 transition-colors"
             >
                <CalendarRange size={16} /> Gérer les soldes
             </button>
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Évaluations & Performances</h3>
            <button 
              onClick={() => setIsEvalModalOpen(true)}
              className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
            >
              <Star size={16} /> Nouvelle Évaluation
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluationsList.map((evalItem) => (
              <div key={evalItem.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors bg-gray-50/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{evalItem.name}</h4>
                    <p className="text-xs text-gray-500">{evalItem.role}</p>
                  </div>
                  <div className="bg-[#DDA956] text-[#1A1A1A] font-bold px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> {evalItem.score}
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dernière éval.</span>
                    <span className="font-medium">{evalItem.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prochaine éval.</span>
                    <span className="font-medium">{evalItem.next}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Formations & Développement</h3>
            <button 
              onClick={() => setIsTrainingModalOpen(true)}
              className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
            >
              <Plus size={16} /> Nouvelle Session
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainingSessions.map((training) => (
              <div key={training.id} className="border border-gray-100 rounded-xl p-5 flex flex-col justify-between hover:border-gray-200 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{training.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${training.status === 'Complété' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {training.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Formateur: {training.trainer}</p>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3 mt-2">
                  <div className="flex items-center gap-1 text-gray-500">
                    <CalendarCheck size={14} /> {training.date}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users size={14} /> {training.participants} inscrits
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Banknote size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Masse Salariale Nette (Totale)</p>
                <h4 className="text-2xl font-semibold text-gray-900">
                  {payrollList.reduce((acc, pay) => acc + Number(pay.net.replace(/[^0-9.-]+/g, "")), 0).toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                </h4>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Effectif Rémunéré</p>
                <h4 className="text-2xl font-semibold text-gray-900">
                  {payrollList.length}
                </h4>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Dernière Période</p>
                <h4 className="text-2xl font-semibold text-gray-900">
                  {payrollList.length > 0 ? payrollList[payrollList.length - 1].period : '-'}
                </h4>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Fiches de Paie</h3>
              <div className="flex gap-2">
              <button 
                onClick={() => setIsPayrollModalOpen(true)}
                className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
              >
                <Plus size={16} /> Générer Fiche
              </button>
              <button 
                onClick={() => showToast("Exportation de la masse salariale...")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Download size={16} /> Exporter Masse Salariale
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Période</th>
                  <th className="px-6 py-4">Employé</th>
                  <th className="px-6 py-4">Salaire Net</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payrollList.map((pay) => (
                  <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{pay.period}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{pay.name}</td>
                    <td className="px-6 py-4">{pay.net}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedPayslip(pay);
                          setIsPayslipDocOpen(true);
                        }}
                        className="text-gray-400 hover:text-[#DDA956] transition-colors p-2 rounded-lg hover:bg-amber-50"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Droits & Accès</h3>
            <button 
              onClick={() => {
                setEditingRole(null);
                setIsRoleModalOpen(true);
              }}
              className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
            >
              <Plus size={16} /> Nouveau Rôle
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rolesList.map((role) => (
              <div key={role.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Shield size={16} className="text-[#DDA956]" /> {role.role}
                  </h4>
                  <button 
                    onClick={() => {
                      setEditingRole(role);
                      setIsRoleModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-[#DDA956] transition-colors p-1"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">{role.access}</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <UserCheck size={14} /> {role.users} utilisateurs
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payslip Document Modal */}
      {isPayslipDocOpen && selectedPayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl sticky top-0 z-10">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-[#DDA956]" /> Fiche de Paie - {selectedPayslip.name}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => { try { if (window !== window.top) { showToast("L'impression est bloquée dans cet aperçu. Cliquez sur l'icône 'Ouvrir dans un nouvel onglet' (flèche en haut à droite).", "error"); } else { window.print(); } } catch(e) { showToast("Erreur d'impression", "error"); } }} className="px-4 py-1.5 bg-[#DDA956] text-[#1A1A1A] text-sm font-medium rounded-lg hover:bg-[#c4954b] transition-colors flex items-center gap-2">
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
                      <td className="border border-black py-1 bg-yellow-300 font-bold">{selectedPayslip.base?.toFixed(2) || '0.00'}</td>
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
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
                        <div className="h-4"></div>
                        <div className="h-4"></div>
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
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
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
                        <div>-</div>
                        <div>-</div>
                        <div>{selectedPayslip.base?.toFixed(2)}</div>
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
                        <div>{selectedPayslip.cnss?.toFixed(2)}</div>
                        <div>-</div>
                        <div>{selectedPayslip.amo?.toFixed(2)}</div>
                        <div>{selectedPayslip.igr?.toFixed(2)}</div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo (URL optionnelle)</label>
                  <input name="photo" defaultValue={editingStaff?.photo} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input name="name" defaultValue={editingStaff?.name} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Karim El Fassi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                  <input name="cin" defaultValue={editingStaff?.cin} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: A123456" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNSS</label>
                  <input name="cnss" defaultValue={editingStaff?.cnss} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 123456789" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <input name="role" defaultValue={editingStaff?.role} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Serveur" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <select name="department" defaultValue={editingStaff?.department || 'Salle'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="Salle">Salle</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Accueil">Accueil</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche</label>
                  <input name="hireDate" defaultValue={editingStaff?.hireDate} type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langues (séparées par virgule)</label>
                  <input name="language" defaultValue={editingStaff?.language} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Français, Arabe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" defaultValue={editingStaff?.email} type="email" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="email@exemple.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" defaultValue={editingStaff?.phone} type="tel" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="+212..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select name="status" defaultValue={editingStaff?.status || 'Actif'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="Actif">Actif</option>
                    <option value="En congé">En congé</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service (Optionnel)</label>
                  <select name="shift" defaultValue={editingStaff?.shift || '-'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="-">- Non assigné -</option>
                    <option value="Matin">Matin</option>
                    <option value="Soir">Soir</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire de Base (MAD)</label>
                  <input name="baseSalary" defaultValue={editingStaff?.baseSalary || 4000} type="number" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 4000" />
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
                    className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors"
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
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6">Mettez à jour le solde de congés annuels pour les employés.</p>
              <div className="space-y-4">
                {staffData.map(staff => (
                  <div key={staff.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                    <span className="font-medium text-gray-900">{staff.name}</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        defaultValue={21}
                        className="w-20 p-2 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" 
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
                  className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors"
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
              setEvaluationsList([...evaluationsList, {
                id: Date.now(),
                name: formData.get('staffName') as string,
                role: "Poste",
                score: `${formData.get('score')}/5`,
                date: "Aujourd'hui",
                next: "Dans 6 mois"
              }]);
              showToast("Évaluation enregistrée");
              setIsEvalModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="staffName" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]">
                    {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score global (sur 5)</label>
                  <input type="number" name="score" min="1" max="5" step="0.1" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires et points d'amélioration</label>
                  <textarea rows={4} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEvalModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">Sauvegarder</button>
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
                  <input type="text" name="title" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" name="date" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formateur</label>
                  <input type="text" name="trainer" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre prévu de participants</label>
                  <input type="number" name="participants" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTrainingModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">Planifier</button>
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
              if (editingRole) {
                setRolesList(rolesList.map(r => r.id === editingRole.id ? newRole : r));
                showToast("Rôle mis à jour");
              } else {
                setRolesList([...rolesList, newRole]);
                showToast("Rôle créé");
              }
              setIsRoleModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Rôle</label>
                  <input type="text" name="role" defaultValue={editingRole?.role} required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description des Accès</label>
                  <textarea name="access" defaultValue={editingRole?.access} rows={4} required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">{editingRole ? 'Enregistrer' : 'Créer'}</button>
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
                  <select name="shift" defaultValue={editingShift.current} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]">
                    <option value="Repos">Repos</option>
                    <option value="08:00 - 16:30">Matin (08:00 - 16:30)</option>
                    <option value="15:00 - 23:30">Soir (15:00 - 23:30)</option>
                    <option value="09:00 - 18:00">Journée (09:00 - 18:00)</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsShiftModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Import Attendance Modal */}
      {isImportAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-serif font-semibold text-gray-900">
                Importer des Pointages
              </h3>
              <button 
                onClick={() => setIsImportAttendanceModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Importez les fichiers de pointage générés par votre machine biométrique ou badgeuse.
                </p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#DDA956] transition-colors bg-gray-50 cursor-pointer">
                  <div className="flex justify-center mb-2 text-gray-400">
                    <Upload size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Cliquez ou glissez un fichier ici</p>
                  <p className="text-xs text-gray-500">Formats supportés: .CSV, .XLS, .XLSX (ZKTeco, etc.)</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setIsImportAttendanceModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    showToast("Importation du fichier de pointage démarrée...");
                    setIsImportAttendanceModalOpen(false);
                  }}
                  className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors"
                >
                  Sélectionner un fichier
                </button>
              </div>
            </div>
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
              setAttendanceList([...attendanceList, {
                id: Date.now(),
                name: formData.get('staffName') as string,
                in: formData.get('timeIn') as string || "-",
                out: formData.get('timeOut') as string || "-",
                status: formData.get('timeOut') ? "Terminé" : "En poste"
              }]);
              showToast("Pointage enregistré");
              setIsAttendanceModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="staffName" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]">
                    {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure d'arrivée</label>
                    <input type="time" name="timeIn" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure de départ (Optionnel)</label>
                    <input type="time" name="timeOut" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAttendanceModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">Enregistrer</button>
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

