const fs = require('fs');
let code = fs.readFileSync('src/DeviceManagement.tsx', 'utf8');

const regex = /<div className="flex justify-between items-end mb-8">[\s\S]*?<\/div>\s*<div className="grid grid-cols-1 md:grid-cols-3 gap-6">/;

const newHeader = `<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-2">Gestion des Écrans</h1>
          <p className="text-gray-500">Gérez les terminaux POS, écrans cuisine (KDS) et tablettes serveurs.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab && setActiveTab('device_simulator')}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">`;

code = code.replace(regex, newHeader);

fs.writeFileSync('src/DeviceManagement.tsx', code);
