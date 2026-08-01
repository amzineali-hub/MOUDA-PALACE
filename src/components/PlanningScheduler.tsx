import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles, Filter, MoreHorizontal, User as UserIcon, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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

export default function PlanningScheduler({ staffData }: { staffData: any[] }) {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);

  const handleIAPlanning = () => {
    setIsGenerating(true);
    showToast("Analyse IA en cours : contraintes, disponibilités et historique...");
    
    setTimeout(() => {
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
      setShifts([...shifts, ...newShifts]);
      setIsGenerating(false);
      showToast("Planning optimal généré avec succès ✨");
    }, 2500);
  };

  const handleGenericSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const empId = formData.get('employeeId');
    const date = formData.get('date');
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const colorType = formData.get('colorType');

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

    setShifts([...shifts, newShift]);
    setIsGenericModalOpen(false);
    showToast("Shift ajouté avec succès");
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

  const [shifts, setShifts] = useState<Shift[]>([
    // Available shifts
    { id: 's1', employeeId: null, date: weekDays[1].dateStr, startTime: '09:00', endTime: '17:00', hours: 8, colorType: 'pink' },
    { id: 's2', employeeId: null, date: weekDays[2].dateStr, startTime: '09:00', endTime: '17:00', hours: 8, colorType: 'pink' },
    { id: 's3', employeeId: null, date: weekDays[5].dateStr, startTime: '09:00', endTime: '17:00', hours: 8, colorType: 'green' },
    { id: 's4', employeeId: null, date: weekDays[6].dateStr, startTime: '09:00', endTime: '17:00', hours: 8, colorType: 'green' },
    
    // Employee shifts
    { id: 's5', employeeId: employees[0]?.id, date: weekDays[0].dateStr, startTime: '09:00', endTime: '17:00', hours: 8, colorType: 'orange' },
    { id: 's6', employeeId: employees[0]?.id, date: weekDays[1].dateStr, startTime: '09:00', endTime: '17:00', hours: 8, colorType: 'orange' },
    { id: 's7', employeeId: employees[0]?.id, date: weekDays[3].dateStr, startTime: '09:00', endTime: '17:00', hours: 8, colorType: 'orange' },
    { id: 's8', employeeId: employees[0]?.id, date: weekDays[4].dateStr, startTime: '09:00', endTime: '17:00', hours: 8, colorType: 'orange' },

    { id: 's9', employeeId: employees[1]?.id, date: weekDays[1].dateStr, startTime: '14:00', endTime: '18:00', hours: 4, colorType: 'blue' },
    { id: 's10', employeeId: employees[1]?.id, date: weekDays[2].dateStr, startTime: '14:00', endTime: '18:00', hours: 4, colorType: 'blue' },
    { id: 's11', employeeId: employees[1]?.id, date: weekDays[6].dateStr, startTime: '09:00', endTime: '17:00', hours: 8, colorType: 'blue' },
  ]);

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{empId: string | null, date: string} | null>(null);

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

  const addNewShift = (e: React.FormEvent<HTMLFormElement>) => {
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

    setShifts([...shifts, newShift]);
    setIsShiftModalOpen(false);
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
                    <div key={shift.id} className={`p-2 rounded-lg border text-xs font-medium flex flex-col ${COLOR_MAP[shift.colorType]} shadow-sm hover:shadow transition-shadow`}>
                      <span>{shift.startTime} - {shift.endTime}</span>
                      <span className="opacity-80">{shift.hours}h</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {isShiftModalOpen && selectedCell && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                {selectedCell.empId ? "Créer un shift" : "Créer un shift disponible"}
              </h3>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <form onSubmit={addNewShift} className="p-6 space-y-4">
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
                <select name="colorType" className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none">
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
                <select name="employeeId" className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none">
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
                <select name="colorType" className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#F4C75B] outline-none">
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
    </div>
  );
}
