const fs = require('fs');
let code = fs.readFileSync('src/DeviceManagement.tsx', 'utf8');

// Add new state for the identifier
const stateRepl = `  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('POS Tactile');
  const [newDeviceIdentifier, setNewDeviceIdentifier] = useState('');

  const [isConfiguringDevice, setIsConfiguringDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [editDeviceName, setEditDeviceName] = useState('');
  const [editDeviceType, setEditDeviceType] = useState('');
  const [editDeviceAssignedTo, setEditDeviceAssignedTo] = useState('');
  const [editDeviceIdentifier, setEditDeviceIdentifier] = useState('');`;

code = code.replace(
  /  const \[isAddingDevice[\s\S]*?const \[editDeviceAssignedTo, setEditDeviceAssignedTo\] = useState\(''\);/,
  stateRepl
);

// Add initialization in openConfigure
const openConfigRepl = `  const openConfigure = (device: any) => {
    setEditingDevice(device);
    setEditDeviceName(device.name || '');
    setEditDeviceType(device.type || '');
    setEditDeviceAssignedTo(device.assignedTo || '');
    setEditDeviceIdentifier(device.identifier || '');
    setIsConfiguringDevice(true);
  };`;

code = code.replace(
  /  const openConfigure = \([\s\S]*?setIsConfiguringDevice\(true\);\n  };/,
  openConfigRepl
);

// Add to handleAddDevice
const addDocRepl = `      await addDoc(collection(db, 'devices'), {
        name: newDeviceName,
        type: newDeviceType,
        identifier: newDeviceIdentifier,
        status: 'En ligne',
        lastSync: 'Maintenant',
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        createdAt: serverTimestamp()
      });
      showToast('Écran ajouté avec succès');
      setIsAddingDevice(false);
      setNewDeviceName('');
      setNewDeviceIdentifier('');`;

code = code.replace(
  /      await addDoc\(collection\(db, 'devices'\), \{[\s\S]*?setNewDeviceName\(''\);/,
  addDocRepl
);

// Add to handleSaveConfig
const saveConfigRepl = `      await updateDoc(doc(db, 'devices', editingDevice.id), {
        name: editDeviceName,
        type: editDeviceType,
        assignedTo: editDeviceAssignedTo,
        identifier: editDeviceIdentifier
      });`;

code = code.replace(
  /      await updateDoc\(doc\(db, 'devices', editingDevice.id\), \{[\s\S]*?\}\);/,
  saveConfigRepl
);

// Add identifier rendering to card
const cardRenderRepl = `                    <div>
                      <h3 className="font-bold text-gray-900">{device.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-gray-500">{device.type}</p>
                        {device.identifier && (
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                            {device.identifier}
                          </span>
                        )}
                      </div>
                    </div>`;

code = code.replace(
  /                    <div>\n                      <h3 className="font-bold text-gray-900">\{device.name\}<\/h3>\n                      <p className="text-sm text-gray-500">\{device.type\}<\/p>\n                    <\/div>/,
  cardRenderRepl
);

// Add identifier input to Add form
const addFormInputRepl = `              <div>
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
              </div>`;

code = code.replace(
  /              <div>\n                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'écran<\/label>\n                <select[\s\S]*?<\/select>\n              <\/div>/,
  addFormInputRepl
);

// Add identifier input to Config form
const configFormInputRepl = `              <div>
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
              </div>`;

code = code.replace(
  /              <div>\n                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'écran<\/label>\n                <select \n                  value=\{editDeviceType\}[\s\S]*?<\/select>\n              <\/div>/,
  configFormInputRepl
);

fs.writeFileSync('src/DeviceManagement.tsx', code);
