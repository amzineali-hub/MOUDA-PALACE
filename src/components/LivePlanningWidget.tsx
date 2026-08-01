import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Clock, ArrowRight, UserCheck } from 'lucide-react';

export default function LivePlanningWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const activeStaff = [
    { id: 1, name: "Amine K.", role: "Chef de Rang", area: "Terrasse", status: "actif", time: "14:00 - 22:00", avatar: "AK" },
    { id: 2, name: "Sarah M.", role: "Manager", area: "Salle Principale", status: "actif", time: "16:00 - 00:00", avatar: "SM" },
    { id: 3, name: "Youssef T.", role: "Chef de Cuisine", area: "Cuisine", status: "actif", time: "15:00 - 23:00", avatar: "YT" },
    { id: 4, name: "Sofia B.", role: "Serveuse", area: "Terrasse", status: "pause", time: "12:00 - 20:00", avatar: "SB" }
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeStaff.map((staff, idx) => (
          <div key={staff.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#265C6D] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {staff.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-gray-900 truncate">{staff.name}</p>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${staff.status === 'actif' ? 'bg-emerald-500' : 'bg-[#F4C75B]'}`} />
              </div>
              <p className="text-xs text-[#265C6D] font-medium mb-1">{staff.role}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{staff.area}</span>
                <span className="font-medium text-gray-700">{staff.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
