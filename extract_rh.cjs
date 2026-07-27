const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Find the start of function StaffHR()
const startIndex = appCode.indexOf('function StaffHR() {');
if (startIndex !== -1) {
  // Find the end of it (it's the last function in App.tsx right now, or close to it)
  // Let's just find where `export default App;` is. Actually App is default exported at the top? No, let's check App.tsx end.
  const endIndex = appCode.lastIndexOf('export default App;');
  
  if (endIndex !== -1 && startIndex < endIndex) {
    const staffCode = appCode.substring(startIndex, endIndex);
    
    let imports = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, FileText, CheckCircle, Clock, CalendarCheck, Settings, Search, Edit2, AlertTriangle, Plus, X, UploadCloud, Download, BookOpen, Star, Calculator, Lock } from 'lucide-react';
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

    fs.writeFileSync('src/RH.tsx', imports + staffCode.replace('function StaffHR()', 'export default function RH()'));
    
    appCode = appCode.substring(0, startIndex) + "\n\n" + appCode.substring(endIndex);
    fs.writeFileSync('src/App.tsx', appCode);
    console.log("Extracted to RH.tsx");
  } else {
    console.log("Could not find boundaries.");
  }
} else {
  console.log("Could not find StaffHR.");
}
