import React, { useState } from 'react';
import { Monitor, Smartphone, Plus, Settings, Trash2, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './context/ToastContext';

export default function DeviceManagement() {
  const { showToast } = useToast();
  const [devices, setDevices] = useState([
    { id: 'dev-1', name: 'Caisse Principale', type: 'POS Tactile', status: 'En ligne', lastSync: 'Il y a 2 min', ip: '192.168.1.15' },
    { id: 'dev-2', name: 'Écran Cuisine (KDS)', type: 'KDS', status: 'En ligne', lastSync: 'Maintenant', ip: '192.168.1.16' },
    { id: 'dev-3', name: 'Tablette Serveur 1', type: 'Prise de Commande', status: 'Hors ligne', lastSync: 'Hier à 22:30', ip: '192.168.1.20' },
  ]);

  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [pairingCode, setPairingCode] = useState('');

  const generatePairingCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPairingCode(code);
  };

  const handleRemoveDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    showToast("Appareil déconnecté et supprimé");
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-2">Gestion des Écrans</h1>
          <p className="text-gray-500">Gérez les terminaux POS, écrans cuisine (KDS) et tablettes serveurs.</p>
        </div>
        <button 
          onClick={() => {
            setIsAddingDevice(true);
            generatePairingCode();
          }}
          className="bg-[#DDA956] text-[#1A1A1A] px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#cda25b] transition-colors"
        >
          <Plus size={18} />
          Ajouter un Écran
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {devices.map(device => (
            <motion.div 
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${device.type === 'KDS' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                    {device.type === 'KDS' ? <Monitor size={24} /> : <Smartphone size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{device.name}</h3>
                    <p className="text-sm text-gray-500">{device.type}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Statut</span>
                  <span className={`font-medium flex items-center gap-1 ${device.status === 'En ligne' ? 'text-green-600' : 'text-gray-400'}`}>
                    {device.status === 'En ligne' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                    {device.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dernière synchro</span>
                  <span className="font-medium text-gray-900">{device.lastSync}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Adresse IP local</span>
                  <span className="font-mono text-gray-700">{device.ip}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button className="text-sm text-gray-500 hover:text-[#DDA956] font-medium flex items-center gap-1 transition-colors">
                  <Settings size={14} /> Configurer
                </button>
                <button 
                  onClick={() => handleRemoveDevice(device.id)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={14} /> Déconnecter
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isAddingDevice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Connecter un appareil</h2>
            <p className="text-center text-gray-500 mb-8">
              Saisissez ce code sur votre nouvel écran POS ou KDS pour l'associer à votre compte.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-8">
              <span className="text-4xl font-mono font-bold tracking-widest text-[#1A1A1A]">
                {pairingCode.substring(0,3)} {pairingCode.substring(3)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 mb-8">
              <RefreshCw size={14} className="animate-spin" /> En attente de connexion...
            </div>

            <button 
              onClick={() => setIsAddingDevice(false)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
