import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Plus, Settings, Trash2, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function DeviceManagement({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const { showToast } = useToast();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('POS Tactile');
  const [newDeviceIdentifier, setNewDeviceIdentifier] = useState('');

  const [isConfiguringDevice, setIsConfiguringDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [editDeviceName, setEditDeviceName] = useState('');
  const [editDeviceType, setEditDeviceType] = useState('');
  const [editDeviceAssignedTo, setEditDeviceAssignedTo] = useState('');
  const [editDeviceIdentifier, setEditDeviceIdentifier] = useState('');

  const openConfigure = (device: any) => {
    setEditingDevice(device);
    setEditDeviceName(device.nom_appareil || device.name || '');
    setEditDeviceType(device.type || '');
    setEditDeviceAssignedTo(device.assignedTo || '');
    setEditDeviceIdentifier(device.identifier || '');
    setIsConfiguringDevice(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    try {
      await updateDoc(doc(db, 'devices', editingDevice.id), {
        nom_appareil: editDeviceName,
        type: editDeviceType,
        assignedTo: editDeviceAssignedTo,
        identifier: editDeviceIdentifier
      });
      showToast('Configuration enregistrée');
      setIsConfiguringDevice(false);
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de la configuration', 'error');
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'devices'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDevices(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const generatePairingCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPairingCode(code);
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName) return;
    try {
      await addDoc(collection(db, 'devices'), {
        nom_appareil: newDeviceName,
        type: newDeviceType,
        identifier: newDeviceIdentifier,
        status: 'En attente',
        pairingCode: pairingCode,
        lastSync: 'Maintenant',
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        createdAt: serverTimestamp()
      });
      showToast('Écran ajouté avec succès');
      setIsAddingDevice(false);
      setNewDeviceName('');
      setNewDeviceIdentifier('');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleRemoveDevice = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'devices', id));
      showToast("Appareil déconnecté et supprimé");
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-2">Gestion des Écrans</h1>
          <p className="text-gray-500">Gérez les terminaux POS, écrans cuisine (KDS) et tablettes serveurs.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={() => {
              if (setActiveTab) setActiveTab('device_simulator');
              try {
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen();
                }
              } catch (e) {
                console.error('Fullscreen error', e);
              }
            }}
            className="w-full sm:w-auto justify-center bg-white border border-[#DDA956] text-[#DDA956] px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#DDA956]/10 transition-colors shadow-sm"
          >
            <Smartphone size={18} />
            Simuler Tablette
          </button>
          <button 
            onClick={() => {
              setIsAddingDevice(true);
              generatePairingCode();
            }}
            className="w-full sm:w-auto justify-center bg-[#DDA956] text-[#1A1A1A] px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#cda25b] transition-colors shadow-sm"
          >
            <Plus size={18} />
            Ajouter un Écran
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-500">Chargement des écrans...</div>
        ) : devices.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Monitor size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun écran configuré pour le moment.</p>
          </div>
        ) : (
          <AnimatePresence>
            {devices.map(device => (
              <motion.div 
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${device.type === 'KDS' ? 'bg-blue-50 text-blue-600' : device.type === 'POS Tactile' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {device.type === 'KDS' ? <Monitor size={24} /> : <Smartphone size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{device.nom_appareil || device.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-gray-500">{device.type}</p>
                        {device.identifier && (
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                            {device.identifier}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  {device.assignedTo && (
                    <div className="flex justify-between text-sm bg-amber-50 p-2 rounded-lg border border-amber-100">
                      <span className="text-amber-800 font-medium">Assigné à</span>
                      <span className="font-bold text-amber-900">{device.assignedTo}</span>
                    </div>
                  )}
                                    <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Statut</span>
                    <span className={`font-medium flex items-center gap-1 ${device.status === 'En ligne' ? 'text-green-600' : device.status === 'En attente' ? 'text-orange-500' : 'text-gray-400'}`}>
                      {device.status === 'En ligne' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                      {device.status === 'En attente' && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>}
                      {device.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dernière synchro</span>
                    <span className="font-medium text-gray-900">{device.lastSync || 'Jamais'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Adresse IP local</span>
                    <span className="font-mono text-gray-700">{device.ip || 'Non attribuée'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <button 
                    onClick={() => openConfigure(device)}
                    className="text-sm text-gray-500 hover:text-[#DDA956] font-medium flex items-center gap-1 transition-colors"
                  >
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
        )}
      </div>

      {isAddingDevice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
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
              Ajoutez un nouvel écran POS, KDS ou une tablette serveur à votre établissement.
            </p>

            <form onSubmit={handleAddDevice} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'écran</label>
                <input 
                  type="text" 
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="Ex: Caisse Bar" 
                  required 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'écran</label>
                <select 
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956]"
                >
                  <option value="POS Tactile">Caisse Tactile (POS)</option>
                  <option value="KDS">Écran Cuisine (KDS)</option>
                  <option value="Prise de Commande">Tablette Serveur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant unique (Optionnel)</label>
                <input 
                  type="text" 
                  value={newDeviceIdentifier}
                  onChange={(e) => setNewDeviceIdentifier(e.target.value)}
                  placeholder="Ex: BAR-01, KDS-CUI" 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956]"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#DDA956] text-[#1A1A1A] rounded-xl font-bold hover:bg-[#cda25b] transition-colors"
                >
                  Valider et Ajouter
                </button>
              </div>
            </form>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-6">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Code d'appairage</p>
              <span className="text-3xl font-mono font-bold tracking-widest text-[#1A1A1A]">
                {pairingCode.substring(0,3)} {pairingCode.substring(3)}
              </span>
            </div>

            <button 
              onClick={() => setIsAddingDevice(false)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
          </motion.div>
        </div>
      )}
      {isConfiguringDevice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <div className="w-16 h-16 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Settings size={32} />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Configurer l'écran</h2>
            
            <form onSubmit={handleSaveConfig} className="space-y-4 mb-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'écran</label>
                <input 
                  type="text" 
                  value={editDeviceName}
                  onChange={(e) => setEditDeviceName(e.target.value)}
                  required 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'écran</label>
                <select 
                  value={editDeviceType}
                  onChange={(e) => setEditDeviceType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956]"
                >
                  <option value="POS Tactile">Caisse Tactile (POS)</option>
                  <option value="KDS">Écran Cuisine (KDS)</option>
                  <option value="Prise de Commande">Tablette Serveur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant unique (Optionnel)</label>
                <input 
                  type="text" 
                  value={editDeviceIdentifier}
                  onChange={(e) => setEditDeviceIdentifier(e.target.value)}
                  placeholder="Ex: BAR-01, KDS-CUI" 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à (Serveur/Personnel)</label>
                <input 
                  type="text" 
                  value={editDeviceAssignedTo}
                  onChange={(e) => setEditDeviceAssignedTo(e.target.value)}
                  placeholder="Ex: Saïd" 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsConfiguringDevice(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#DDA956] text-[#1A1A1A] rounded-xl font-bold hover:bg-[#cda25b] transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
