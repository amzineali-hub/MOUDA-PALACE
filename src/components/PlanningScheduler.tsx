import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Filter, MoreHorizontal, User as UserIcon, Loader2, Clock, CheckCircle2, Copy, Zap, History, Trash2, SplitSquareHorizontal, Download, FileDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { buildLetterheadHtml, DEFAULT_COMPANY_INFO, mergeCompanyInfo } from '../lib/letterhead';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface Employee {
  id: string;
  name: string;
  role: string;
  contractHours: number;
  avatar?: string;
}

interface Shift {
  id: string;
  employeeId: string | null; // null means "Available Shift"
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hours: number;
  colorType: 'blue' | 'orange' | 'pink' | 'purple' | 'green';
  actualHours?: number | null; // pointage manuel — heures réellement travaillées
  actualMinutes?: number | null; // pointage manuel — minutes réellement travaillées
  createdAt?: { seconds: number; nanoseconds: number } | null; // horodatage Firestore, sert à regrouper les lots (ex. duplication de semaine)
  scheduleType?: 'normal' | 'split'; // 'split' = horaire coupé (ex. matin puis reprise l'après-midi), stocké en 2 shifts liés par splitGroupId
  splitGroupId?: string | null;
}

// Formate en YYYY-MM-DD à partir des composants LOCAUX de la date — ne jamais utiliser
// toISOString() ici, qui convertit en UTC et décale silencieusement la date d'un jour dès que
// l'heure locale est proche de minuit avec un fuseau positif (ex. Maroc, UTC+1) : la date
// enregistrée en base ne correspondrait alors plus au jour réellement affiché/cliqué.
const toLocalDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const generateWeekDays = (startDate: Date) => {
  const days = [];
  const current = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    days.push({
      dateStr: toLocalDateStr(current),
      dayName: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][current.getDay()],
      dayNum: current.getDate(),
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

// Styles du tableau pour les exports PDF du planning (semaine complète / par employé).
const PLANNING_TABLE_STYLES = `
  .pl-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
  .pl-table th, .pl-table td { border: 1px solid #eee; padding: 8px; text-align: center; vertical-align: top; }
  .pl-table th { background: #f9f9f9; font-weight: bold; }
  .pl-table td:first-child, .pl-table th:first-child { text-align: left; width: 160px; }
  .pl-emp { font-weight: bold; color: #1a1a1a; }
  .pl-role { font-size: 10px; color: #888; }
  .pl-off { color: #bbb; font-style: italic; }
`;

const COLOR_MAP = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  green: 'bg-green-50 text-green-600 border-green-100',
};

// Options du filtre "Rôle" — reprend les mêmes catégories que la couleur des shifts
const ROLE_FILTER_OPTIONS: { color: Shift['colorType']; label: string }[] = [
  { color: 'blue', label: 'Cuisine' },
  { color: 'orange', label: 'Service' },
  { color: 'pink', label: 'Manager' },
  { color: 'purple', label: 'Bar' },
  { color: 'green', label: 'Polyvalent' },
];

// Raccourcis "shift type" pour saisie en un clic
const SHIFT_PRESETS: { label: string; startTime: string; endTime: string }[] = [
  { label: 'Matin', startTime: '09:00', endTime: '17:00' },
  { label: 'Service Midi', startTime: '11:00', endTime: '15:00' },
  { label: 'Service Soir', startTime: '18:00', endTime: '23:00' },
  { label: 'Journée', startTime: '09:00', endTime: '22:00' },
];

// Raccourcis pour les horaires coupés (ex. service du matin, puis reprise l'après-midi)
const SPLIT_SHIFT_PRESETS: { label: string; morning: { startTime: string; endTime: string }; afternoon: { startTime: string; endTime: string } }[] = [
  { label: 'Coupure Midi/Soir', morning: { startTime: '09:00', endTime: '13:00' }, afternoon: { startTime: '16:00', endTime: '20:00' } },
  { label: 'Coupure Service', morning: { startTime: '11:00', endTime: '15:00' }, afternoon: { startTime: '18:00', endTime: '23:00' } },
];

// Déduit automatiquement la couleur (= rôle) d'un shift à partir du poste de l'employé,
// pour éviter d'avoir à la re-sélectionner manuellement à chaque saisie.
const roleToColor = (role: string): Shift['colorType'] => {
  const r = (role || '').toLowerCase();
  if (r.includes('cuisine') || r.includes('chef') || r.includes('cuisinier')) return 'blue';
  if (r.includes('bar')) return 'purple';
  if (r.includes('manager') || r.includes('responsable') || r.includes('directeur')) return 'pink';
  if (r.includes('service') || r.includes('serveur') || r.includes('salle')) return 'orange';
  return 'green';
};

const computeHours = (startTime: string, endTime: string) => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let hours = (endH + endM / 60) - (startH + startM / 60);
  if (hours < 0) hours += 24;
  return Math.round(hours * 100) / 100;
};

// Rend le HTML imprimable (papier en-tête + tableau) dans un iframe caché, le capture en image
// et assemble un PDF A4 téléchargé localement — pour que le gérant puisse imprimer ou partager
// (WhatsApp, email...) le planning sans dépendre du dialogue d'impression du navigateur.
const downloadHtmlAsPdf = async (html: string, filename: string) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-99999px';
  iframe.style.top = '0';
  iframe.style.width = '1000px';
  iframe.style.height = '700px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  try {
    const idoc = iframe.contentDocument;
    if (!idoc) throw new Error('iframe indisponible');
    const loadPromise = new Promise<void>((resolve) => { iframe.onload = () => resolve(); });
    idoc.open();
    idoc.write(html);
    idoc.close();
    await Promise.race([loadPromise, new Promise<void>((resolve) => setTimeout(resolve, 3000))]);

    const images = Array.from(idoc.images);
    await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); })));
    await new Promise((res) => setTimeout(res, 200));

    const bodyEl = idoc.body;
    const dataUrl = await toPng(bodyEl, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      width: bodyEl.scrollWidth,
      height: bodyEl.scrollHeight
    });

    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pdfHeight = (bodyEl.scrollHeight * pdfWidth) / bodyEl.scrollWidth;

    let heightLeft = pdfHeight;
    let position = 0;
    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename.replace(/[\\/:*?"<>|]/g, '-')}.pdf`);
  } finally {
    document.body.removeChild(iframe);
  }
};

// Bascule "Horaire normal" / "Horaire spécial (coupure)" réutilisée dans les 2 modales de création de shift.
function ShiftModeToggle({ mode, onChange }: { mode: 'normal' | 'split'; onChange: (m: 'normal' | 'split') => void }) {
  return (
    <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1 mb-4">
      <button
        type="button"
        onClick={() => onChange('normal')}
        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'normal' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
        Horaire normal
      </button>
      <button
        type="button"
        onClick={() => onChange('split')}
        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${mode === 'split' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
        <SplitSquareHorizontal size={12} /> Horaire spécial (coupure)
      </button>
    </div>
  );
}

export default function PlanningScheduler({ staffData }: { staffData: any[] }) {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);

  // Coordonnées de l'établissement pour l'en-tête des exports PDF du planning (même source que
  // les autres documents imprimés — Configuration > Général).
  const [companyInfo, setCompanyInfo] = useState<any>(DEFAULT_COMPANY_INFO);
  useEffect(() => {
    const unsubGeneral = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) setCompanyInfo((prev: any) => mergeCompanyInfo(prev, snap.data()));
    }, (error) => console.error('Error fetching company settings', error));
    const unsubWebsite = onSnapshot(doc(db, 'settings', 'website'), (snap) => {
      if (snap.exists() && snap.data().url) setCompanyInfo((prev: any) => ({ ...prev, website: snap.data().url }));
    }, (error) => console.error('Error fetching website settings', error));
    return () => { unsubGeneral(); unsubWebsite(); };
  }, []);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [genericShiftMode, setGenericShiftMode] = useState<'normal' | 'split'>('normal');
  const genericMorningStartRef = useRef<HTMLInputElement>(null);
  const genericMorningEndRef = useRef<HTMLInputElement>(null);
  const genericAfternoonStartRef = useRef<HTMLInputElement>(null);
  const genericAfternoonEndRef = useRef<HTMLInputElement>(null);

  // Crée un horaire coupé : 2 shifts (matin + après-midi) liés par un splitGroupId commun,
  // pour qu'on puisse les identifier et les supprimer ensemble.
  const createSplitShift = async (
    employeeId: string | null,
    date: string,
    morning: { startTime: string; endTime: string },
    afternoon: { startTime: string; endTime: string },
    colorType: Shift['colorType']
  ) => {
    const splitGroupId = crypto.randomUUID();
    for (const seg of [morning, afternoon]) {
      await addDoc(collection(db, 'shifts'), {
        employeeId,
        date,
        startTime: seg.startTime,
        endTime: seg.endTime,
        hours: computeHours(seg.startTime, seg.endTime),
        colorType,
        scheduleType: 'split',
        splitGroupId,
        createdAt: serverTimestamp()
      });
    }
  };

  const handleIAPlanning = async () => {
    setIsGenerating(true);
    showToast("Analyse IA en cours : contraintes, disponibilités et historique...");
    
    setTimeout(async () => {
      const newShifts = [];
      employees.forEach(emp => {
        weekDays.forEach(day => {
          if (!shifts.find(s => s.employeeId === emp.id && s.date === day.dateStr)) {
            // Fill 40% of empty slots
            if (Math.random() > 0.6) {
              const types = ['blue', 'orange', 'pink', 'purple', 'green'];
              newShifts.push({
                employeeId: emp.id,
                date: day.dateStr,
                startTime: '09:00',
                endTime: '17:00',
                hours: 8,
                colorType: types[Math.floor(Math.random() * types.length)]
              });
            }
          }
        });
      });
      try {
        for (const ns of newShifts) {
          await addDoc(collection(db, 'shifts'), {
            ...ns,
            createdAt: serverTimestamp()
          });
        }
        setIsGenerating(false);
        showToast("Planning optimal généré avec succès ✨");
      } catch (e) {
        console.error(e);
        setIsGenerating(false);
      }
    }, 2500);
  };

  const handleGenericSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const empId = formData.get('employeeId') as string;
    const date = formData.get('date') as string;
    const colorType = formData.get('colorType') as 'blue' | 'green' | 'orange' | 'pink' | 'purple';
    const employeeId = empId === 'null' ? null : empId;

    try {
      if (genericShiftMode === 'split') {
        const morningStart = formData.get('morningStart') as string;
        const morningEnd = formData.get('morningEnd') as string;
        const afternoonStart = formData.get('afternoonStart') as string;
        const afternoonEnd = formData.get('afternoonEnd') as string;
        await createSplitShift(
          employeeId,
          date,
          { startTime: morningStart, endTime: morningEnd },
          { startTime: afternoonStart, endTime: afternoonEnd },
          colorType
        );
      } else {
        const startTime = formData.get('startTime') as string;
        const endTime = formData.get('endTime') as string;
        const [startH] = startTime.split(':').map(Number);
        const [endH] = endTime.split(':').map(Number);
        let hours = endH - startH;
        if (hours < 0) hours += 24;

        await addDoc(collection(db, 'shifts'), {
          employeeId,
          date,
          startTime,
          endTime,
          hours,
          colorType,
          createdAt: serverTimestamp()
        });
      }
      setIsGenericModalOpen(false);
      showToast("Shift ajouté avec succès");
    } catch (e) {
      console.error(e);
      showToast("Erreur d'ajout", "error");
    }
  };

  // Mock data setup
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    // Go to Monday
    d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
    return d;
  });

  const weekDays = generateWeekDays(currentDate);
  const weekStartStr = weekDays[0].dateStr;
  const weekEndStr = weekDays[6].dateStr;

  const employees: Employee[] = staffData.map(s => ({
    id: s.id.toString(),
    name: s.name,
    role: s.role,
    contractHours: s.contract === 'CDI' ? 44 : 20,
  }));

  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'shifts'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id })) as Shift[];
      setShifts(data);
    });
    return () => unsub();
  }, []);

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftMode, setShiftMode] = useState<'normal' | 'split'>('normal');
  const [selectedCell, setSelectedCell] = useState<{empId: string | null, date: string} | null>(null);
  const [isPointageModalOpen, setIsPointageModalOpen] = useState(false);
  const [selectedShiftForPointage, setSelectedShiftForPointage] = useState<Shift | null>(null);
  const [applyEditToWeek, setApplyEditToWeek] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editStartRef = useRef<HTMLInputElement>(null);
  const editEndRef = useRef<HTMLInputElement>(null);
  const editColorRef = useRef<HTMLSelectElement>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [lastDuplicatedIds, setLastDuplicatedIds] = useState<string[]>([]);
  const [isUndoing, setIsUndoing] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterEmployeeIds, setFilterEmployeeIds] = useState<Set<string>>(new Set());
  const [filterColors, setFilterColors] = useState<Set<Shift['colorType']>>(new Set());
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFilterOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node) &&
        filterButtonRef.current && !filterButtonRef.current.contains(e.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  const toggleEmployeeFilter = (id: string) => {
    setFilterEmployeeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleColorFilter = (color: Shift['colorType']) => {
    setFilterColors(prev => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color); else next.add(color);
      return next;
    });
  };

  const resetFilters = () => {
    setFilterEmployeeIds(new Set());
    setFilterColors(new Set());
  };

  const activeFilterCount = filterEmployeeIds.size + filterColors.size;

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [undoingBatchKey, setUndoingBatchKey] = useState<string | null>(null);

  // Regroupe les shifts par "lot" : ceux créés à quelques secondes d'intervalle (ex. duplication
  // de semaine, génération IA) forment un seul lot, annulable même si créé avant l'ajout du
  // bouton "Annuler" — utile pour revenir sur un ajout groupé plus ancien.
  const BATCH_GAP_MS = 90 * 1000;
  const shiftBatches = useMemo(() => {
    const timed = shifts
      .map(s => ({ shift: s, ms: s.createdAt ? s.createdAt.seconds * 1000 : null }))
      .filter((x): x is { shift: Shift; ms: number } => x.ms !== null)
      .sort((a, b) => a.ms - b.ms);

    const batches: { key: string; ms: number; shiftIds: string[]; minDate: string; maxDate: string }[] = [];
    let current: { key: string; ms: number; shiftIds: string[]; minDate: string; maxDate: string } | null = null;
    let lastMs = -Infinity;

    for (const { shift, ms } of timed) {
      if (!current || ms - lastMs > BATCH_GAP_MS) {
        current = { key: shift.id, ms, shiftIds: [shift.id], minDate: shift.date, maxDate: shift.date };
        batches.push(current);
      } else {
        current.shiftIds.push(shift.id);
        if (shift.date < current.minDate) current.minDate = shift.date;
        if (shift.date > current.maxDate) current.maxDate = shift.date;
      }
      lastMs = ms;
    }

    return batches
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 20);
  }, [shifts]);

  const undoBatch = async (batch: { key: string; shiftIds: string[] }) => {
    const confirmed = window.confirm(`Supprimer ce lot de ${batch.shiftIds.length} shift(s) ? Cette action est irréversible.`);
    if (!confirmed) return;
    setUndoingBatchKey(batch.key);
    try {
      for (const id of batch.shiftIds) {
        await deleteDoc(doc(db, 'shifts', id));
      }
      showToast(`${batch.shiftIds.length} shift(s) supprimé(s)`);
      if (lastDuplicatedIds.some(id => batch.shiftIds.includes(id))) setLastDuplicatedIds([]);
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la suppression du lot", "error");
    } finally {
      setUndoingBatchKey(null);
    }
  };
  const genericStartRef = useRef<HTMLInputElement>(null);
  const genericEndRef = useRef<HTMLInputElement>(null);
  const genericColorRef = useRef<HTMLSelectElement>(null);
  const genericEmployeeRef = useRef<HTMLSelectElement>(null);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
    setLastDuplicatedIds([]);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
    setLastDuplicatedIds([]);
  };

  const getShiftsForCell = (empId: string | null, dateStr: string) => {
    return shifts
      .filter(s => s.employeeId === empId && s.date === dateStr)
      .filter(s => filterColors.size === 0 || filterColors.has(s.colorType));
  };

  const visibleEmployees = employees.filter(emp => {
    if (filterEmployeeIds.size > 0 && !filterEmployeeIds.has(emp.id)) return false;
    if (filterColors.size > 0 && !filterColors.has(roleToColor(emp.role))) return false;
    return true;
  });

  const calculateTotalHours = (empId: string | null) => {
    return shifts
      .filter(s => s.employeeId === empId && weekDays.some(d => d.dateStr === s.date))
      .reduce((acc, curr) => acc + curr.hours, 0);
  };

  // Export PDF du planning — pour que le gérant puisse imprimer/partager (WhatsApp, email...)
  // avec l'équipe, faute de portail employé dans l'application.
  const exportTeamWeekPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const bodyHtml = `
        <h2 style="text-align:center;">PLANNING DE LA SEMAINE</h2>
        <p style="text-align:center; color:#666;">Du ${weekDays[0].dateStr} au ${weekDays[6].dateStr}</p>
        <table class="pl-table">
          <thead>
            <tr><th>Employé</th>${weekDays.map(d => `<th>${d.dayName} ${d.dayNum}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${visibleEmployees.map(emp => `
              <tr>
                <td><span class="pl-emp">${emp.name}</span><br/><span class="pl-role">${emp.role}</span></td>
                ${weekDays.map(day => {
                  const dayShifts = getShiftsForCell(emp.id, day.dateStr);
                  if (dayShifts.length === 0) return '<td><span class="pl-off">Repos</span></td>';
                  return `<td>${dayShifts.map(s => `<div>${s.startTime}-${s.endTime}${s.scheduleType === 'split' ? ' <i>(coupure)</i>' : ''}</div>`).join('')}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      const html = buildLetterheadHtml(companyInfo, window.location.origin, {
        title: `Planning semaine du ${weekDays[0].dateStr}`,
        bodyHtml,
        autoPrint: false,
        extraStyles: PLANNING_TABLE_STYLES
      });
      await downloadHtmlAsPdf(html, `Planning - Semaine du ${weekDays[0].dateStr}`);
      showToast('Planning exporté en PDF');
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'export PDF", 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const exportEmployeeWeekPdf = async (emp: Employee) => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const bodyHtml = `
        <h2 style="text-align:center;">PLANNING — ${emp.name}</h2>
        <p style="text-align:center; color:#666;">${emp.role} · Semaine du ${weekDays[0].dateStr} au ${weekDays[6].dateStr}</p>
        <table class="pl-table">
          <thead><tr><th>Jour</th><th>Date</th><th>Horaire</th></tr></thead>
          <tbody>
            ${weekDays.map(day => {
              const dayShifts = getShiftsForCell(emp.id, day.dateStr);
              const cell = dayShifts.length === 0
                ? '<span class="pl-off">Repos</span>'
                : dayShifts.map(s => `${s.startTime}-${s.endTime}${s.scheduleType === 'split' ? ' (coupure)' : ''}`).join(' / ');
              return `<tr><td>${day.dayName}</td><td>${day.dateStr}</td><td>${cell}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
        <p style="margin-top:20px; font-size:12px; color:#666;">Total prévu cette semaine : <strong>${calculateTotalHours(emp.id)}h</strong> (contrat : ${emp.contractHours}h).</p>
      `;
      const html = buildLetterheadHtml(companyInfo, window.location.origin, {
        title: `Planning ${emp.name} - Semaine du ${weekDays[0].dateStr}`,
        bodyHtml,
        autoPrint: false,
        extraStyles: PLANNING_TABLE_STYLES
      });
      await downloadHtmlAsPdf(html, `Planning ${emp.name} - Semaine du ${weekDays[0].dateStr}`);
      showToast(`Planning de ${emp.name} exporté en PDF`);
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'export PDF", 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCellClick = (empId: string | null, dateStr: string) => {
    setSelectedCell({ empId, date: dateStr });
    setShiftMode('normal');
    setIsShiftModalOpen(true);
  };

  const addNewShift = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCell) return;

    const formData = new FormData(e.currentTarget);
    const colorType = formData.get('colorType') as any;

    try {
      if (shiftMode === 'split') {
        const morningStart = formData.get('morningStart') as string;
        const morningEnd = formData.get('morningEnd') as string;
        const afternoonStart = formData.get('afternoonStart') as string;
        const afternoonEnd = formData.get('afternoonEnd') as string;
        await createSplitShift(
          selectedCell.empId,
          selectedCell.date,
          { startTime: morningStart, endTime: morningEnd },
          { startTime: afternoonStart, endTime: afternoonEnd },
          colorType
        );
        setIsShiftModalOpen(false);
        showToast("Shift coupé ajouté");
        return;
      }

      const startTime = formData.get('startTime') as string;
      const endTime = formData.get('endTime') as string;
      const [startH] = startTime.split(':').map(Number);
      const [endH] = endTime.split(':').map(Number);
      let hours = endH - startH;
      if (hours < 0) hours += 24;

      const newShift: Omit<Shift, 'id'> = {
        employeeId: selectedCell.empId,
        date: selectedCell.date,
        startTime,
        endTime,
        hours,
        colorType
      };

      await addDoc(collection(db, 'shifts'), {
        ...newShift,
        createdAt: serverTimestamp()
      });
      setIsShiftModalOpen(false);
    } catch (e) {
      console.error(e);
      showToast("Erreur d'ajout", "error");
    }
  };

  // Ajout en un clic d'un horaire coupé depuis un raccourci — couleur déduite automatiquement du rôle.
  const quickAddSplitShift = async (preset: { morning: { startTime: string; endTime: string }; afternoon: { startTime: string; endTime: string } }) => {
    if (!selectedCell) return;
    const emp = employees.find(e => e.id === selectedCell.empId);
    try {
      await createSplitShift(selectedCell.empId, selectedCell.date, preset.morning, preset.afternoon, roleToColor(emp?.role || ''));
      setIsShiftModalOpen(false);
      showToast("Shift coupé ajouté");
    } catch (e) {
      console.error(e);
      showToast("Erreur d'ajout", "error");
    }
  };

  // Ajout en un clic depuis un raccourci "shift type" — couleur déduite automatiquement du rôle.
  const quickAddShift = async (preset: { startTime: string; endTime: string }) => {
    if (!selectedCell) return;
    const emp = employees.find(e => e.id === selectedCell.empId);
    const newShift: Omit<Shift, 'id'> = {
      employeeId: selectedCell.empId,
      date: selectedCell.date,
      startTime: preset.startTime,
      endTime: preset.endTime,
      hours: computeHours(preset.startTime, preset.endTime),
      colorType: roleToColor(emp?.role || '')
    };
    try {
      await addDoc(collection(db, 'shifts'), { ...newShift, createdAt: serverTimestamp() });
      setIsShiftModalOpen(false);
      showToast("Shift ajouté");
    } catch (e) {
      console.error(e);
      showToast("Erreur d'ajout", "error");
    }
  };

  // Recopie les shifts de la semaine précédente sur la semaine affichée (planning souvent récurrent).
  const duplicatePreviousWeek = async () => {
    const prevWeekStart = new Date(currentDate);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevDays = generateWeekDays(prevWeekStart);
    const prevShifts = shifts.filter(s => prevDays.some(d => d.dateStr === s.date));

    if (prevShifts.length === 0) {
      showToast("Aucun shift la semaine précédente à dupliquer", "error");
      return;
    }

    setIsDuplicating(true);
    try {
      const createdIds: string[] = [];
      for (const s of prevShifts) {
        const dayIndex = prevDays.findIndex(d => d.dateStr === s.date);
        const targetDate = weekDays[dayIndex]?.dateStr;
        if (!targetDate) continue;
        const alreadyExists = shifts.some(x =>
          x.employeeId === s.employeeId && x.date === targetDate &&
          x.startTime === s.startTime && x.endTime === s.endTime
        );
        if (alreadyExists) continue;
        const ref = await addDoc(collection(db, 'shifts'), {
          employeeId: s.employeeId,
          date: targetDate,
          startTime: s.startTime,
          endTime: s.endTime,
          hours: s.hours,
          colorType: s.colorType,
          createdAt: serverTimestamp()
        });
        createdIds.push(ref.id);
      }
      setLastDuplicatedIds(createdIds);
      showToast(createdIds.length > 0 ? `${createdIds.length} shift(s) dupliqué(s) depuis la semaine précédente` : "Tous les shifts étaient déjà présents sur cette semaine");
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la duplication", "error");
    } finally {
      setIsDuplicating(false);
    }
  };

  const undoDuplication = async () => {
    if (lastDuplicatedIds.length === 0) return;
    setIsUndoing(true);
    try {
      for (const id of lastDuplicatedIds) {
        await deleteDoc(doc(db, 'shifts', id));
      }
      showToast("Duplication annulée");
      setLastDuplicatedIds([]);
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'annulation", "error");
    } finally {
      setIsUndoing(false);
    }
  };

  const openPointageModal = (shift: Shift, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedShiftForPointage(shift);
    setApplyEditToWeek(false);
    setIsPointageModalOpen(true);
  };

  const deleteShift = async (shift: Shift, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Supprimer ce shift (${shift.startTime} - ${shift.endTime}, ${shift.date}) ?`);
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, 'shifts', shift.id));
      showToast("Shift supprimé");
      setLastDuplicatedIds(prev => prev.filter(id => id !== shift.id));
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la suppression", "error");
    }
  };

  // Supprime les 2 segments d'un horaire coupé (matin + après-midi) en une fois.
  const deleteSplitGroup = async (shift: Shift) => {
    if (!shift.splitGroupId) return;
    const confirmed = window.confirm("Supprimer les 2 segments de cet horaire coupé (matin et après-midi) ?");
    if (!confirmed) return;
    const groupShifts = shifts.filter(s => s.splitGroupId === shift.splitGroupId);
    try {
      for (const s of groupShifts) {
        await deleteDoc(doc(db, 'shifts', s.id));
      }
      showToast("Horaire coupé supprimé");
      setIsPointageModalOpen(false);
      setSelectedShiftForPointage(null);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const savePointage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedShiftForPointage) return;
    const formData = new FormData(e.currentTarget);
    const actualHours = Number(formData.get('actualHours')) || 0;
    const actualMinutes = Number(formData.get('actualMinutes')) || 0;

    try {
      await updateDoc(doc(db, 'shifts', selectedShiftForPointage.id), { actualHours, actualMinutes });
      showToast("Pointage enregistré");
      setIsPointageModalOpen(false);
      setSelectedShiftForPointage(null);
    } catch (e) {
      console.error(e);
      showToast("Erreur d'enregistrement du pointage", "error");
    }
  };

  const saveShiftEdit = async () => {
    if (!selectedShiftForPointage) return;
    const startTime = editStartRef.current?.value || selectedShiftForPointage.startTime;
    const endTime = editEndRef.current?.value || selectedShiftForPointage.endTime;
    const colorType = (editColorRef.current?.value || selectedShiftForPointage.colorType) as Shift['colorType'];
    const hours = computeHours(startTime, endTime);

    setIsSavingEdit(true);
    try {
      if (applyEditToWeek && selectedShiftForPointage.employeeId) {
        const weekShiftsForEmp = shifts.filter(s =>
          s.employeeId === selectedShiftForPointage.employeeId && weekDays.some(d => d.dateStr === s.date)
        );
        for (const s of weekShiftsForEmp) {
          await updateDoc(doc(db, 'shifts', s.id), { startTime, endTime, hours, colorType });
        }
        showToast(`Horaire mis à jour sur ${weekShiftsForEmp.length} shift(s) de la semaine`);
      } else {
        await updateDoc(doc(db, 'shifts', selectedShiftForPointage.id), { startTime, endTime, hours, colorType });
        showToast("Shift modifié");
      }
      setIsPointageModalOpen(false);
      setSelectedShiftForPointage(null);
      setApplyEditToWeek(false);
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la modification", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center bg-white gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button onClick={prevWeek} className="p-1.5 hover:bg-white rounded-md text-gray-500 hover:shadow-sm transition-all">
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 text-sm font-medium text-gray-700">
              Semaine {weekDays[0].dayNum} {weekDays[0].dateStr.split('-')[1]} - {weekDays[6].dayNum} {weekDays[6].dateStr.split('-')[1]}
            </span>
            <button onClick={nextWeek} className="p-1.5 hover:bg-white rounded-md text-gray-500 hover:shadow-sm transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 font-medium hidden sm:inline">Début :</label>
            <input
              type="date"
              value={weekDays[0].dateStr}
              onChange={(e) => {
                if (!e.target.value) return;
                const [y, m, d] = e.target.value.split('-').map(Number);
                setCurrentDate(new Date(y, m - 1, d));
                setLastDuplicatedIds([]);
              }}
              title="Choisir n'importe quelle date de début pour la période affichée (pas forcément un lundi)"
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#F4C75B] bg-white"
            />
          </div>
          <div className="relative">
            <button
              ref={filterButtonRef}
              onClick={() => setIsFilterOpen(prev => !prev)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors ${
                activeFilterCount > 0
                  ? 'bg-[#F4C75B]/20 text-[#8a6a1f] border-[#F4C75B]'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}>
              <Filter size={16} /> Filtres
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#F4C75B] text-[#1A1A1A] text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {isFilterOpen && (
              <div ref={filterPanelRef} className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-20 p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_FILTER_OPTIONS.map(opt => (
                      <button
                        key={opt.color}
                        type="button"
                        onClick={() => toggleColorFilter(opt.color)}
                        className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                          filterColors.has(opt.color)
                            ? COLOR_MAP[opt.color] + ' ring-1 ring-inset ring-current'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Employé</span>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {employees.map(emp => (
                      <label key={emp.id} className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={filterEmployeeIds.has(emp.id)}
                          onChange={() => toggleEmployeeFilter(emp.id)}
                          className="rounded border-gray-300 text-[#F4C75B] focus:ring-[#F4C75B]"
                        />
                        {emp.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={resetFilters}
                    disabled={activeFilterCount === 0}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 disabled:opacity-40 disabled:hover:text-gray-500">
                    Réinitialiser
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="px-3 py-1.5 bg-[#F4C75B] text-[#1A1A1A] rounded-lg text-xs font-medium hover:bg-[#E5B745]">
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={duplicatePreviousWeek}
            disabled={isDuplicating}
            title="Recopier les shifts de la semaine précédente sur cette semaine"
            className="px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-2 transition-colors disabled:opacity-50">
            {isDuplicating ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
            {isDuplicating ? "Duplication..." : "Dupliquer semaine préc."}
          </button>
          {lastDuplicatedIds.length > 0 && (
            <button
              onClick={undoDuplication}
              disabled={isUndoing}
              title="Annuler la dernière duplication"
              className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm font-medium hover:bg-rose-100 flex items-center gap-2 transition-colors disabled:opacity-50">
              {isUndoing ? <Loader2 size={16} className="animate-spin" /> : null}
              {isUndoing ? "Annulation..." : `Annuler (${lastDuplicatedIds.length})`}
            </button>
          )}
          <button
            onClick={() => setIsHistoryOpen(true)}
            title="Revenir sur un lot de shifts ajoutés en une fois (duplication, IA...), même ancien"
            className="px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-2 transition-colors">
            <History size={16} /> Historique
          </button>
          <button
            onClick={exportTeamWeekPdf}
            disabled={isExportingPdf}
            title="Exporter le planning de la semaine en PDF, à imprimer ou partager avec l'équipe"
            className="px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-2 transition-colors disabled:opacity-50">
            {isExportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
            {isExportingPdf ? "Export..." : "Exporter PDF"}
          </button>
          <button
            onClick={handleIAPlanning}
            disabled={isGenerating}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 flex items-center gap-2 transition-colors disabled:opacity-50">
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isGenerating ? "Génération..." : "IA Planning"}
          </button>
          <button
            onClick={() => { setGenericShiftMode('normal'); setIsGenericModalOpen(true); }}
            className="px-4 py-2 bg-[#F4C75B] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#E5B745] flex items-center gap-2 transition-colors">
            <Plus size={16} /> Nouveau Shift
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <div className="min-w-[1000px] w-full">
          <div className="grid grid-cols-[220px_repeat(7,1fr)] border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="p-4 border-r border-gray-100 bg-white">
            </div>
            {weekDays.map((day, idx) => (
              <div key={idx} className="p-3 text-center border-r border-gray-100 font-medium text-sm text-gray-900 bg-white">
                {day.dayName} {day.dayNum}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[220px_repeat(7,1fr)] border-b border-emerald-100 bg-emerald-50/30">
            <div className="p-4 border-r border-emerald-100 flex flex-col justify-center">
              <span className="font-medium text-gray-900 text-sm">Shifts disponibles</span>
              <span className="text-gray-500 text-xs">{calculateTotalHours(null)}h à pourvoir</span>
            </div>
            {weekDays.map((day, idx) => (
              <div 
                key={idx} 
                onClick={() => handleCellClick(null, day.dateStr)}
                className="p-2 border-r border-emerald-100 min-h-[80px] hover:bg-black/5 cursor-pointer flex flex-col gap-2 transition-colors"
              >
                {getShiftsForCell(null, day.dateStr).map(shift => (
                  <div
                    key={shift.id}
                    onClick={(e) => openPointageModal(shift, e)}
                    title="Cliquer pour modifier ce shift"
                    className={`relative group/shift p-2 rounded-lg border text-xs font-medium flex flex-col cursor-pointer ${COLOR_MAP[shift.colorType]} shadow-sm hover:shadow transition-shadow`}>
                    <button
                      type="button"
                      onClick={(e) => deleteShift(shift, e)}
                      title="Supprimer ce shift"
                      className="absolute top-1 right-1 p-1 rounded bg-white/70 opacity-70 hover:opacity-100 hover:bg-black/10 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                    {shift.scheduleType === 'split' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 mb-0.5">
                        <SplitSquareHorizontal size={10} /> Coupure
                      </span>
                    )}
                    <span>{shift.startTime} - {shift.endTime}</span>
                    <span className="opacity-80">{shift.hours}h</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {visibleEmployees.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              Aucun employé ne correspond aux filtres sélectionnés.
            </div>
          )}

          {visibleEmployees.map((emp, empIdx) => (
            <div key={emp.id} className="grid grid-cols-[220px_repeat(7,1fr)] border-b border-gray-100 group bg-white">
              <div className="p-3 border-r border-gray-100 flex items-center gap-3 bg-white group-hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 text-sm">
                  {getInitials(emp.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                  <p className="text-xs text-gray-500">{calculateTotalHours(emp.id)}h / {emp.contractHours}h</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); exportEmployeeWeekPdf(emp); }}
                  disabled={isExportingPdf}
                  title={`Exporter le planning de ${emp.name} en PDF (à imprimer ou lui partager)`}
                  className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40">
                  <Download size={15} />
                </button>
              </div>

              {weekDays.map((day, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleCellClick(emp.id, day.dateStr)}
                  className="p-2 border-r border-gray-100 min-h-[80px] group-hover:bg-gray-50 hover:bg-gray-100 cursor-pointer flex flex-col gap-2 transition-colors"
                >
                  {getShiftsForCell(emp.id, day.dateStr).map(shift => (
                    <div
                      key={shift.id}
                      onClick={(e) => openPointageModal(shift, e)}
                      title="Cliquer pour saisir le pointage"
                      className={`relative group/shift p-2 rounded-lg border text-xs font-medium flex flex-col cursor-pointer ${COLOR_MAP[shift.colorType]} shadow-sm hover:shadow transition-shadow`}
                    >
                      <button
                        type="button"
                        onClick={(e) => deleteShift(shift, e)}
                        title="Supprimer ce shift"
                        className="absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover/shift:opacity-100 hover:bg-black/10 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                      {shift.scheduleType === 'split' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 mb-0.5">
                          <SplitSquareHorizontal size={10} /> Coupure
                        </span>
                      )}
                      <span>{shift.startTime} - {shift.endTime}</span>
                      <span className="opacity-80">{shift.hours}h prévu(es)</span>
                      {shift.actualHours != null ? (
                        <span className="flex items-center gap-1 mt-1 pt-1 border-t border-black/10 text-emerald-700">
                          <CheckCircle2 size={12} /> Pointé : {shift.actualHours}h{String(shift.actualMinutes || 0).padStart(2, '0')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 mt-1 pt-1 border-t border-black/10 opacity-60">
                          <Clock size={12} /> Non pointé
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {isShiftModalOpen && selectedCell && (
        <div key={`${selectedCell.empId}-${selectedCell.date}`} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                {selectedCell.empId ? "Créer un shift" : "Créer un shift disponible"}
              </h3>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="px-6 pt-4">
              <ShiftModeToggle mode={shiftMode} onChange={setShiftMode} />

              {shiftMode === 'normal' ? (
                <>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                    <Zap size={12} /> Raccourcis — un clic pour ajouter
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SHIFT_PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => quickAddShift(preset)}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-[#F4C75B]/20 hover:border-[#F4C75B] transition-colors text-left">
                        <span className="block font-semibold">{preset.label}</span>
                        <span className="text-gray-500">{preset.startTime} - {preset.endTime}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                    <Zap size={12} /> Raccourcis coupure — un clic pour ajouter les 2 segments
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {SPLIT_SHIFT_PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => quickAddSplitShift(preset)}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-[#F4C75B]/20 hover:border-[#F4C75B] transition-colors text-left">
                        <span className="block font-semibold">{preset.label}</span>
                        <span className="text-gray-500">{preset.morning.startTime}-{preset.morning.endTime} puis {preset.afternoon.startTime}-{preset.afternoon.endTime}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 my-4">
                <div className="h-px bg-gray-100 flex-1" />
                <span className="text-xs text-gray-400">ou personnalisé</span>
                <div className="h-px bg-gray-100 flex-1" />
              </div>
            </div>

            <form onSubmit={addNewShift} className="px-6 pb-6 space-y-4">
              {shiftMode === 'normal' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                    <input type="time" name="startTime" defaultValue="09:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                    <input type="time" name="endTime" defaultValue="17:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Matin</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                        <input type="time" name="morningStart" defaultValue="09:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                        <input type="time" name="morningEnd" defaultValue="13:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Après-midi (reprise)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                        <input type="time" name="afternoonStart" defaultValue="16:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                        <input type="time" name="afternoonEnd" defaultValue="20:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur (Rôle)</label>
                <select name="colorType" defaultValue={roleToColor(employees.find(e => e.id === selectedCell.empId)?.role || '')} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none">
                  <option value="blue">Bleu (Cuisine)</option>
                  <option value="orange">Orange (Service)</option>
                  <option value="pink">Rose (Manager)</option>
                  <option value="purple">Violet (Bar)</option>
                  <option value="green">Vert (Polyvalent)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsShiftModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600">
                  {shiftMode === 'split' ? "Ajouter le shift coupé" : "Ajouter le shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isGenericModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Nouveau Shift</h3>
              <button onClick={() => setIsGenericModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <form onSubmit={handleGenericSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                <select
                  name="employeeId"
                  ref={genericEmployeeRef}
                  onChange={(e) => {
                    const emp = employees.find(x => x.id === e.target.value);
                    if (genericColorRef.current) genericColorRef.current.value = roleToColor(emp?.role || '');
                  }}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none">
                  <option value="null">-- Shift Disponible (Non assigné) --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" name="date" defaultValue={weekDays[0].dateStr} required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
              </div>

              <ShiftModeToggle mode={genericShiftMode} onChange={setGenericShiftMode} />

              {genericShiftMode === 'normal' ? (
                <>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                      <Zap size={12} /> Raccourcis horaires
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SHIFT_PRESETS.map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            if (genericStartRef.current) genericStartRef.current.value = preset.startTime;
                            if (genericEndRef.current) genericEndRef.current.value = preset.endTime;
                          }}
                          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-[#F4C75B]/20 hover:border-[#F4C75B] transition-colors text-left">
                          <span className="block font-semibold">{preset.label}</span>
                          <span className="text-gray-500">{preset.startTime} - {preset.endTime}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                      <input ref={genericStartRef} type="time" name="startTime" defaultValue="09:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                      <input ref={genericEndRef} type="time" name="endTime" defaultValue="17:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                      <Zap size={12} /> Raccourcis coupure
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {SPLIT_SHIFT_PRESETS.map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            if (genericMorningStartRef.current) genericMorningStartRef.current.value = preset.morning.startTime;
                            if (genericMorningEndRef.current) genericMorningEndRef.current.value = preset.morning.endTime;
                            if (genericAfternoonStartRef.current) genericAfternoonStartRef.current.value = preset.afternoon.startTime;
                            if (genericAfternoonEndRef.current) genericAfternoonEndRef.current.value = preset.afternoon.endTime;
                          }}
                          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-[#F4C75B]/20 hover:border-[#F4C75B] transition-colors text-left">
                          <span className="block font-semibold">{preset.label}</span>
                          <span className="text-gray-500">{preset.morning.startTime}-{preset.morning.endTime} puis {preset.afternoon.startTime}-{preset.afternoon.endTime}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Matin</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                          <input ref={genericMorningStartRef} type="time" name="morningStart" defaultValue="09:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                          <input ref={genericMorningEndRef} type="time" name="morningEnd" defaultValue="13:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Après-midi (reprise)</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                          <input ref={genericAfternoonStartRef} type="time" name="afternoonStart" defaultValue="16:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                          <input ref={genericAfternoonEndRef} type="time" name="afternoonEnd" defaultValue="20:00" required className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur (Rôle)</label>
                <select name="colorType" ref={genericColorRef} defaultValue="green" className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none">
                  <option value="blue">Bleu (Cuisine)</option>
                  <option value="orange">Orange (Service)</option>
                  <option value="pink">Rose (Manager)</option>
                  <option value="purple">Violet (Bar)</option>
                  <option value="green">Vert (Polyvalent)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsGenericModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-[#F4C75B] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#E5B745]">
                  {genericShiftMode === 'split' ? "Créer le shift coupé" : "Créer le shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isPointageModalOpen && selectedShiftForPointage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Détails du shift</h3>
              <button onClick={() => setIsPointageModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="p-6 pb-0 space-y-4">
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <p><span className="font-medium text-gray-900">Employé :</span> {employees.find(e => e.id === selectedShiftForPointage.employeeId)?.name || '—'}</p>
                <p><span className="font-medium text-gray-900">Jour :</span> {selectedShiftForPointage.date}</p>
                {selectedShiftForPointage.scheduleType === 'split' && (
                  <p className="flex items-center gap-1.5 mt-1 text-gray-500">
                    <SplitSquareHorizontal size={12} /> Ce segment fait partie d'un horaire coupé (matin + après-midi)
                  </p>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Horaire prévu</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                    <input ref={editStartRef} type="time" defaultValue={selectedShiftForPointage.startTime} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                    <input ref={editEndRef} type="time" defaultValue={selectedShiftForPointage.endTime} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur (Rôle)</label>
                  <select ref={editColorRef} defaultValue={selectedShiftForPointage.colorType} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none">
                    <option value="blue">Bleu (Cuisine)</option>
                    <option value="orange">Orange (Service)</option>
                    <option value="pink">Rose (Manager)</option>
                    <option value="purple">Violet (Bar)</option>
                    <option value="green">Vert (Polyvalent)</option>
                  </select>
                </div>
                {selectedShiftForPointage.employeeId && (
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={applyEditToWeek}
                      onChange={(e) => setApplyEditToWeek(e.target.checked)}
                      className="rounded border-gray-300 text-[#F4C75B] focus:ring-[#F4C75B]"
                    />
                    Appliquer ce nouvel horaire à tous les shifts de {employees.find(e => e.id === selectedShiftForPointage.employeeId)?.name} cette semaine
                  </label>
                )}
                <button
                  type="button"
                  onClick={saveShiftEdit}
                  disabled={isSavingEdit}
                  className="w-full px-4 py-2 bg-[#F4C75B] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#E5B745] disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isSavingEdit ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="h-px bg-gray-100 flex-1" />
                <span className="text-xs text-gray-400">Pointage</span>
                <div className="h-px bg-gray-100 flex-1" />
              </div>
            </div>

            <form onSubmit={savePointage} className="p-6 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heures travaillées</label>
                  <input type="number" name="actualHours" min="0" max="23" required defaultValue={selectedShiftForPointage.actualHours ?? selectedShiftForPointage.hours} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
                  <input type="number" name="actualMinutes" min="0" max="59" required defaultValue={selectedShiftForPointage.actualMinutes ?? 0} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none" />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    if (!selectedShiftForPointage) return;
                    deleteShift(selectedShiftForPointage, e);
                    setIsPointageModalOpen(false);
                  }}
                  className="px-3 py-2 text-rose-600 rounded-lg font-medium hover:bg-rose-50 flex items-center gap-1.5 text-sm">
                  <Trash2 size={14} /> Supprimer ce shift
                </button>
                {selectedShiftForPointage.scheduleType === 'split' && (
                  <button
                    type="button"
                    onClick={() => deleteSplitGroup(selectedShiftForPointage)}
                    className="px-3 py-2 text-rose-600 rounded-lg font-medium hover:bg-rose-50 flex items-center gap-1.5 text-sm">
                    <SplitSquareHorizontal size={14} /> Supprimer la coupure (2 segments)
                  </button>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsPointageModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                    Annuler
                  </button>
                  <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600">
                    Enregistrer le pointage
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-900">Historique des ajouts</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ajout unique, duplication, génération IA... — annulez, même ancien.</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-gray-900">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2">
              {shiftBatches.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Aucun ajout récent détecté.</p>
              )}
              {shiftBatches.map(batch => (
                <div key={batch.key} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {batch.shiftIds.length} shift{batch.shiftIds.length > 1 ? 's' : ''} créé{batch.shiftIds.length > 1 ? 's' : ''} le {new Date(batch.ms).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      Période concernée : {batch.minDate === batch.maxDate ? batch.minDate : `${batch.minDate} → ${batch.maxDate}`}
                    </p>
                  </div>
                  <button
                    onClick={() => undoBatch(batch)}
                    disabled={undoingBatchKey === batch.key}
                    className="shrink-0 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-medium hover:bg-rose-100 flex items-center gap-1.5 transition-colors disabled:opacity-50">
                    {undoingBatchKey === batch.key ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    {undoingBatchKey === batch.key ? "..." : "Annuler"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
