const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

// Update useState
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'commandes' | 'fournisseurs' | 'previsions'>('commandes');",
  "const [activeTab, setActiveTab] = useState<'commandes' | 'fournisseurs' | 'previsions' | 'reception'>('commandes');"
);

// Add tab button
const tabTarget = `<button 
              onClick={() => setActiveTab('fournisseurs')}`;

const tabReplacement = `<button 
              onClick={() => setActiveTab('reception')}
              className={\`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 \${activeTab === 'reception' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}\`}
            >
              <Truck size={16} className={activeTab === 'reception' ? 'text-[#1A1A1A]' : 'text-gray-400'} />
              Réception (Contrôle)
            </button>
            <button 
              onClick={() => setActiveTab('fournisseurs')}`;

content = content.replace(tabTarget, tabReplacement);

// We also need to add the ReceptionAchats and ValidateReceptionModal logic.
// We can just append the necessary components at the bottom of the file.

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log("Patched AchatsFournisseurs tabs");
