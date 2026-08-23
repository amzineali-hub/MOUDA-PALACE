import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Filter, MoreHorizontal, User as UserIcon, Loader2, Clock, CheckCircle2, Copy, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

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
}

const generateWeekDays = (startDate: Date) => {
  const days = [];
  const current = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    days.push({
      dateStr: current.toISOString().split('T')[0],
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

const COLOR_MAP = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  green: 'bg-green-50 text-green-600 border-green-100',
};

// Raccourcis "shift type" pour saisie en un clic
const SHIFT_PRESETS: { label: string; startTime: string; endTime: string }[] = [
  { label: 'Matin', startTime: '09:00', endTime: '17:00' },
  { label: 'Service Midi', startTime: '11:00', endTime: '15:00' },
  { label: 'Service Soir', startTime: '18:00', endTime: '23:00' },
  { label: 'Journée', startTime: '09:00', endTime: '22:00' },
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

export default function PlanningScheduler({ staffData }: { staffData: any[] }) {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);

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
                id: Math.random().toString(36).substring(7),
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
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const colorType = formData.get('colorType') as 'blue' | 'green' | 'orange' | 'pink' | 'purple';

    const [startH] = startTime.split(':').map(Number);
    const [endH] = endTime.split(':').map(Number);
    let hours = endH - startH;
    if (hours < 0) hours += 24;

    const newShift = {
      id: Math.random().toString(36).substring(7),
      employeeId: empId === 'null' ? null : empId,
      date,
      startTime,
      endTime,
      hours,
      colorType
    };

    try {
      await addDoc(collection(db, 'shifts'), {
        ...newShift,
        createdAt: serverTimestamp()
      });
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
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) as Shift[];
      setShifts(data);
    });
    return () => unsub();
  }, []);

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{empId: string | null, date: string} | null>(null);
  const [isPointageModalOpen, setIsPointageModalOpen] = useState(false);
  const [selectedShiftForPointage, setSelectedShiftForPointage] = useState<Shift | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const genericStartRef = useRef<HTMLInputElement>(null);
  const genericEndRef = useRef<HTMLInputElement>(null);
  const genericColorRef = useRef<HTMLSelectElement>(null);
  const genericEmployeeRef = useRef<HTMLSelectElement>(null);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const getShiftsForCell = (empId: string | null, dateStr: string) => {
    return shifts.filter(s => s.employeeId === empId && s.date === dateStr);
  };

  const calculateTotalHours = (empId: string | null) => {
    return shifts
      .filter(s => s.employeeId === empId && weekDays.some(d => d.dateStr === s.date))
      .reduce((acc, curr) => acc + curr.hours, 0);
  };

  const handleCellClick = (empId: string | null, dateStr: string) => {
    setSelectedCell({ empId, date: dateStr });
    setIsShiftModalOpen(true);
  };

  const addNewShift = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCell) return;

    const formData = new FormData(e.currentTarget);
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const colorType = formData.get('colorType') as any;

    const [startH] = startTime.split(':').map(Number);
    const [endH] = endTime.split(':').map(Number);
    let hours = endH - startH;
    if (hours < 0) hours += 24;

    const newShift: Shift = {
      id: Math.random().toString(36).substring(7),
      employeeId: selectedCell.empId,
      date: selectedCell.date,
      startTime,
      endTime,
      hours,
      colorType
    };

    try {
      await addDoc(collection(db, 'shifts'), {
        ...newShift,
        createdAt: serverTimestamp()
      });
      setIsShiftModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Ajout en un clic depuis un raccourci "shift type" — couleur déduite automatiquement du rôle.
  const quickAddShift = async (preset: { startTime: string; endTime: string }) => {
    if (!selectedCell) return;
    const emp = employees.find(e => e.id === selectedCell.empId);
    const newShift: Shift = {
      id: Math.random().toString(36).substring(7),
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
      let count = 0;
      for (const s of prevShifts) {
        const dayIndex = prevDays.findIndex(d => d.dateStr === s.date);
        const targetDate = weekDays[dayIndex]?.dateStr;
        if (!targetDate) continue;
        const alreadyExists = shifts.some(x =>
          x.employeeId === s.employeeId && x.date === targetDate &&
          x.startTime === s.startTime && x.endTime === s.endTime
        );
        if (alreadyExists) continue;
        await addDoc(collection(db, 'shifts'), {
          employeeId: s.employeeId,
          date: targetDate,
          startTime: s.startTime,
          endTime: s.endTime,
          hours: s.hours,
          colorType: s.colorType,
          createdAt: serverTimestamp()
        });
        count++;
      }
      showToast(count > 0 ? `${count} shift(s) dupliqué(s) depuis la semaine précédente` : "Tous les shifts étaient déjà présents sur cette semaine");
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la duplication", "error");
    } finally {
      setIsDuplicating(false);
    }
  };

  const openPointageModal = (shift: Shift, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedShiftForPointage(shift);
    setIsPointageModalOpen(true);
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
          <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-100 flex items-center gap-2">
            <Filter size={16} /> Filtres
          </button>
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
          <button
            onClick={handleIAPlanning}
            disabled={isGenerating}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 flex items-center gap-2 transition-colors disabled:opacity-50">
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isGenerating ? "Génération..." : "IA Planning"}
          </button>
          <button
            onClick={() => setIsGenericModalOpen(true)}
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
                  <div key={shift.id} className={`p-2 rounded-lg border text-xs font-medium flex flex-col ${COLOR_MAP[shift.colorType]} shadow-sm hover:shadow transition-shadow`}>
                    <span>{shift.startTime} - {shift.endTime}</span>
                    <span className="opacity-80">{shift.hours}h</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {employees.map((emp, empIdx) => (
            <div key={emp.id} className="grid grid-cols-[220px_repeat(7,1fr)] border-b border-gray-100 group bg-white">
              <div className="p-3 border-r border-gray-100 flex items-center gap-3 bg-white group-hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 text-sm">
                  {getInitials(emp.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                  <p className="text-xs text-gray-500">{calculateTotalHours(emp.id)}h / {emp.contractHours}h</p>
                </div>
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
                      className={`p-2 rounded-lg border text-xs font-medium flex flex-col cursor-pointer ${COLOR_MAP[shift.colorType]} shadow-sm hover:shadow transition-shadow`}
                    >
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
              <div className="flex items-center gap-2 my-4">
                <div className="h-px bg-gray-100 flex-1" />
                <span className="text-xs text-gray-400">ou personnalisé</span>
                <div className="h-px bg-gray-100 flex-1" />
              </div>
            </div>

            <form onSubmit={addNewShift} className="px-6 pb-6 space-y-4">
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
                  Ajouter le shift
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
                  Créer le shift
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
              <h3 className="font-semibold text-gray-900">Saisir le pointage</h3>
              <button onClick={() => setIsPointageModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <form onSubmit={savePointage} className="p-6 space-y-4">
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <p><span className="font-medium text-gray-900">Employé :</span> {employees.find(e => e.id === selectedShiftForPointage.employeeId)?.name || '—'}</p>
                <p><span className="font-medium text-gray-900">Jour :</span> {selectedShiftForPointage.date}</p>
                <p><span className="font-medium text-gray-900">Prévu :</span> {selectedShiftForPointage.startTime} - {selectedShiftForPointage.endTime} ({selectedShiftForPointage.hours}h)</p>
              </div>
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

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsPointageModalOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600">
                  Enregistrer le pointage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
