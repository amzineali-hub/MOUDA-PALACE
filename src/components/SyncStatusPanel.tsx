import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle2, Database, RefreshCw, Server, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { FileText, Calculator } from 'lucide-react';
import { getDocs, query, orderBy } from 'firebase/firestore';


export default function SyncStatusPanel() {
  const [isGeneratingLog, setIsGeneratingLog] = useState(false);
  const [logReport, setLogReport] = useState<string | null>(null);

  const generateLog = async () => {
    setIsGeneratingLog(true);
    setLogReport(null);
    try {
      // Fetch Cash Receipts
      const cashSnap = await getDocs(collection(db, 'cash_receipts'));
      let totalCash = 0;
      cashSnap.forEach(doc => {
        totalCash += Number(doc.data().total || 0);
      });

      // Fetch Payroll
      const payrollSnap = await getDocs(collection(db, 'payroll'));
      let totalPayroll = 0;
      payrollSnap.forEach(doc => {
        totalPayroll += Number(doc.data().net || 0);
      });

      // Fetch Shifts
      const shiftsSnap = await getDocs(collection(db, 'shifts'));
      const totalShifts = shiftsSnap.size;

      // Check coherency
      const report = `Journal généré le ${new Date().toLocaleString('fr-FR')}
---------------------------------------------------
1. Recettes Caisse : ${totalCash.toFixed(2)} MAD
2. Total Salaires (Paie) : ${totalPayroll.toFixed(2)} MAD
3. Total Sessions de Travail : ${totalShifts}

Bilan : ${totalCash > totalPayroll ? '✅ Recettes supérieures aux salaires.' : '⚠️ Attention : Salaires dépassent les recettes caisse.'}`;
      setLogReport(report);
    } catch (e) {
      console.error(e);
      setLogReport("Erreur lors de la génération du journal.");
    }
    setIsGeneratingLog(false);
  };

  const [rhCount, setRhCount] = useState<number | null>(null);
  const [shiftsCount, setShiftsCount] = useState<number | null>(null);
  const [payrollCount, setPayrollCount] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let unsubStaff = () => {};
    let unsubShifts = () => {};
    let unsubPayroll = () => {};

    try {
      unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
        setRhCount(snapshot.size);
      }, (error) => {
        console.error("Firestore sync error:", error);
        setIsConnected(false);
      });

      unsubShifts = onSnapshot(collection(db, 'shifts'), (snapshot) => {
        setShiftsCount(snapshot.size);
      }, (error) => {
        console.error("Firestore sync error:", error);
        setIsConnected(false);
      });

      unsubPayroll = onSnapshot(collection(db, 'payroll'), (snapshot) => {
        setPayrollCount(snapshot.size);
      }, (error) => {
        console.error("Firestore sync error:", error);
        setIsConnected(false);
      });
    } catch (e) {
      console.error(e);
      setIsConnected(false);
    }

    return () => {
      unsubStaff();
      unsubShifts();
      unsubPayroll();
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">

      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">

        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Database size={24} />
        </div>
        <div>
          <h3 className="text-xl font-serif font-medium text-[#265C6D]">Statut de Synchronisation Firestore</h3>
          <p className="text-sm text-gray-500">Supervision en temps réel des bases de données</p>
        </div>
        <button 
          onClick={generateLog}
          disabled={!isConnected || isGeneratingLog}
          className="flex items-center gap-2 px-4 py-2 bg-[#F4C75B] text-white rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors disabled:opacity-50"
        >
          {isGeneratingLog ? <RefreshCw size={16} className="animate-spin" /> : <Calculator size={16} />}
          Générer journal automatique
        </button>
      </div>

      {logReport && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4 whitespace-pre-wrap font-mono text-sm text-gray-700">
          {logReport}
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Server size={18} className="text-gray-400" />
              Connexion Serveur
            </h4>
            {isConnected ? (
              <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <CheckCircle2 size={14} /> Connecté
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                <XCircle size={14} /> Déconnecté
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">La liaison avec Google Cloud Firestore est active et fonctionnelle en temps réel (WebSockets).</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#F4C75B] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <RefreshCw size={18} className={isConnected ? "animate-spin-slow" : ""} />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Module RH</h5>
                <p className="text-xs text-gray-500">Collection 'staff'</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-[#265C6D]">{rhCount !== null ? rhCount : '-'}</span>
              <p className="text-xs text-gray-500">documents</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#F4C75B] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <RefreshCw size={18} className={isConnected ? "animate-spin-slow" : ""} />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Plannings</h5>
                <p className="text-xs text-gray-500">Collection 'shifts'</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-[#265C6D]">{shiftsCount !== null ? shiftsCount : '-'}</span>
              <p className="text-xs text-gray-500">documents</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#F4C75B] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <RefreshCw size={18} className={isConnected ? "animate-spin-slow" : ""} />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Fiches de Paie</h5>
                <p className="text-xs text-gray-500">Collection 'payroll'</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-[#265C6D]">{payrollCount !== null ? payrollCount : '-'}</span>
              <p className="text-xs text-gray-500">documents</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
