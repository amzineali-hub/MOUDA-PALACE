const fs = require('fs');

let code = fs.readFileSync('src/RH.tsx', 'utf8');

const imports = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, FileText, CheckCircle, Clock, CalendarCheck, Settings, Search, Edit2, AlertTriangle, Plus, X, UploadCloud, Download, BookOpen, Star, Calculator, Lock, Filter } from 'lucide-react';
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

`;

code = imports + code.replace('function StaffHR()', 'export default function RH()');

fs.writeFileSync('src/RH.tsx', code);
