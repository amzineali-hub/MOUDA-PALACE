import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Clock } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export default function LivePlanningWidget() {
  const [time, setTime] = useState(new Date());
  const [activeStaff, setActiveStaff] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      const isAdmin = (staff: any) =>
        staff.department === 'Management' || /admin/i.test(staff.role || '');
      data.sort((a, b) => {
        const adminDiff = Number(isAdmin(b)) - Number(isAdmin(a));
        if (adminDiff !== 0) return adminDiff;
        return (a.name || '').localeCompare(b.name || '');
      });
      const defaultPhotos = [
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100"
      ];
      
      const formattedStaff = data.map((staff, index) => ({
        id: staff.id,
        name: staff.name || "Inconnu",
        role: staff.role || "Non défini",
        area: staff.department || "Général",
        status: staff.status === "Actif" ? "actif" : (staff.status === "En congé" || staff.status === "Absent") ? "pause" : "actif",
        time: staff.shift && staff.shift !== "-" ? staff.shift : "08:00 - 16:00",
        photo: (staff.photo && staff.photo !== "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" && staff.photo !== "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100") ? staff.photo : defaultPhotos[index % defaultPhotos.length]
      }));
      setActiveStaff(formattedStaff.slice(0, 4)); // Limiting to 4 for the widget layout
    });
    return () => unsub();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-full mb-8"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Live Planning & Staff</h3>
            <p className="text-sm text-gray-500">Vue en temps réel des effectifs</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
            <Clock size={16} className="text-gray-400" />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        {activeStaff.map((staff, idx) => (
          <motion.div 
            key={staff.id} 
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 10 },
              show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
            }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white shadow-sm hover:shadow-md flex items-start gap-4 transition-colors cursor-pointer relative overflow-hidden"
          >
            {staff.status === 'actif' && (
              <span className="absolute top-4 right-4 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
            {staff.status === 'pause' && (
              <span className="absolute top-4 right-4 flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F4C75B]"></span>
              </span>
            )}
            <div className="relative w-16 h-16 shrink-0">
              <img 
                src={staff.photo} 
                alt={staff.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-bold text-gray-900 truncate mb-0.5">{staff.name}</p>
              <p className="text-xs font-semibold text-[#265C6D] mb-2">{staff.role}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span className="bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm">{staff.area}</span>
                <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{staff.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
