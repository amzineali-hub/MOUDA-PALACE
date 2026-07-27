const fs = require('fs');
let code = fs.readFileSync('src/DeviceManagement.tsx', 'utf8');

code = code.replace(
  "export default function DeviceManagement() {",
  "export default function DeviceManagement({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {"
);

code = code.replace(
  /status: 'En ligne',/g,
  "status: 'En attente',\n        pairingCode: pairingCode,"
);

const btnRepl = `          <button 
            onClick={() => setActiveTab && setActiveTab('device_simulator')}
            className="bg-white border border-[#DDA956] text-[#DDA956] px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#DDA956]/10 transition-colors shadow-sm"
          >
            <Smartphone size={18} />
            Simuler Tablette
          </button>
          <button 
            onClick={() => {
              setIsAddingDevice(true);
              generatePairingCode();
            }}
            className="bg-[#DDA956] text-[#1A1A1A] px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#cda25b] transition-colors shadow-sm"
          >
            <Plus size={18} />
            Ajouter un Écran
          </button>`;

code = code.replace(
  /<button \n          onClick=\{\(\) => \{\n            setIsAddingDevice\(true\);\n            generatePairingCode\(\);\n          \}\}\n          className="bg-\[\#DDA956\] text-\[\#1A1A1A\] px-6 py-2\.5 rounded-xl font-bold flex items-center gap-2 hover:bg-\[\#cda25b\] transition-colors shadow-sm"\n        >\n          <Plus size=\{18\} \/>\n          Ajouter un Écran\n        <\/button>/,
  btnRepl
);

const statusRepl = `                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Statut</span>
                    <span className={\`font-medium flex items-center gap-1 \${device.status === 'En ligne' ? 'text-green-600' : device.status === 'En attente' ? 'text-orange-500' : 'text-gray-400'}\`}>
                      {device.status === 'En ligne' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                      {device.status === 'En attente' && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>}
                      {device.status}
                    </span>
                  </div>`;

code = code.replace(
  /<div className="flex justify-between text-sm">\n                    <span className="text-gray-500">Statut<\/span>\n                    <span className=\{\`font-medium flex items-center gap-1 \$\{device.status === 'En ligne' \? 'text-green-600' : 'text-gray-400'\}\`\}>\n                      \{device.status === 'En ligne' && <div className="w-2 h-2 rounded-full bg-green-500"><\/div>\}\n                      \{device.status\}\n                    <\/span>\n                  <\/div>/,
  statusRepl
);

fs.writeFileSync('src/DeviceManagement.tsx', code);
