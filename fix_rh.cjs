const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = appCode.indexOf('function PayrollModal(');
if (startIndex !== -1) {
  const endIndex = appCode.indexOf('function Configuration() {');
  
  if (endIndex !== -1) {
    const payrollCode = appCode.substring(startIndex, endIndex);
    
    // Remove it from App.tsx
    appCode = appCode.substring(0, startIndex) + appCode.substring(endIndex);
    fs.writeFileSync('src/App.tsx', appCode);
    
    // Add it to RH.tsx
    let rhCode = fs.readFileSync('src/RH.tsx', 'utf8');
    
    // Also fix lucide-react imports in RH.tsx
    const oldImport = "import { Users, UserPlus, FileText, CheckCircle, Clock, CalendarCheck, Settings, Search, Edit2, AlertTriangle, Plus, X, UploadCloud, Download, BookOpen, Star, Calculator, Lock, Filter } from 'lucide-react';";
    const newImport = "import { Users, UserPlus, FileText, CheckCircle, Clock, CalendarCheck, Settings, Search, Edit2, AlertTriangle, Plus, X, UploadCloud, Download, BookOpen, Star, Calculator, Lock, Filter, Upload, Timer, CalendarRange, Banknote, Shield, UserCheck, Printer, Trash2 } from 'lucide-react';";
    rhCode = rhCode.replace(oldImport, newImport);
    
    // Insert PayrollModal before export default function RH()
    rhCode = rhCode.replace('export default function RH() {', payrollCode + '\nexport default function RH() {');
    
    fs.writeFileSync('src/RH.tsx', rhCode);
    console.log("Fixed RH");
  }
}
