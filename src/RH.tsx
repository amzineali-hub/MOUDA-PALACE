import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, FileText, CheckCircle, Clock, CalendarCheck, Settings, Search, Edit2, AlertTriangle, Plus, X, UploadCloud, Download, BookOpen, Star, Calculator, Lock, Filter, Timer, CalendarRange, Banknote, Shield, UserCheck, Printer, Trash2 } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import PlanningScheduler from './components/PlanningScheduler';
import { computePayroll, computeAbsenceDeduction } from './lib/payroll';
import { buildLetterheadHtml } from './lib/letterhead';

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

function PayrollModal({ isOpen, onClose, staffData, absencesList, onGenerate }: { isOpen: boolean, onClose: () => void, staffData: any[], absencesList: any[], onGenerate: (data: any) => void }) {
  const { showToast } = useToast();
  const [selectedStaffId, setSelectedStaffId] = useState(staffData[0]?.id || '');
  const [baseSalary, setBaseSalary] = useState<number>(staffData[0]?.baseSalary || 4000);
  const [avance, setAvance] = useState<number>(0);

  // staffData se charge en asynchrone (Firestore) : si la sélection initiale (faite avant
  // que la liste ne soit prête) ne correspond à aucun employé réel, on bascule sur le
  // premier disponible dès que possible — sinon le nom de l'employé restait vide sur la
  // fiche de paie générée alors que la liste déroulante semblait pourtant pré-remplie.
  useEffect(() => {
    if (staffData.length > 0 && !staffData.find(s => s.id === selectedStaffId)) {
      setSelectedStaffId(staffData[0].id);
    }
  }, [staffData, selectedStaffId]);

  useEffect(() => {
    const staff = staffData.find(s => s.id === selectedStaffId);
    if (staff && staff.baseSalary) {
      setBaseSalary(staff.baseSalary);
    }
  }, [selectedStaffId, staffData]);

  // Calculs Code du Travail Marocain (simplifiés) — voir src/lib/payroll.ts
  const { cnss, amo, igr, netSalary } = computePayroll(baseSalary);

  // Absences non encore déduites pour cet employé, au prorata temporis : taux horaire
  // (base / 191) pour une absence partielle avec des heures saisies, sinon taux journalier
  // (base / 26) pour une journée complète — voir src/lib/payroll.ts.
  const pendingAbsences = absencesList.filter(a => a.employeeId === selectedStaffId && !a.payslipId);
  const absenceFullDays = pendingAbsences.filter(a => !a.hours).length;
  const absenceHours = pendingAbsences.filter(a => a.hours > 0).reduce((sum, a) => sum + a.hours, 0);
  const absenceDeduction = computeAbsenceDeduction(baseSalary, pendingAbsences);
  const finalNet = netSalary - avance - absenceDeduction;

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
          const staff = staffData.find(s => s.id === selectedStaffId);
          if (!staff) {
            showToast('Veuillez sélectionner un employé', 'error');
            return;
          }
          onGenerate({
            period: formData.get('period'),
            employeeId: staff.id,
            staffName: staff?.name || '',
            staffRole: staff?.role || '',
            staffCnss: staff?.cnss || '',
            staffBirthDate: staff?.birthDate || '',
            staffFamilyStatus: staff?.familyStatus || '',
            staffHireDate: staff?.hireDate || '',
            base: baseSalary,
            cnss,
            amo,
            igr,
            net: netSalary,
            avance,
            absenceFullDays,
            absenceHours,
            absenceDeduction,
            absenceIds: pendingAbsences.map(a => a.id)
          });
        }} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
              <select
                required
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
              >
                {staffData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avance sur salaire (MAD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={avance || ''}
                onChange={(e) => setAvance(Number(e.target.value) || 0)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
                placeholder="0"
              />
            </div>

            {pendingAbsences.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700">
                <p className="font-medium mb-1">{pendingAbsences.length} absence(s) non déduite(s) pour cet employé :</p>
                <p>{pendingAbsences.map(a => `${a.date}${a.hours > 0 ? ` (${a.hours}h)` : ''}`).join(', ')}</p>
                <p className="mt-1">Déduction au prorata{absenceFullDays > 0 ? ` (${absenceFullDays} j complet(s))` : ''}{absenceHours > 0 ? ` (${absenceHours}h partielles)` : ''} : <strong>-{absenceDeduction.toFixed(2)} MAD</strong> — sera appliquée automatiquement à la génération.</p>
              </div>
            )}

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
              {avance > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Avance sur salaire</span>
                  <span className="font-medium text-red-600">-{avance.toFixed(2)}</span>
                </div>
              )}
              {absenceDeduction > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Absences ({pendingAbsences.length})</span>
                  <span className="font-medium text-red-600">-{absenceDeduction.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-900">Salaire Net à Payer</span>
                <span className="font-bold text-[#F4C75B] text-lg">{finalNet.toFixed(2)} MAD</span>
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

  const [payrollList, setPayrollList] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'payroll'), orderBy('createdAt', 'desc')), (snapshot) => {
      setPayrollList(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      console.error("Error fetching payroll", error);
    });
    return () => unsub();
  }, []);

  const [payrollSearchQuery, setPayrollSearchQuery] = useState('');
  const filteredPayrollList = payrollList.filter(item =>
    !payrollSearchQuery || (item.period || '').toLowerCase().includes(payrollSearchQuery.toLowerCase())
  );

  // Absences non justifiées, à déduire du salaire au prorata temporis (base / 26 jours ouvrés
  // par mois — convention de paie marocaine courante) lors de la prochaine fiche de paie de
  // l'employé concerné. `payslipId` reste null tant que l'absence n'a pas encore été déduite.
  const [absencesList, setAbsencesList] = useState<any[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'absences'), orderBy('date', 'desc')), (snapshot) => {
      setAbsencesList(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      console.error("Error fetching absences", error);
    });
    return () => unsub();
  }, []);

  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [absenceStaffTarget, setAbsenceStaffTarget] = useState<any>(null);

  const getPendingAbsences = (employeeId: string) =>
    absencesList.filter(a => a.employeeId === employeeId && !a.payslipId);

  const handleSaveAbsence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeId = formData.get('employeeId') as string;
    const staff = staffData.find(s => s.id === employeeId);
    if (!staff) return;
    try {
      await addDoc(collection(db, 'absences'), {
        employeeId,
        employeeName: staff.name,
        date: formData.get('date') as string,
        hours: Number(formData.get('hours')) || 0,
        reason: formData.get('reason') as string || '',
        payslipId: null,
        createdAt: serverTimestamp()
      });
      showToast('Absence enregistrée');
      setIsAbsenceModalOpen(false);
      setAbsenceStaffTarget(null);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'enregistrement", 'error');
    }
  };

  const handleDeleteAbsence = async (id: string) => {
    if (!window.confirm('Supprimer cette absence ?')) return;
    try {
      await deleteDoc(doc(db, 'absences', id));
      showToast('Absence supprimée');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleDeletePayslip = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette fiche de paie ?')) return;
    try {
      await deleteDoc(doc(db, 'payroll', id));
      showToast("Fiche de paie supprimée");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (!window.confirm('Supprimer cette évaluation ?')) return;
    try {
      await deleteDoc(doc(db, 'evaluations', id));
      showToast("Évaluation supprimée");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleDeleteTraining = async (id: string) => {
    if (!window.confirm('Supprimer cette formation ?')) return;
    try {
      await deleteDoc(doc(db, 'training', id));
      showToast("Formation supprimée");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!window.confirm('Supprimer ce rôle ?')) return;
    try {
      await deleteDoc(doc(db, 'roles', id));
      showToast("Rôle supprimé");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la suppression", "error");
    }
  };

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isPayslipDocOpen, setIsPayslipDocOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  // Informations légales de l'établissement, pour l'en-tête unifiée des documents RH
  // imprimés (même source que les factures — Configuration > Général + Site Web).
  const [companyInfo, setCompanyInfo] = useState<any>({});
  useEffect(() => {
    const unsubGeneral = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) setCompanyInfo((prev: any) => ({ ...prev, ...snap.data() }));
    }, (error) => console.error("Error fetching company settings", error));
    const unsubWebsite = onSnapshot(doc(db, 'settings', 'website'), (snap) => {
      if (snap.exists()) setCompanyInfo((prev: any) => ({ ...prev, website: snap.data().url }));
    }, (error) => console.error("Error fetching website settings", error));
    return () => { unsubGeneral(); unsubWebsite(); };
  }, []);

  // Documents RH — génération instantanée (Fiche individuelle, Attestation, Certificat,
  // Solde de tout compte) à partir des données déjà présentes sur la fiche employé.
  const [isHrDocModalOpen, setIsHrDocModalOpen] = useState(false);
  const [hrDocType, setHrDocType] = useState<'fiche' | 'attestation' | 'certificat' | 'solde' | 'cdi' | 'cdd' | 'stage'>('attestation');
  const [hrDocStaffId, setHrDocStaffId] = useState('');

  const HR_DOC_LABELS: Record<string, string> = {
    fiche: 'Fiche individuelle du salarié',
    attestation: 'Attestation de travail',
    certificat: 'Certificat de travail',
    solde: 'Solde de tout compte',
    cdi: 'Contrat à durée indéterminée (CDI)',
    cdd: 'Contrat à durée déterminée (CDD)',
    stage: 'Convention de stage'
  };

  const openHrDocModal = (type: typeof hrDocType) => {
    setHrDocType(type);
    setHrDocStaffId(staffData[0]?.id || '');
    setIsHrDocModalOpen(true);
  };

  const todayFr = () => new Date().toLocaleDateString('fr-FR');

  // Formatte une date ISO (YYYY-MM-DD, celle des <input type="date">) en jj/mm/aaaa pour
  // l'affichage sur les documents imprimés — les champs `birthDate`/`hireDate` sont stockés
  // au format ISO côté Firestore.
  const formatIsoDateFr = (iso?: string) => {
    if (!iso) return '-';
    const [y, m, d] = iso.split('-');
    return (y && m && d) ? `${d}/${m}/${y}` : '-';
  };

  // "SF" (situation familiale) sur le bulletin de paie suit la convention marocaine courante :
  // C = Célibataire, M = Marié(e), D = Divorcé(e), V = Veuf(ve).
  const familyStatusCode = (status?: string) => {
    if (!status) return '-';
    const map: Record<string, string> = { 'Célibataire': 'C', 'Marié(e)': 'M', 'Divorcé(e)': 'D', 'Veuf(ve)': 'V' };
    return map[status] || status.charAt(0).toUpperCase();
  };

  const FR_MONTHS: Record<string, number> = {
    'jan': 0, 'fév': 1, 'fev': 1, 'mar': 2, 'avr': 3, 'mai': 4, 'juin': 5, 'juil': 6,
    'aoû': 7, 'aou': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'déc': 11, 'dec': 11
  };

  // La période de paie est saisie en texte libre (ex: "Juil 2026") — on en extrait le
  // dernier jour du mois / mois / année réels pour le cartouche "PERIODE DE PAIE" du
  // bulletin, plutôt que d'y figer des valeurs bidon.
  const parsePayrollPeriod = (period?: string): { day: string, month: string, year: string } => {
    const fallback = { day: '-', month: '-', year: '-' };
    if (!period) return fallback;
    const match = period.match(/([a-zA-Zéû]{3,})\.?\s+(\d{4})/);
    if (!match) return fallback;
    const key = match[1].slice(0, 3).toLowerCase();
    const monthIdx = FR_MONTHS[key];
    if (monthIdx === undefined) return fallback;
    const year = Number(match[2]);
    const lastDay = new Date(year, monthIdx + 1, 0).getDate();
    return { day: String(lastDay), month: String(monthIdx + 1).padStart(2, '0'), year: String(year) };
  };

  const generateHrDocument = (formData: FormData) => {
    const staff = staffData.find(s => s.id === hrDocStaffId);
    if (!staff) { showToast('Veuillez sélectionner un employé', 'error'); return; }

    const value = (field: string, fallback = '-') => (formData.get(field) as string) || fallback;
    const employeeName = value('name', staff.name || '-');
    const cin = value('cin', staff.cin || '-');
    const cnss = value('cnss', staff.cnss || '-');
    const role = value('role', staff.role || '-');
    const department = value('department', staff.department || '-');
    const hireDate = formatIsoDateFr(value('hireDate', staff.hireDate));
    const contractType = value('contractType', staff.contractType || '-');
    const baseSalary = Number(formData.get('baseSalary')) || 0;
    const phone = value('phone', staff.phone || '-');
    const email = value('email', staff.email || '-');
    const address = value('address', staff.address || '-');
    const emergencyContact = value('emergencyContact', staff.emergencyContact || '-');
    const carteSanitaire = value('carteSanitaire', staff.carteSanitaire || '-');

    let title = HR_DOC_LABELS[hrDocType];
    let bodyHtml = '';

    if (hrDocType === 'fiche') {
      const rows: [string, string][] = [
        ['Nom et prénom', employeeName], ['CIN', cin], ['CNSS', cnss], ['Poste', role],
        ['Service / Département', department], ["Date d'embauche", hireDate],
        ['Type de contrat', contractType], ['Salaire de base', baseSalary ? `${baseSalary} MAD` : '-'],
        ['Téléphone', phone], ['Email', email], ['Adresse', address],
        ["Contact d'urgence", emergencyContact], ['Carte Sanitaire', carteSanitaire]
      ];
      bodyHtml = `
        <h2 style="text-align:center;">FICHE INDIVIDUELLE DU SALARIÉ</h2>
        <table class="hr-table">
          ${rows.map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`).join('')}
        </table>
      `;
    } else if (hrDocType === 'attestation') {
      bodyHtml = `
        <h2 style="text-align:center;">ATTESTATION DE TRAVAIL</h2>
        <p class="hr-letter">
          Je soussigné(e), agissant en qualité de Direction de la société <strong>${companyInfo.name || 'Mouda Palace'}</strong>,
          atteste que <strong>${employeeName}</strong>, titulaire de la CIN n° <strong>${cin}</strong>,
          travaille au sein de notre établissement en qualité de <strong>${role}</strong>
          depuis le <strong>${hireDate}</strong>.
        </p>
        <p class="hr-letter">La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.</p>
        <p class="hr-letter">Fait à ${(companyInfo.address || '').split(',').pop()?.trim() || 'Fès'}, le ${todayFr()}</p>
        <p class="hr-sign">Signature et cachet de l'entreprise</p>
      `;
    } else if (hrDocType === 'certificat') {
      const endDate = formData.get('endDate') ? formatIsoDateFr(value('endDate')) : todayFr();
      bodyHtml = `
        <h2 style="text-align:center;">CERTIFICAT DE TRAVAIL</h2>
        <p class="hr-letter">
          Je soussigné(e), agissant en qualité de Direction de la société <strong>${companyInfo.name || 'Mouda Palace'}</strong>,
          certifie que <strong>${employeeName}</strong>, titulaire de la CIN n° <strong>${cin}</strong>,
          a travaillé au sein de notre établissement en qualité de <strong>${role}</strong>
          du <strong>${hireDate}</strong> au <strong>${endDate}</strong>.
        </p>
        <p class="hr-letter">Le présent certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.</p>
        <p class="hr-letter">Fait à ${(companyInfo.address || '').split(',').pop()?.trim() || 'Fès'}, le ${todayFr()}</p>
        <p class="hr-sign">Signature et cachet de l'entreprise</p>
      `;
    } else if (hrDocType === 'solde') {
      const extra = Number(formData.get('soldeExtra')) || 0;
      const extraLabel = value('soldeExtraLabel', 'Indemnités complémentaires');
      const base = baseSalary;
      const total = base + extra;
      bodyHtml = `
        <div class="hr-warning">⚠️ Modèle à faire valider par votre comptable ou conseil juridique avant remise au salarié — ce montant ne constitue pas un calcul légal définitif.</div>
        <h2 style="text-align:center;">SOLDE DE TOUT COMPTE</h2>
        <table class="hr-table">
          <tr><th>Salarié</th><td>${employeeName}</td></tr>
          <tr><th>CIN</th><td>${cin}</td></tr>
          <tr><th>Poste</th><td>${role}</td></tr>
          <tr><th>Date d'embauche</th><td>${hireDate}</td></tr>
          <tr><th>Dernier salaire de base</th><td>${base.toFixed(2)} MAD</td></tr>
          <tr><th>${extraLabel}</th><td>${extra.toFixed(2)} MAD</td></tr>
          <tr class="hr-total-row"><th>TOTAL NET</th><td>${total.toFixed(2)} MAD</td></tr>
        </table>
        <p class="hr-letter">Le salarié reconnaît avoir reçu, à titre de solde de tout compte, la somme indiquée ci-dessus.</p>
        <p class="hr-sign">Signature salarié : ___________________ &nbsp;&nbsp;&nbsp; Signature employeur : ___________________</p>
      `;
    } else if (hrDocType === 'cdi') {
      const workLocation = value('workLocation', companyInfo.address || '-');
      bodyHtml = `
        <h2 style="text-align:center;">CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE (CDI)</h2>
        <p class="hr-letter">
          Entre la société <strong>${companyInfo.name || 'Mouda Palace'}</strong>${companyInfo.rc ? ` (RC n° ${companyInfo.rc})` : ''}, représentée par sa Direction,
          ci-après « l'Employeur »,
        </p>
        <p class="hr-letter">
          Et <strong>${employeeName}</strong>, titulaire de la CIN n° <strong>${cin}</strong>, domicilié(e) à ${address},
          ci-après « le Salarié »,
        </p>
        <p class="hr-letter">il a été convenu ce qui suit :</p>
        <p class="hr-article"><strong>Article 1 — Fonction et lieu de travail.</strong> Le salarié est engagé en qualité de <strong>${role}</strong>. Lieu principal de travail : <strong>${workLocation}</strong>.</p>
        <p class="hr-article"><strong>Article 2 — Date de prise d'effet.</strong> Le contrat prend effet le <strong>${hireDate}</strong>.</p>
        <p class="hr-article"><strong>Article 3 — Rémunération.</strong> La rémunération est fixée à <strong>${baseSalary.toFixed(2)} MAD</strong> selon les modalités applicables dans l'entreprise.</p>
        <p class="hr-article"><strong>Article 4 — Durée du travail.</strong> La durée et l'organisation du travail sont celles applicables à l'entreprise et conformément aux dispositions légales en vigueur.</p>
        <p class="hr-article"><strong>Article 5 — Congés et absences.</strong> Les congés et absences sont gérés conformément aux dispositions légales et aux procédures internes applicables.</p>
        <p class="hr-article"><strong>Article 6 — Obligations professionnelles.</strong> Le salarié s'engage notamment à respecter les règles de sécurité, d'hygiène, de confidentialité, de discipline et le règlement intérieur de l'entreprise.</p>
        <p class="hr-article"><strong>Article 7 — Fin du contrat.</strong> La fin du contrat est régie par les dispositions légales applicables.</p>
        <p class="hr-letter">Fait à ${(companyInfo.address || '').split(',').pop()?.trim() || 'Fès'}, le ${todayFr()}, en deux exemplaires originaux.</p>
        <p class="hr-sign">L'Employeur : ___________________________ &nbsp;&nbsp;&nbsp; Le Salarié : ___________________________</p>
      `;
    } else if (hrDocType === 'cdd') {
      const workLocation = value('workLocation', companyInfo.address || '-');
      const motif = value('motif');
      const endDate = formatIsoDateFr(value('endDate'));
      bodyHtml = `
        <h2 style="text-align:center;">CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE (CDD)</h2>
        <p class="hr-letter">
          Entre la société <strong>${companyInfo.name || 'Mouda Palace'}</strong>${companyInfo.rc ? ` (RC n° ${companyInfo.rc})` : ''}, représentée par sa Direction,
          ci-après « l'Employeur »,
        </p>
        <p class="hr-letter">
          Et <strong>${employeeName}</strong>, titulaire de la CIN n° <strong>${cin}</strong>,
          ci-après « le Salarié »,
        </p>
        <p class="hr-letter">il a été convenu les conditions suivantes :</p>
        <table class="hr-table">
          <tr><th>Fonction</th><td>${role}</td></tr>
          <tr><th>Motif légal du recours au CDD</th><td>${motif}</td></tr>
          <tr><th>Date de début</th><td>${hireDate}</td></tr>
          <tr><th>Date de fin</th><td>${endDate}</td></tr>
          <tr><th>Lieu de travail</th><td>${workLocation}</td></tr>
          <tr><th>Rémunération (MAD)</th><td>${baseSalary.toFixed(2)}</td></tr>
        </table>
        <p class="hr-letter">Les autres conditions de travail sont celles prévues par le présent contrat, le règlement intérieur et les dispositions légales applicables.</p>
        <p class="hr-letter">Fait à ${(companyInfo.address || '').split(',').pop()?.trim() || 'Fès'}, le ${todayFr()}, en deux exemplaires originaux.</p>
        <p class="hr-sign">L'Employeur : ___________________________ &nbsp;&nbsp;&nbsp; Le Salarié : ___________________________</p>
      `;
    } else if (hrDocType === 'stage') {
      const workLocation = value('workLocation', companyInfo.address || '-');
      const school = value('school');
      const supervisor = value('supervisor');
      const endDate = formatIsoDateFr(value('endDate'));
      const stipend = Number(formData.get('stipend')) || 0;
      bodyHtml = `
        <h2 style="text-align:center;">CONVENTION DE STAGE</h2>
        <p class="hr-letter">
          Entre la société <strong>${companyInfo.name || 'Mouda Palace'}</strong>${companyInfo.rc ? ` (RC n° ${companyInfo.rc})` : ''}, représentée par sa Direction,
          ci-après « l'Entreprise d'accueil »,
        </p>
        <p class="hr-letter">
          Et <strong>${employeeName}</strong>, titulaire de la CIN n° <strong>${cin}</strong>, stagiaire au sein de <strong>${school}</strong>,
          ci-après « le/la Stagiaire »,
        </p>
        <p class="hr-letter">il a été convenu les conditions suivantes :</p>
        <table class="hr-table">
          <tr><th>Poste / Mission de stage</th><td>${role}</td></tr>
          <tr><th>Établissement de formation</th><td>${school}</td></tr>
          <tr><th>Date de début</th><td>${hireDate}</td></tr>
          <tr><th>Date de fin</th><td>${endDate}</td></tr>
          <tr><th>Lieu de stage</th><td>${workLocation}</td></tr>
          <tr><th>Tuteur / Encadrant</th><td>${supervisor}</td></tr>
          <tr><th>Indemnité de stage (MAD)</th><td>${stipend > 0 ? stipend.toFixed(2) : 'Non rémunéré'}</td></tr>
        </table>
        <p class="hr-letter">Le/la stagiaire s'engage à respecter le règlement intérieur, les règles d'hygiène et de sécurité, ainsi que la confidentialité des informations de l'entreprise. La présente convention ne constitue pas un contrat de travail et n'ouvre droit à aucune rémunération autre que l'indemnité éventuelle mentionnée ci-dessus.</p>
        <p class="hr-letter">Fait à ${(companyInfo.address || '').split(',').pop()?.trim() || 'Fès'}, le ${todayFr()}, en deux exemplaires originaux.</p>
        <p class="hr-sign">L'Entreprise d'accueil : ___________________________ &nbsp;&nbsp;&nbsp; Le/La Stagiaire : ___________________________</p>
      `;
    }

    const html = buildLetterheadHtml(companyInfo, window.location.origin, {
      title: `${title} - ${employeeName}`,
      bodyHtml,
      extraStyles: `
        .hr-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .hr-table th { text-align: left; padding: 10px; border: 1px solid #eee; background: #f9f9f9; width: 40%; }
        .hr-table td { padding: 10px; border: 1px solid #eee; }
        .hr-total-row th, .hr-total-row td { font-weight: bold; background: #FDF6E7; }
        .hr-letter { line-height: 2; font-size: 15px; margin: 20px 0; }
        .hr-article { line-height: 1.8; font-size: 14px; margin: 14px 0; }
        .hr-sign { margin-top: 60px; text-align: right; font-size: 14px; }
        .hr-warning { background: #FEF2F2; border: 1px solid #FCA5A5; color: #B91C1C; padding: 10px 16px; border-radius: 6px; font-size: 12px; margin-bottom: 20px; }
      `
    });

    const printWindow = window.open('', '', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
    setIsHrDocModalOpen(false);
  };

  // Demandes de congé — distinctes des absences (non planifiées, déduites du salaire) :
  // un congé est une demande d'absence planifiée, soumise à acceptation/refus.
  const [congesList, setCongesList] = useState<any[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'conges'), orderBy('createdAt', 'desc')), (snapshot) => {
      setCongesList(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    }, (error) => console.error("Error fetching conges", error));
    return () => unsub();
  }, []);

  const [isCongeModalOpen, setIsCongeModalOpen] = useState(false);

  const handleSaveConge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeId = formData.get('employeeId') as string;
    const staff = staffData.find(s => s.id === employeeId);
    if (!staff) return;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const days = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1;
    try {
      await addDoc(collection(db, 'conges'), {
        employeeId,
        employeeName: staff.name,
        startDate,
        endDate,
        days: days > 0 ? days : 1,
        motif: (formData.get('motif') as string) || '',
        status: 'En attente',
        createdAt: serverTimestamp()
      });
      showToast('Demande de congé enregistrée');
      setIsCongeModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'enregistrement", 'error');
    }
  };

  const handleCongeDecision = async (id: string, status: 'Acceptée' | 'Refusée') => {
    try {
      await updateDoc(doc(db, 'conges', id), { status, decisionAt: serverTimestamp() });
      showToast(`Demande ${status.toLowerCase()}`);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDeleteConge = async (id: string) => {
    if (!window.confirm('Supprimer cette demande de congé ?')) return;
    try {
      await deleteDoc(doc(db, 'conges', id));
      showToast('Demande supprimée');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const printConge = (conge: any) => {
    const bodyHtml = `
      <h2 style="text-align:center;">DEMANDE DE CONGÉ</h2>
      <table class="hr-table">
        <tr><th>Nom et prénom</th><td>${conge.employeeName}</td></tr>
        <tr><th>Date de la demande</th><td>${conge.createdAt?.toDate ? conge.createdAt.toDate().toLocaleDateString('fr-FR') : '-'}</td></tr>
        <tr><th>Période demandée</th><td>Du ${conge.startDate} au ${conge.endDate} (${conge.days} jour(s))</td></tr>
        <tr><th>Motif</th><td>${conge.motif || '-'}</td></tr>
        <tr><th>Décision</th><td><strong>${conge.status}</strong></td></tr>
      </table>
      <p class="hr-sign">Signature du salarié : ___________________ &nbsp;&nbsp;&nbsp; Signature responsable : ___________________</p>
    `;
    const html = buildLetterheadHtml(companyInfo, window.location.origin, {
      title: `Demande de congé - ${conge.employeeName}`,
      bodyHtml,
      extraStyles: `
        .hr-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .hr-table th { text-align: left; padding: 10px; border: 1px solid #eee; background: #f9f9f9; width: 40%; }
        .hr-table td { padding: 10px; border: 1px solid #eee; }
        .hr-sign { margin-top: 60px; text-align: right; font-size: 14px; }
      `
    });
    const printWindow = window.open('', '', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };


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
      carteSanitaire: formData.get('carteSanitaire') as string,
      hireDate: formData.get('hireDate') as string,
      language: formData.get('language') as string,
      address: formData.get('address') as string,
      emergencyContact: formData.get('emergencyContact') as string,
      contractType: formData.get('contractType') as string || 'CDI',
      birthDate: formData.get('birthDate') as string,
      familyStatus: formData.get('familyStatus') as string || 'Célibataire',
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
          { id: 'hr_docs', label: 'Documents RH', icon: FileText },
          { id: 'evaluations', label: 'Évaluations', icon: Star },
          { id: 'training', label: 'Formations', icon: BookOpen },
          { id: 'roles', label: 'Rôles & Accès', icon: Shield },
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
                       <p><span className="font-medium text-gray-900">Carte Sanitaire:</span> {staff.carteSanitaire || <span className="text-amber-600">Non renseignée</span>}</p>
                       <p>
                         <span className="font-medium text-gray-900">Absences en attente:</span>{' '}
                         {getPendingAbsences(staff.id).length > 0 ? (
                           <span className="text-red-600 font-medium">{getPendingAbsences(staff.id).length} absence(s)</span>
                         ) : (
                           <span className="text-gray-400">Aucune</span>
                         )}
                       </p>
                    </div>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                       <span className={`px-3 py-1 text-xs font-medium rounded-full ${staff.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{staff.status}</span>
                       <div className="flex gap-2">
                         <button onClick={() => { setAbsenceStaffTarget(staff); setIsAbsenceModalOpen(true); }} className="text-orange-500 hover:text-orange-700 p-2 bg-orange-50 rounded-lg" title="Signaler une absence">
                            <CalendarCheck size={16} />
                         </button>
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
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-bold text-gray-900">Historique des Paies</h3>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher une période (ex: Juil 2026)..."
                    value={payrollSearchQuery}
                    onChange={(e) => setPayrollSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F4C75B]"
                  />
                </div>
                <button onClick={() => setIsPayrollModalOpen(true)} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-black transition-colors whitespace-nowrap">
                   <Calculator size={18} /> Générer une fiche
                </button>
              </div>
           </div>

           <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50 border-b border-gray-100">
                     <th className="p-4 font-medium text-gray-600">Employé</th>
                     <th className="p-4 font-medium text-gray-600">Période</th>
                     <th className="p-4 font-medium text-gray-600">Base</th>
                     <th className="p-4 font-medium text-gray-600">Avance/Salaire</th>
                     <th className="p-4 font-medium text-gray-600">Net</th>
                     <th className="p-4 font-medium text-gray-600">Statut</th>
                     <th className="p-4 font-medium text-gray-600 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {filteredPayrollList.map((item, idx) => {
                     const grossNet = parseFloat(item.net) || 0;
                     const avance = Number(item.avance) || 0;
                     const absenceDeduction = Number(item.absenceDeduction) || 0;
                     const netAPayer = grossNet - avance - absenceDeduction;
                     return (
                     <tr key={idx} className="hover:bg-gray-50 transition-colors">
                       <td className="p-4 font-medium text-gray-900">{item.name}</td>
                       <td className="p-4 text-gray-600">{item.period}</td>
                       <td className="p-4 text-gray-600">{item.base} MAD</td>
                       <td className="p-4 text-gray-600">
                         <input
                           type="number"
                           min="0"
                           step="0.01"
                           defaultValue={avance || ''}
                           placeholder="0"
                           onBlur={async (e) => {
                             const newAvance = Number(e.target.value) || 0;
                             if (newAvance === avance) return;
                             try {
                               await updateDoc(doc(db, 'payroll', item.id), { avance: newAvance });
                               showToast('Avance mise à jour');
                             } catch (err) {
                               console.error(err);
                               showToast('Erreur lors de la mise à jour', 'error');
                             }
                           }}
                           className="w-24 border border-gray-200 rounded-lg p-1.5 text-sm focus:outline-none focus:border-[#F4C75B]"
                         />
                       </td>
                       <td className="p-4 font-bold text-green-600">
                         {netAPayer.toFixed(2)} MAD
                         {(avance > 0 || absenceDeduction > 0) && <div className="text-xs font-normal text-gray-400">Brut : {grossNet.toFixed(2)} MAD</div>}
                         {absenceDeduction > 0 && (
                           <div className="text-xs font-normal text-red-500">
                             Absences ({[item.absenceFullDays > 0 ? `${item.absenceFullDays}j` : '', item.absenceHours > 0 ? `${item.absenceHours}h` : ''].filter(Boolean).join(' + ')}) : -{absenceDeduction.toFixed(2)} MAD
                           </div>
                         )}
                       </td>
                       <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{item.status}</span></td>
                       <td className="p-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button onClick={() => { setSelectedPayslip(item); setIsPayslipDocOpen(true); }} className="text-[#F4C75B] hover:text-[#E5B745] p-2 bg-amber-50 rounded-lg" title="Voir la fiche">
                             <FileText size={16} />
                           </button>
                           <button onClick={() => handleDeletePayslip(item.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg" title="Supprimer">
                             <Trash2 size={16} />
                           </button>
                         </div>
                       </td>
                     </tr>
                     );
                   })}
                   {filteredPayrollList.length === 0 && (
                     <tr>
                       <td colSpan={7} className="p-8 text-center text-gray-500">{payrollSearchQuery ? 'Aucune fiche ne correspond à cette recherche.' : 'Aucune fiche de paie générée.'}</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      )}
      
      {activeTab === 'schedule' && ( <div className='mt-6'><PlanningScheduler staffData={staffData} /></div> )}

      {activeTab === 'hr_docs' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Documents RH</h3>
            <p className="text-sm text-gray-500 mb-4">Générés automatiquement depuis les données de la fiche employé, sur le papier en-tête officiel.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {([
                { type: 'fiche' as const, badge: 'bg-amber-50 text-amber-600', border: 'hover:border-amber-300' },
                { type: 'attestation' as const, badge: 'bg-teal-50 text-teal-600', border: 'hover:border-teal-300' },
                { type: 'certificat' as const, badge: 'bg-rose-50 text-rose-600', border: 'hover:border-rose-300' },
                { type: 'solde' as const, badge: 'bg-orange-50 text-orange-600', border: 'hover:border-orange-300' },
              ]).map(({ type, badge, border }) => (
                <button
                  key={type}
                  onClick={() => openHrDocModal(type)}
                  className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md ${border} transition-all text-left flex flex-col gap-3`}
                >
                  <div className={`w-10 h-10 rounded-xl ${badge} flex items-center justify-center`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{HR_DOC_LABELS[type]}</p>
                    <p className="text-xs text-gray-400 mt-1">Sélectionner un employé et imprimer</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Contrats et avenants</h3>
            <p className="text-sm text-gray-500 mb-4">Modèles à personnaliser et faire valider par votre comptable ou conseil juridique avant signature.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {([
                { type: 'cdi' as const, badge: 'bg-blue-50 text-blue-600', border: 'hover:border-blue-300' },
                { type: 'cdd' as const, badge: 'bg-violet-50 text-violet-600', border: 'hover:border-violet-300' },
                { type: 'stage' as const, badge: 'bg-emerald-50 text-emerald-600', border: 'hover:border-emerald-300' },
              ]).map(({ type, badge, border }) => (
                <button
                  key={type}
                  onClick={() => openHrDocModal(type)}
                  className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md ${border} transition-all text-left flex flex-col gap-3`}
                >
                  <div className={`w-10 h-10 rounded-xl ${badge} flex items-center justify-center`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{HR_DOC_LABELS[type]}</p>
                    <p className="text-xs text-gray-400 mt-1">Sélectionner un employé et imprimer</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Demandes de congé</h3>
                <p className="text-sm text-gray-500">Distinctes des absences non justifiées — un congé est planifié et soumis à décision.</p>
              </div>
              <button onClick={() => setIsCongeModalOpen(true)} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-black transition-colors">
                <Plus size={18} /> Nouvelle demande
              </button>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 font-medium text-gray-600">Employé</th>
                      <th className="p-4 font-medium text-gray-600">Période</th>
                      <th className="p-4 font-medium text-gray-600">Jours</th>
                      <th className="p-4 font-medium text-gray-600">Motif</th>
                      <th className="p-4 font-medium text-gray-600">Statut</th>
                      <th className="p-4 font-medium text-gray-600 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {congesList.map((conge, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{conge.employeeName}</td>
                        <td className="p-4 text-gray-600">{conge.startDate} → {conge.endDate}</td>
                        <td className="p-4 text-gray-600">{conge.days}</td>
                        <td className="p-4 text-gray-600">{conge.motif || '—'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            conge.status === 'Acceptée' ? 'bg-green-100 text-green-700' :
                            conge.status === 'Refusée' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>{conge.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {conge.status === 'En attente' && (
                              <>
                                <button onClick={() => handleCongeDecision(conge.id, 'Acceptée')} className="text-green-600 hover:text-green-700 p-2 bg-green-50 rounded-lg" title="Accepter">
                                  <CheckCircle size={16} />
                                </button>
                                <button onClick={() => handleCongeDecision(conge.id, 'Refusée')} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg" title="Refuser">
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            <button onClick={() => printConge(conge)} className="text-[#F4C75B] hover:text-[#E5B745] p-2 bg-amber-50 rounded-lg" title="Imprimer">
                              <Printer size={16} />
                            </button>
                            <button onClick={() => handleDeleteConge(conge.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg" title="Supprimer">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {congesList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">Aucune demande de congé.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Évaluations</h3>
              <p className="text-sm text-gray-500">Suivi des évaluations de performance du personnel.</p>
            </div>
            <button onClick={() => setIsEvalModalOpen(true)} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-black transition-colors">
              <Plus size={18} /> Nouvelle évaluation
            </button>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-medium text-gray-600">Employé</th>
                    <th className="p-4 font-medium text-gray-600">Poste</th>
                    <th className="p-4 font-medium text-gray-600">Score</th>
                    <th className="p-4 font-medium text-gray-600">Date</th>
                    <th className="p-4 font-medium text-gray-600">Prochaine éval.</th>
                    <th className="p-4 font-medium text-gray-600">Commentaires</th>
                    <th className="p-4 font-medium text-gray-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {evaluationsList.map(ev => (
                    <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{ev.name}</td>
                      <td className="p-4 text-gray-600">{ev.role || '-'}</td>
                      <td className="p-4 text-gray-600">
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">{ev.score}</span>
                      </td>
                      <td className="p-4 text-gray-600">{ev.date}</td>
                      <td className="p-4 text-gray-600">{ev.next}</td>
                      <td className="p-4 text-gray-500 max-w-xs truncate" title={ev.comments}>{ev.comments || '—'}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteEvaluation(ev.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {evaluationsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">Aucune évaluation enregistrée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Formations</h3>
              <p className="text-sm text-gray-500">Sessions de formation planifiées pour le personnel.</p>
            </div>
            <button onClick={() => setIsTrainingModalOpen(true)} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-black transition-colors">
              <Plus size={18} /> Nouvelle formation
            </button>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-medium text-gray-600">Titre</th>
                    <th className="p-4 font-medium text-gray-600">Date</th>
                    <th className="p-4 font-medium text-gray-600">Formateur</th>
                    <th className="p-4 font-medium text-gray-600">Participants</th>
                    <th className="p-4 font-medium text-gray-600">Statut</th>
                    <th className="p-4 font-medium text-gray-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trainingSessions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{t.title}</td>
                      <td className="p-4 text-gray-600">{t.date}</td>
                      <td className="p-4 text-gray-600">{t.trainer}</td>
                      <td className="p-4 text-gray-600">{t.participants}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{t.status}</span></td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteTraining(t.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {trainingSessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">Aucune formation planifiée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Rôles & Accès</h3>
              <p className="text-sm text-gray-500">Définition des rôles et de leurs droits d'accès à l'ERP.</p>
            </div>
            <button onClick={() => { setEditingRole(null); setIsRoleModalOpen(true); }} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-black transition-colors">
              <Plus size={18} /> Nouveau rôle
            </button>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-medium text-gray-600">Rôle</th>
                    <th className="p-4 font-medium text-gray-600">Description des accès</th>
                    <th className="p-4 font-medium text-gray-600">Utilisateurs</th>
                    <th className="p-4 font-medium text-gray-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rolesList.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{r.role}</td>
                      <td className="p-4 text-gray-600 max-w-md">{r.access}</td>
                      <td className="p-4 text-gray-600">{r.users || 0}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingRole(r); setIsRoleModalOpen(true); }} className="text-[#F4C75B] hover:text-[#E5B745] p-2 bg-amber-50 rounded-lg" title="Modifier">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteRole(r.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg" title="Supprimer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rolesList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">Aucun rôle défini.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HR Document Generation Modal */}
      {isHrDocModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">{HR_DOC_LABELS[hrDocType]}</h3>
              <button onClick={() => setIsHrDocModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form key={hrDocStaffId} onSubmit={(e) => { e.preventDefault(); generateHrDocument(new FormData(e.currentTarget)); }} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select required value={hrDocStaffId} onChange={(e) => setHrDocStaffId(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]">
                    {staffData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom et prénom</label>
                  <input name="name" required defaultValue={staffData.find(s => s.id === hrDocStaffId)?.name || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                  <input name="cin" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.cin || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNSS</label>
                  <input name="cnss" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.cnss || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                  <input name="role" required defaultValue={staffData.find(s => s.id === hrDocStaffId)?.role || ''} placeholder="Saisie libre" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <select name="department" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.department || 'Salle'} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]">
                    <option value="Salle">Salle</option><option value="Cuisine">Cuisine</option>
                    <option value="Accueil">Accueil</option><option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche</label>
                  <input name="hireDate" type="date" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.hireDate || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
                  <select name="contractType" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.contractType || 'CDI'} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]">
                    <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="Stage">Stage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire de base (MAD)</label>
                  <input name="baseSalary" type="number" min="0" step="0.01" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.baseSalary || 0} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.phone || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.email || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input name="address" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.address || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact d'urgence</label>
                  <input name="emergencyContact" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.emergencyContact || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carte sanitaire</label>
                  <input name="carteSanitaire" defaultValue={staffData.find(s => s.id === hrDocStaffId)?.carteSanitaire || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                {hrDocType === 'certificat' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin de contrat</label>
                    <input type="date" name="endDate" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                  </div>
                )}
                {hrDocType === 'cdi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de travail</label>
                    <input type="text" name="workLocation" required defaultValue={companyInfo.address || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                  </div>
                )}
                {hrDocType === 'cdd' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de travail</label>
                      <input type="text" name="workLocation" required defaultValue={companyInfo.address || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin du CDD</label>
                      <input type="date" name="endDate" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motif légal du recours au CDD</label>
                      <input type="text" name="motif" required placeholder="Ex: surcroît temporaire d'activité, remplacement d'un salarié absent..." className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                    </div>
                  </>
                )}
                {hrDocType === 'stage' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de stage</label>
                      <input type="text" name="workLocation" required defaultValue={companyInfo.address || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin du stage</label>
                      <input type="date" name="endDate" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Établissement de formation</label>
                      <input type="text" name="school" required placeholder="Ex: OFPPT, Université..." className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tuteur / Encadrant</label>
                      <input type="text" name="supervisor" placeholder="Nom du responsable de stage" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Indemnité de stage (MAD, optionnel)</label>
                      <input type="number" name="stipend" min="0" step="0.01" placeholder="0 = non rémunéré" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                    </div>
                  </>
                )}
                {hrDocType === 'solde' && (
                  <>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700">
                      Modèle à faire valider par votre comptable ou conseil juridique avant remise au salarié.
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Libellé du montant complémentaire</label>
                      <input type="text" name="soldeExtraLabel" defaultValue="Indemnités complémentaires" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Montant complémentaire (MAD)</label>
                      <input type="number" name="soldeExtra" min="0" step="0.01" defaultValue={0} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                    </div>
                  </>
                )}
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsHrDocModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors flex items-center gap-2">
                  <Printer size={16} /> Générer & Imprimer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Congé Request Modal */}
      {isCongeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">Nouvelle demande de congé</h3>
              <button onClick={() => setIsCongeModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveConge} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="employeeId" required defaultValue="" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]">
                    <option value="" disabled>Sélectionner...</option>
                    {staffData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Du</label>
                    <input type="date" name="startDate" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Au</label>
                    <input type="date" name="endDate" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motif (optionnel)</label>
                  <input type="text" name="motif" placeholder="Ex: Congé annuel" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCongeModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
                      <td className="border border-black py-1 h-6">{selectedPayslip.role || 'Employé'}</td>
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
                      {(() => {
                        const hireParts = selectedPayslip.hireDate ? selectedPayslip.hireDate.split('-') : null;
                        const hireDay = hireParts ? hireParts[2] : '-';
                        const hireMonth = hireParts ? hireParts[1] : '-';
                        const period = parsePayrollPeriod(selectedPayslip.period);
                        return (
                          <>
                            <td className="border border-black py-1 bg-yellow-300 w-8">{hireDay}</td>
                            <td className="border border-black py-1 bg-yellow-300 w-12">{hireMonth}</td>
                            <td className="border border-black py-1">-</td>
                            <td className="border border-black py-1">{selectedPayslip.staffCnss || '-'}</td>
                            <td className="border border-black py-1">{formatIsoDateFr(selectedPayslip.birthDate)}</td>
                            <td className="border border-black py-1 bg-yellow-300">{familyStatusCode(selectedPayslip.familyStatus)}</td>
                            <td className="border border-black py-1 bg-yellow-300">0</td>
                            <td className="border border-black py-1 font-bold">{(selectedPayslip.base / 191).toFixed(2)}</td>
                            <td className="border border-black py-1 bg-yellow-300 w-8">{period.day}</td>
                            <td className="border border-black py-1 bg-yellow-300 w-8">{period.month}</td>
                            <td className="border border-black py-1 bg-yellow-300 w-12">{period.year}</td>
                          </>
                        );
                      })()}
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
                        <div>ABSENCE</div>
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
                        <div>{[Number(selectedPayslip.absenceFullDays) > 0 ? `${selectedPayslip.absenceFullDays}j` : '', Number(selectedPayslip.absenceHours) > 0 ? `${selectedPayslip.absenceHours}h` : ''].filter(Boolean).join(' + ') || '-'}</div>
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
                        <div className="text-[9px]">26j/191h</div>
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
                        <div>{(Number(selectedPayslip.absenceDeduction) || 0).toFixed(2)}</div>
                        <div className="h-4"></div>
                        <div>{(Number(selectedPayslip.avance) || 0).toFixed(2)}</div>
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
                        {(Number(selectedPayslip.net.replace(/[^0-9.-]+/g,"")) - (Number(selectedPayslip.avance) || 0) - (Number(selectedPayslip.absenceDeduction) || 0)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carte Sanitaire (N°)</label>
                  <input name="carteSanitaire" defaultValue={editingStaff?.carteSanitaire} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: CS-2026-0123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
                  <select name="contractType" defaultValue={editingStaff?.contractType || 'CDI'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                  <input name="birthDate" defaultValue={editingStaff?.birthDate} type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Situation familiale</label>
                  <select name="familyStatus" defaultValue={editingStaff?.familyStatus || 'Célibataire'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    <option value="Célibataire">Célibataire</option>
                    <option value="Marié(e)">Marié(e)</option>
                    <option value="Divorcé(e)">Divorcé(e)</option>
                    <option value="Veuf(ve)">Veuf(ve)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input name="address" defaultValue={editingStaff?.address} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 12 Rue des Fleurs, Fès" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact d'urgence</label>
                  <input name="emergencyContact" defaultValue={editingStaff?.emergencyContact} type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Fatima (sœur) — 06 XX XX XX XX" />
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

      {/* Absence Modal */}
      {isAbsenceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">Signaler une absence</h3>
              <button onClick={() => { setIsAbsenceModalOpen(false); setAbsenceStaffTarget(null); }} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            {absenceStaffTarget && getPendingAbsences(absenceStaffTarget.id).length > 0 && (
              <div className="px-6 pt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Absences en attente de déduction</p>
                <div className="space-y-1.5 mb-2">
                  {getPendingAbsences(absenceStaffTarget.id).map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <span className="text-gray-700">{a.date}{a.hours > 0 ? ` (${a.hours}h)` : ' (journée complète)'}{a.reason ? ` — ${a.reason}` : ''}</span>
                      <button type="button" onClick={() => handleDeleteAbsence(a.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleSaveAbsence} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="employeeId" required defaultValue={absenceStaffTarget?.id || ''} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]">
                    <option value="" disabled>Sélectionner...</option>
                    {staffData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'absence</label>
                  <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heures d'absence (si absence partielle)</label>
                  <input type="number" name="hours" min="0" max="23" step="0.5" placeholder="Laisser vide = journée complète" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motif (optionnel)</label>
                  <input type="text" name="reason" placeholder="Ex: Absence injustifiée" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <p className="text-xs text-gray-400">Journée complète : retenue au prorata du salaire journalier (base ÷ 26). Absence partielle : retenue au prorata du taux horaire (base ÷ 191) × heures saisies.</p>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAbsenceModalOpen(false); setAbsenceStaffTarget(null); }} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors">Enregistrer</button>
              </div>
            </form>
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
              const staffId = formData.get('staffId') as string;
              const staff = staffData.find(s => s.id === staffId);
              if (!staff) { showToast('Veuillez sélectionner un employé', 'error'); return; }
              const nextDate = new Date();
              nextDate.setMonth(nextDate.getMonth() + 6);
              addDoc(collection(db, 'evaluations'), {
                employeeId: staff.id,
                name: staff.name,
                role: staff.role || '',
                score: `${formData.get('score')}/5`,
                comments: (formData.get('comments') as string) || '',
                date: todayFr(),
                next: nextDate.toLocaleDateString('fr-FR'),
                createdAt: serverTimestamp()
              }).then(() => {
                showToast("Évaluation enregistrée");
                setIsEvalModalOpen(false);
              });
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="staffId" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]">
                    {staffData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score global (sur 5)</label>
                  <input type="number" name="score" min="1" max="5" step="0.1" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires et points d'amélioration</label>
                  <textarea name="comments" rows={4} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"></textarea>
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
              addDoc(collection(db, 'training'), {
                title: formData.get('title') as string,
                date: formData.get('date') as string,
                participants: parseInt(formData.get('participants') as string) || 0,
                status: "Planifié",
                trainer: formData.get('trainer') as string,
                createdAt: serverTimestamp()
              }).then(() => {
                showToast("Formation planifiée");
                setIsTrainingModalOpen(false);
              }).catch((err) => {
                console.error(err);
                showToast("Erreur lors de l'enregistrement", "error");
              });
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

      {/* Payroll Modal */}
      <PayrollModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        staffData={staffData}
        absencesList={absencesList}
        onGenerate={async (data) => {
          const newPayslip = {
            period: data.period as string,
            employeeId: data.employeeId as string,
            name: data.staffName as string,
            role: data.staffRole || '',
            staffCnss: data.staffCnss || '',
            birthDate: data.staffBirthDate || '',
            familyStatus: data.staffFamilyStatus || '',
            hireDate: data.staffHireDate || '',
            net: `${data.net.toFixed(2)} MAD`,
            status: "Payé",
            base: data.base,
            cnss: data.cnss,
            amo: data.amo,
            igr: data.igr,
            avance: data.avance || 0,
            absenceFullDays: data.absenceFullDays || 0,
            absenceHours: data.absenceHours || 0,
            absenceDeduction: data.absenceDeduction || 0,
            createdAt: serverTimestamp()
          };

          try {
            const docRef = await addDoc(collection(db, 'payroll'), newPayslip);
            // Réconcilie les absences déduites pour qu'elles ne soient pas comptées deux fois
            // sur la prochaine fiche de paie de cet employé.
            if (data.absenceIds && data.absenceIds.length > 0) {
              await Promise.all(data.absenceIds.map((absenceId: string) =>
                updateDoc(doc(db, 'absences', absenceId), { payslipId: docRef.id })
              ));
            }
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

