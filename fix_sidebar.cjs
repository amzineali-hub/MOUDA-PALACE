const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldSidebar = `function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all \${
        active ? 'bg-[#F4C75B] text-[#265C6D] font-medium shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }\`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}`;

const newSidebar = `function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 \${
        active 
          ? 'bg-[#F4C75B] text-[#265C6D] shadow-lg shadow-[#F4C75B]/20' 
          : 'text-[#F4C75B] border border-[#F4C75B]/30 hover:border-[#F4C75B] hover:bg-[#F4C75B]/10'
      }\`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}`;

code = code.replace(oldSidebar, newSidebar);
fs.writeFileSync('src/App.tsx', code);
