import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function DeviceSimulator({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handlePairing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      showToast('Le code doit contenir 6 chiffres', 'error');
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'devices'), where('pairingCode', '==', code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showToast('Code invalide ou expiré', 'error');
        setLoading(false);
        return;
      }

      const deviceDoc = querySnapshot.docs[0];
      const deviceData = deviceDoc.data();

      await updateDoc(doc(db, 'devices', deviceDoc.id), {
        status: 'En ligne',
        pairingCode: '', // clear code after successful pairing
        lastSync: 'Maintenant',
        updatedAt: serverTimestamp()
      });

      showToast(`Connecté en tant que: \${deviceData.nom_appareil || deviceData.name}`, 'success');

      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.error('Fullscreen error', e);
      }

      // Navigate based on type
      if (deviceData.type === 'KDS') {
        setActiveTab('kds');
      } else if (deviceData.type === 'POS Tactile') {
        setActiveTab('finance');
      } else {
        // Tablette Serveur or other
        setActiveTab('tables');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      showToast('Erreur de connexion', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-[#F4C75B]/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] bg-[#F4C75B]/10 blur-[120px] rounded-full"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-8 md:p-12 max-w-lg w-full shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
            <Smartphone size={32} className="text-gray-400" />
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-3">Nouvel Appareil</h1>
          <p className="text-gray-500">
            Saisissez le code d'appairage à 6 chiffres affiché dans le module de gestion des écrans.
          </p>
        </div>

        <form onSubmit={handlePairing} className="space-y-6">
          <div>
            <div className="flex justify-center">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\\D/g, ''))}
                placeholder="000000"
                className="w-full max-w-[280px] text-center text-4xl md:text-5xl tracking-[0.2em] md:tracking-[0.5em] font-mono font-bold text-[#1A1A1A] bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 focus:outline-none focus:border-[#F4C75B] focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={code.length !== 6 || loading}
            className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                Connecter l'appareil
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('docs_devices');
              try {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                }
              } catch (e) {
                console.error(e);
              }
            }}
            className="w-full py-3 bg-transparent text-gray-500 rounded-xl font-medium flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Retour à l'administration
          </button>
        </form>
      </motion.div>
    </div>
  );
}
