const fs = require('fs');
let appTsx = `import React, { useState, lazy, Suspense } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, UtensilsCrossed, Activity, 
  Settings, Users, BookOpen, FileText, Smartphone, MonitorPlay, File,
  Wallet, Monitor, ChefHat, ChevronDown, ChevronRight, AlertCircle, Database, ShieldCheck
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Documentation from "./Documentation";
import GuideEcrans from "./GuideEcrans";
import AchatsFournisseurs from "./AchatsFournisseurs";
import FichesTechniques from "./FichesTechniques";
import ProductionJournaliere from "./ProductionJournaliere";
import TableauDeBord from "./TableauDeBord";
import GestionTables from "./GestionTables";
import POSTactile from "./POSTactile";
import EcranCuisine from "./EcranCuisine";
import DeviceManagement from "./DeviceManagement";
import DeviceSimulator from "./DeviceSimulator";
import SystemMonitoring from "./SystemMonitoring";
import DocumentsRestaurant from "./DocumentsRestaurant";
import Inventory from "./Inventory";

const RH = lazy(() => import('./RH'));

function SubNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-2 \${
        active 
          ? 'bg-[#F4C75B] text-[#265C6D] shadow-lg shadow-[#F4C75B]/20' 
          : 'text-[#F4C75B] border border-[#F4C75B]/30 hover:border-[#F4C75B] hover:bg-[#F4C75B]/10'
      }\`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function NavCategory({ title, icon, isExpanded, onClick, children }: { title: string, icon: React.ReactNode, isExpanded: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-white/90 hover:bg-white/10 font-medium"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </div>
        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {isExpanded && (
        <div className="pl-4 pr-2 mt-2 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('general');

  // Comment out auth block to allow access in preview
  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-[#265C6D] to-[#2a2a2a] flex items-center justify-center p-6">
  //       <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl text-center">
  //         <h1 className="text-3xl font-serif text-[#265C6D] font-bold mb-4">Mouda Palace</h1>
  //         <p className="text-gray-500 mb-8">Connectez-vous pour accéder à l'espace de gestion.</p>
  //         <button 
  //           onClick={login}
  //           className="w-full bg-[#F4C75B] text-[#265C6D] font-medium py-3 rounded-xl hover:bg-[#E5B745] transition-colors"
  //         >
  //           Connexion avec Google
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <TableauDeBord />;
      case 'inventory': return <Inventory />;
      case 'achats': return <AchatsFournisseurs />;
      case 'recettes': return <FichesTechniques />;
      case 'production': return <ProductionJournaliere />;
      case 'finance': return <POSTactile />;
      case 'docs_devices': return <DeviceManagement />;
      case 'kds': return <EcranCuisine />;
      case 'tables': return <GestionTables />;
      case 'rh': return <Suspense fallback={<div>Loading...</div>}><RH /></Suspense>;
      case 'docs': return <Documentation />;
      case 'guide': return <GuideEcrans />;
      case 'simulator': return <DeviceSimulator />;
      case 'monitoring': return <SystemMonitoring />;
      case 'documents': return <DocumentsRestaurant />;
      default: return <TableauDeBord />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar */}
      <div className="w-80 bg-[#265C6D] text-white flex flex-col shadow-xl z-20 h-full overflow-y-auto">
        <div className="p-6 text-center border-b border-white/10">
          <div className="w-20 h-20 bg-[#F4C75B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
             <Database size={40} className="text-[#265C6D]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#F4C75B] tracking-wide">MOUDA PALACE</h2>
          <p className="text-white/80 text-sm mt-1 uppercase tracking-widest text-xs">Espace Synoptique</p>
        </div>
        
        <div className="px-4 py-4 space-y-1 flex-1">
          <NavCategory 
            title="Général" 
            icon={<LayoutDashboard size={18} />}
            isExpanded={expandedCategory === 'general'}
            onClick={() => setExpandedCategory(expandedCategory === 'general' ? null : 'general')}
          >
            <SubNavItem icon={<LayoutDashboard size={16} />} label="Tableau de Bord" active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} />
            <SubNavItem icon={<File size={16} />} label="Documents" active={activeTab === 'documents'} onClick={() => handleTabChange('documents')} />
            <SubNavItem icon={<BookOpen size={16} />} label="Documentation" active={activeTab === 'docs'} onClick={() => handleTabChange('docs')} />
          </NavCategory>

          <NavCategory 
            title="Opérations & Stocks" 
            icon={<Package size={18} />}
            isExpanded={expandedCategory === 'operations'}
            onClick={() => setExpandedCategory(expandedCategory === 'operations' ? null : 'operations')}
          >
            <SubNavItem icon={<Package size={16} />} label="État des Stocks" active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} />
            <SubNavItem icon={<ShoppingCart size={16} />} label="Achats & Fournisseurs" active={activeTab === 'achats'} onClick={() => handleTabChange('achats')} />
            <SubNavItem icon={<UtensilsCrossed size={16} />} label="Fiches Techniques" active={activeTab === 'recettes'} onClick={() => handleTabChange('recettes')} />
            <SubNavItem icon={<Activity size={16} />} label="Production" active={activeTab === 'production'} onClick={() => handleTabChange('production')} />
          </NavCategory>

          <NavCategory 
            title="Écrans Tactiles & Cuisine" 
            icon={<Monitor size={18} />}
            isExpanded={expandedCategory === 'ecrans'}
            onClick={() => setExpandedCategory(expandedCategory === 'ecrans' ? null : 'ecrans')}
          >
            <SubNavItem icon={<Wallet size={16} />} label="Caisse / POS Tactile" active={activeTab === 'finance'} onClick={() => handleTabChange('finance')} />
            <SubNavItem icon={<Monitor size={16} />} label="Gestion des Appareils" active={activeTab === 'docs_devices'} onClick={() => handleTabChange('docs_devices')} />
            <SubNavItem icon={<ChefHat size={16} />} label="Écran Cuisine (KDS)" active={activeTab === 'kds'} onClick={() => handleTabChange('kds')} />
          </NavCategory>

          <NavCategory 
            title="Administration" 
            icon={<ShieldCheck size={18} />}
            isExpanded={expandedCategory === 'admin'}
            onClick={() => setExpandedCategory(expandedCategory === 'admin' ? null : 'admin')}
          >
            <SubNavItem icon={<Users size={16} />} label="Ressources Humaines" active={activeTab === 'rh'} onClick={() => handleTabChange('rh')} />
            <SubNavItem icon={<Settings size={16} />} label="Monitoring & Système" active={activeTab === 'monitoring'} onClick={() => handleTabChange('monitoring')} />
          </NavCategory>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 relative">
        {renderContent()}
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/App.tsx', appTsx);
