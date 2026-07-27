const fs = require('fs');
let code = fs.readFileSync('src/DeviceManagement.tsx', 'utf8');

code = code.replace(
  "import { collection, onSnapshot, query, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';",
  "import { collection, onSnapshot, query, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';"
);

const stateRepl = `  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('POS Tactile');

  const [isConfiguringDevice, setIsConfiguringDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [editDeviceName, setEditDeviceName] = useState('');
  const [editDeviceType, setEditDeviceType] = useState('');
  const [editDeviceAssignedTo, setEditDeviceAssignedTo] = useState('');

  const openConfigure = (device: any) => {
    setEditingDevice(device);
    setEditDeviceName(device.name || '');
    setEditDeviceType(device.type || '');
    setEditDeviceAssignedTo(device.assignedTo || '');
    setIsConfiguringDevice(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    try {
      await updateDoc(doc(db, 'devices', editingDevice.id), {
        name: editDeviceName,
        type: editDeviceType,
        assignedTo: editDeviceAssignedTo
      });
      showToast('Configuration enregistrée');
      setIsConfiguringDevice(false);
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de la configuration', 'error');
    }
  };`;

code = code.replace(
  /  const \[isAddingDevice, setIsAddingDevice\] = useState\(false\);\n  const \[pairingCode, setPairingCode\] = useState\(''\);\n  \n  const \[newDeviceName, setNewDeviceName\] = useState\(''\);\n  const \[newDeviceType, setNewDeviceType\] = useState\('POS Tactile'\);/,
  stateRepl
);


const displayRepl = `                <div className="space-y-3 mb-6 flex-1">
                  {device.assignedTo && (
                    <div className="flex justify-between text-sm bg-amber-50 p-2 rounded-lg border border-amber-100">
                      <span className="text-amber-800 font-medium">Assigné à</span>
                      <span className="font-bold text-amber-900">{device.assignedTo}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">`;

code = code.replace(
  `                <div className="space-y-3 mb-6 flex-1">\n                  <div className="flex justify-between text-sm">`,
  displayRepl
);


const btnRepl = `                  <button 
                    onClick={() => openConfigure(device)}
                    className="text-sm text-gray-500 hover:text-[#DDA956] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Settings size={14} /> Configurer
                  </button>`;

code = code.replace(
  `<button className="text-sm text-gray-500 hover:text-[#DDA956] font-medium flex items-center gap-1 transition-colors">\n                    <Settings size={14} /> Configurer\n                  </button>`,
  btnRepl
);

const modalRepl = `      {isConfiguringDevice && (
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
}`;

code = code.replace(
  `    </div>\n  );\n}`,
  modalRepl
);

fs.writeFileSync('src/DeviceManagement.tsx', code);
