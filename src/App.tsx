/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { calculateStockStatus } from './lib/inventoryUtils';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  FileSpreadsheet,
  ChefHat, 
  Users, 
  MessageCircle, 
  Settings, 
  MapPin, 
  TrendingUp, 
  CalendarCheck,
  UtensilsCrossed,
  ConciergeBell,
  LogOut,
  LogIn,
  Sparkles,
  Loader2,
  AlertTriangle,
  Globe,
  Building,
  CreditCard,
  Bell,
  Shield,
  Smartphone,
  Mail,
  Clock,
  Save,
  Menu,
  X,
  Search,
  Facebook,
  Instagram,
  Banknote,
  Store,
  Megaphone,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Star,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingCart,
  Car,
  Download,
  Percent,
  Briefcase,
  Share2,
  BookOpen,
  ArrowLeft,
  Terminal,
  Wallet,
  Receipt,
  RefreshCw,
  Printer,
  Wand2,
  UserX,
  Send,
  BookText,
  Scale,
  TrendingDown,
  ClipboardList,
  Truck,
  Phone,
  CalendarRange,
  UserCheck,
  GraduationCap,
  FileText,
  Award,
  Timer
} from 'lucide-react';
import { isCriticalStock } from './lib/inventory';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { signInWithPopup, googleProvider, auth, signOut, db } from './firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import Accounting from './Accounting';

function ReviewAnalyzer() {
  const [review, setReview] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const analyzeReview = async () => {
    if (!review) return;
    setLoading(true);
    try {
      const response = await fetch("/api/analyze-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewText: review }),
      });
      const data = await response.json();
      setAnalysis(data);
      showToast("Analyse terminée avec succès");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'analyse", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Sparkles size={20} />
        </div>
        <h3 className="text-xl font-serif font-medium">Analyse d'Avis (IA)</h3>
      </div>
      
      <div className="space-y-4">
        <textarea
          className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#DDA956] resize-none h-32"
          placeholder="Collez un avis client ici pour l'analyser avec l'IA..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <button 
          onClick={analyzeReview}
          disabled={loading || !review}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Analyse IA
        </button>
      </div>

      {analysis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 bg-gray-50 rounded-xl space-y-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sentiment:</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
              analysis.sentiment === 'positif' ? 'bg-green-100 text-green-700' :
              analysis.sentiment === 'négatif' ? 'bg-red-100 text-red-700' :
              'bg-gray-200 text-gray-700'
            }`}>
              {analysis.sentiment}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-green-700 mb-2">Points Forts</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {analysis.pointsForts?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-2">Points à Améliorer</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {analysis.pointsFaibles?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Réponse Suggérée (Prête à envoyer)</h4>
            <p className="text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-100 italic">
              "{analysis.reponseSuggeree}"
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InventoryAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lowStockItems: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.quantity !== undefined && data.criticalThreshold !== undefined) {
          if (isCriticalStock(data.quantity, data.criticalThreshold)) {
            lowStockItems.push({ id: doc.id, ...data });
          }
        }
      });
      setAlerts(lowStockItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory alerts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || alerts.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
          <AlertTriangle size={20} />
        </div>
        <h3 className="text-lg font-serif font-medium text-red-900">Alertes de Stock</h3>
      </div>
      <div className="space-y-3">
        {alerts.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-red-50">
            <span className="font-medium text-red-900">{item.name || 'Produit inconnu'}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-red-700">Stock actuel: {item.quantity} {item.unit || ''}</span>
              <span className="text-sm text-red-500 font-medium">Seuil: {item.criticalThreshold} {item.unit || ''}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function App() {
  const [appMode, setAppMode] = useState<'selection' | 'admin' | 'partner'>('selection');
  const { user, loading, role } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const searchItems = [
    { type: 'Réservation', text: 'Table 4 - Dîner (20:00) - M. Dupont' },
    { type: 'Réservation', text: 'Table 12 - Dîner (19:30) - Mme. Martin' },
    { type: 'Inventaire', text: 'Safran de Taliouine - 50g' },
    { type: 'Inventaire', text: 'Huile d\'Argan Culinaire - 5L' },
    { type: 'Inventaire', text: 'Viande d\'Agneau - 20kg' },
    { type: 'Réservation', text: 'Événement Privé (21:00) - 15 personnes' }
  ];

  const filteredSearch = searchQuery.length > 0 
    ? searchItems.filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Connexion réussie");
    } catch (error: any) {
      console.error("Login failed", error);
      
      // Amélioration du message d'erreur
      if (error.code === 'auth/unauthorized-domain') {
        showToast("Domaine non autorisé. Veuillez ouvrir l'application dans un nouvel onglet.", "error");
      } else if (error.message?.includes('cross-origin')) {
        showToast("Erreur iframe. Veuillez ouvrir l'application dans un nouvel onglet.", "error");
      } else {
        showToast(error.message || "Erreur de connexion", "error");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Déconnexion réussie");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-serif text-[#DDA956]">Chargement...</div>;
  }

  if (appMode === 'selection') {
    return <PortalSelection onSelect={setAppMode} />;
  }

  if (appMode === 'partner') {
    return <PartnerPortal onBack={() => setAppMode('selection')} />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview setActiveTab={setActiveTab} />;
      case 'reservations':
        return <Reservations />;
      case 'b2b':
        return <B2BPortal />;
      case 'whatsapp':
        return <WhatsAppAI />;
      case 'menu':
        return <DigitalMenu />;
      case 'inventory':
        return <Inventory />;
      case 'staff':
        return <StaffHR />;
      case 'finance':
        return <TacSystemsPOS />;
      case 'accounting':
        return <Accounting />;
      case 'config':
        return <Configuration />;
      default:
        return <Overview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="print:hidden md:hidden flex items-center justify-between bg-[#1A1A1A] p-4 text-[#DDA956] z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div 
             className="h-8 w-10 bg-[#DDA956]" 
             style={{
              maskImage: 'url(/mouda.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: 'url(/mouda.png)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center'
            }}
          />
          <span className="font-serif font-normal tracking-[0.1em] uppercase text-sm text-white">Mouda Palace</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#E8E6E1] p-1">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`print:hidden ${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-[#1A1A1A] text-[#E8E6E1] p-6 flex-col border-r border-[#333] fixed md:sticky top-16 md:top-0 h-[calc(100vh-4rem)] md:h-screen z-40 overflow-y-auto`}>
        <div className="mb-12 hidden md:flex flex-col items-center text-center">
          <div 
            className="h-24 w-32 mb-4 bg-[#DDA956]" 
            style={{
              maskImage: 'url(/mouda.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: 'url(/mouda.png)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center'
            }}
            title="Mouda Palace Logo"
          />
          <h1 className="text-xl font-serif text-[#DDA956] font-normal tracking-[0.15em] uppercase">
            Mouda Palace
          </h1>
          <a href="https://moudapalace.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-400 mt-2 block uppercase tracking-widest hover:text-[#DDA956] transition-colors">
            moudapalace.com
          </a>
        </div>

        <div className="mb-6 relative">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#222] text-[#E8E6E1] placeholder-gray-500 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#DDA956] border border-[#333]"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#222] border border-[#333] rounded-lg shadow-xl overflow-hidden z-50">
              {filteredSearch.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto">
                  {filteredSearch.map((item, idx) => (
                    <li key={idx} className="px-4 py-3 hover:bg-[#333] cursor-pointer transition-colors border-b border-[#333] last:border-0" onClick={() => { setSearchQuery(''); showToast(`Ouverture de: ${item.text}`); }}>
                      <div className="text-xs text-[#DDA956] font-medium mb-1 uppercase tracking-wider">{item.type}</div>
                      <div className="text-sm text-[#E8E6E1]">{item.text}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-sm text-gray-400 text-center">Aucun résultat</div>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<TrendingUp size={18} />} label="Vue d'ensemble" active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} />
          <NavItem icon={<CalendarCheck size={18} />} label="Réservations (CRM)" active={activeTab === 'reservations'} onClick={() => handleTabChange('reservations')} />
          <NavItem icon={<ConciergeBell size={18} />} label="Portail B2B Riads" active={activeTab === 'b2b'} onClick={() => handleTabChange('b2b')} />
          <NavItem icon={<MessageCircle size={18} />} label="WhatsApp & IA" active={activeTab === 'whatsapp'} onClick={() => handleTabChange('whatsapp')} />
          <NavItem icon={<UtensilsCrossed size={18} />} label="Menu Digital" active={activeTab === 'menu'} onClick={() => handleTabChange('menu')} />
          <NavItem icon={<ChefHat size={18} />} label="Production & Stocks Cuisine" active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} />
          <NavItem icon={<Users size={18} />} label="Staff & RH" active={activeTab === 'staff'} onClick={() => handleTabChange('staff')} />
          <NavItem icon={<Wallet size={18} />} label="Caisse (TacSystems)" active={activeTab === 'finance'} onClick={() => handleTabChange('finance')} />
          <NavItem icon={<Receipt size={18} />} label="Facturation & Compta" active={activeTab === 'accounting'} onClick={() => handleTabChange('accounting')} />
        </nav>

        <div className="mt-auto pt-8">
          <NavItem icon={<Settings size={18} />} label="Configuration" active={activeTab === 'config'} onClick={() => handleTabChange('config')} />
          <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-[#333]">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#DDA956] flex items-center justify-center text-[#1A1A1A] font-medium overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt={user.displayName || 'User'} /> : (user.displayName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium truncate max-w-[120px]">{user.displayName || user.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500 capitalize">{role || 'User'}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#333]">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button onClick={handleLogin} className="w-full flex items-center justify-center gap-2 bg-[#DDA956] text-[#1A1A1A] py-2 px-4 rounded-lg font-medium text-sm hover:bg-[#c4954b] transition-colors">
                <LogIn size={16} />
                <span>Connexion</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative bg-[#FDFBF7] min-h-screen">
        {renderContent()}
      </main>
    </div>
  );
}

function PerformanceAnalysis() {
  const occupancyData = [
    { name: 'Lun', taux: 45 },
    { name: 'Mar', taux: 52 },
    { name: 'Mer', taux: 60 },
    { name: 'Jeu', taux: 75 },
    { name: 'Ven', taux: 95 },
    { name: 'Sam', taux: 100 },
    { name: 'Dim', taux: 85 },
  ];

  const sourceData = [
    { name: 'TripAdvisor', value: 35 },
    { name: 'B2B (Riads)', value: 45 },
    { name: 'WhatsApp IA', value: 20 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Chart 1: Taux de Remplissage (AreaChart) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-serif font-semibold text-gray-900">Taux de Remplissage</h3>
            <p className="text-sm text-gray-500">7 derniers jours (%)</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTaux" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DDA956" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DDA956" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="taux" stroke="#DDA956" strokeWidth={3} fillOpacity={1} fill="url(#colorTaux)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Répartition des Sources (BarChart) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-serif font-semibold text-gray-900">Sources de Réservation</h3>
          <p className="text-sm text-gray-500">Répartition par canal</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151' }} interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" fill="#1A1A1A" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Overview({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { showToast } = useToast();
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  
  const handleExportExcel = () => {
    try {
      const metricsData = [
        ["Catégorie", "Métrique", "Valeur"],
        ["Aujourd'hui", "Daily Active Users", "324"],
        ["Aujourd'hui", "Average Order Value", "1,076 MAD"],
        ["Aujourd'hui", "Réservations", "42"],
        ["Aujourd'hui", "Chiffre d'Affaires Prévu", "45,200 MAD"],
        ["Performances CRM & B2B", "Clients Actifs (CRM)", "1,204"],
        ["Performances CRM & B2B", "Agences Partenaires", "15"],
        ["Occupation & Sources", "Taux de Remplissage", "85%"],
        ["Occupation & Sources", "Réservations Direct / Téléphone", "45%"],
        ["Occupation & Sources", "Réservations WhatsApp IA", "30%"],
        ["Occupation & Sources", "Réservations Portail B2B", "25%"]
      ];

      const ws = XLSX.utils.aoa_to_sheet(metricsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Résumé des Métriques");
      
      // Auto-size columns
      const colWidths = [{ wch: 25 }, { wch: 35 }, { wch: 15 }];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, "Mouda_Dashboard_Summary.xlsx");
      showToast("Export Excel réussi");
    } catch (error) {
      showToast("Erreur lors de l'export Excel");
      console.error(error);
    }
  };

  return (
    <>
      {/* Background Hero */}
      <div 
        className="absolute top-0 left-0 w-full h-[42rem] bg-cover bg-center z-0 print:hidden"
        style={{ backgroundImage: "url('/mouda 2.JPG')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FDFBF7]"></div>
      </div>

      <div className="relative z-10 p-8 md:p-12 pt-16 md:pt-20 print:hidden">
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-serif text-white font-semibold mb-2 drop-shadow-md">Tableau de Bord</h2>
            <p className="text-[#FDFBF7]/90 text-lg drop-shadow-sm">Vue consolidée des activités du restaurant et des intégrations.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <Download size={16} /> Exporter PDF
            </button>
            <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-green-800 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm border border-white/20">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Systèmes Opérationnels
            </span>
          </div>
        </header>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Daily Active Users" 
            value="324"
            subtitle="Utilisateurs uniques aujourd'hui"
            icon={<Users className="text-[#DDA956]" size={24} />}
            delay={0.1}
          />
          <DashboardCard 
            title="Average Order Value" 
            value="1,076 MAD"
            subtitle="Panier moyen par table"
            icon={<CreditCard className="text-[#DDA956]" size={24} />}
            delay={0.2}
          />
          <DashboardCard 
            title="Réservations du Jour" 
            value="42"
            subtitle="+12 via WhatsApp IA, 4 via Riads B2B"
            icon={<CalendarCheck className="text-[#DDA956]" size={24} />}
            delay={0.3}
          />
          <DashboardCard 
            title="Chiffre d'Affaires Prév." 
            value="45,200 MAD"
            subtitle="Basé sur les réservations du jour"
            icon={<Banknote className="text-[#DDA956]" size={24} />}
            delay={0.4}
          />
        </div>

        {/* Operations Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard 
            title="Point de Vente (POS)" 
            value="Actif"
            subtitle="Synchronisation des tables en temps réel"
            icon={<Store className="text-[#DDA956]" size={24} />}
            delay={0.3}
          />
          <DashboardCard 
            title="Clients Actifs (CRM)" 
            value="1,204"
            subtitle="Base Firestore synchronisée en temps réel"
            icon={<Users className="text-[#DDA956]" size={24} />}
            delay={0.4}
          />
          <DashboardCard 
            title="Commissions Riads" 
            value="3,450 MAD"
            subtitle="À régler pour le mois en cours"
            icon={<MapPin className="text-[#DDA956]" size={24} />}
            delay={0.5}
          />
        </div>

        <PerformanceAnalysis />

        {/* Social Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DashboardCard 
            title="Facebook (Abonnés)" 
            value="12.4K"
            subtitle="+24 cette semaine • Portée: 4.2K"
            icon={<Facebook className="text-[#DDA956]" size={24} />}
            delay={0.6}
          />
          <DashboardCard 
            title="Instagram (Abonnés)" 
            value="8.2K"
            subtitle="+52 cette semaine • Portée: 6.8K"
            icon={<Instagram className="text-[#DDA956]" size={24} />}
            delay={0.7}
          />
        </div>

        <InventoryAlerts />

        {/* Quick Operations Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => {
              setActiveTab('reservations');
              showToast('Ouverture du module Réservation...');
            }}
            className="bg-[#1A1A1A] hover:bg-[#222] text-white p-4 rounded-xl shadow-md border border-[#333] flex items-center gap-4 transition-all"
          >
            <div className="p-3 bg-[#DDA956]/20 text-[#DDA956] rounded-lg">
              <CalendarCheck size={20} />
            </div>
            <div className="text-left">
              <span className="block font-medium">Saisir Réservation</span>
              <span className="text-xs text-gray-400">Ajout manuel</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setActiveTab('inventory');
              showToast('Ouverture du module Inventaire...');
            }}
            className="bg-[#1A1A1A] hover:bg-[#222] text-white p-4 rounded-xl shadow-md border border-[#333] flex items-center gap-4 transition-all"
          >
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
              <ChefHat size={20} />
            </div>
            <div className="text-left">
              <span className="block font-medium">Entrée Stock</span>
              <span className="text-xs text-gray-400">Scanner fournisseur</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setActiveTab('whatsapp');
              showToast('Ouverture WhatsApp...');
            }}
            className="bg-[#1A1A1A] hover:bg-[#222] text-white p-4 rounded-xl shadow-md border border-[#333] flex items-center gap-4 transition-all"
          >
            <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
              <MessageCircle size={20} />
            </div>
            <div className="text-left">
              <span className="block font-medium">Broadcast WhatsApp</span>
              <span className="text-xs text-gray-400">Message aux clients VIP</span>
            </div>
          </button>
        </div>

        {/* Central Marketing Command */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <div className="lg:col-span-2 bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-medium text-[#1A1A1A]">Performance Marketing & ROI</h3>
              <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                <option>7 derniers jours</option>
                <option>Ce mois-ci</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Lun', spend: 300, revenu: 1200 },
                    { name: 'Mar', spend: 400, revenu: 1900 },
                    { name: 'Mer', spend: 350, revenu: 1500 },
                    { name: 'Jeu', spend: 500, revenu: 2200 },
                    { name: 'Ven', spend: 600, revenu: 3500 },
                    { name: 'Sam', spend: 800, revenu: 4800 },
                    { name: 'Dim', spend: 750, revenu: 4200 },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1A1A1A', fontWeight: 500 }}
                  />
                  <Legend />
                  <Bar yAxisId="left" name="Budget Ads (MAD)" dataKey="spend" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" name="Revenu Généré (MAD)" dataKey="revenu" fill="#DDA956" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <button 
              onClick={() => showToast('Lancement Nouvelle Campagne Meta...')}
              className="w-full bg-[#1A1A1A] hover:bg-[#222] text-white p-6 rounded-2xl shadow-xl border border-[#333] flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1"
            >
              <div className="p-3 bg-[#DDA956]/20 text-[#DDA956] rounded-full">
                <Megaphone size={28} />
              </div>
              <span className="font-serif text-lg tracking-wide font-medium">Nouvelle Campagne Ads</span>
              <span className="text-xs text-gray-400">Générer et cibler avec l'IA Meta</span>
            </button>

            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#333] shadow-xl flex-1 text-white">
              <h4 className="font-medium mb-6 flex items-center gap-2"><TrendingUp size={16} className="text-green-400"/> Retour sur Investissement</h4>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 font-medium">Facebook Ads</span>
                    <span className="font-bold text-green-400">x4.2 ROAS</span>
                  </div>
                  <div className="w-full bg-[#333] rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 font-medium">Instagram Ads</span>
                    <span className="font-bold text-green-400">x5.8 ROAS</span>
                  </div>
                  <div className="w-full bg-[#333] rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Architecture Focus Section */}
      <div className="mt-8 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-serif font-medium mb-6">État des Intégrations GCP & IA</h3>
        
        <div className="space-y-6">
          <IntegrationRow 
            name="Firestore NoSQL" 
            status="Connecté" 
            desc="Architecture de base de données (Users, Customers, Reservations, Inventory, Partners) avec règles de sécurité strictes déployées."
          />
          <IntegrationRow 
            name="Meta WhatsApp API & Vertex AI" 
            status="Connecté" 
            desc="Cloud Function 'whatsappWebhook' active. Routage automatisé des intentions et génération de réponses multilingues."
          />
          <IntegrationRow 
            name="Menu Digital & Traductions" 
            status="Connecté" 
            desc="Application Web synchronisée. Traductions IA générées en direct et servies depuis le cache Firestore."
          />
        </div>
      </div>

      <ReviewAnalyzer />
      </div>

      {/* Summary Modal for PDF Export */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:bg-white print:backdrop-blur-none print:inset-auto print:relative print:block">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col print:shadow-none print:max-w-full"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-[#DDA956]" size={24} />
                Résumé des Métriques
              </h3>
              <button onClick={() => setIsSummaryModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto print:block flex-1">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Aujourd'hui</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Daily Active Users</div>
                      <div className="text-2xl font-serif font-medium text-gray-900">324</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Average Order Value</div>
                      <div className="text-2xl font-serif font-medium text-gray-900">1,076 MAD</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Réservations</div>
                      <div className="text-2xl font-serif font-medium text-gray-900">42</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Chiffre d'Affaires Prévu</div>
                      <div className="text-2xl font-serif font-medium text-gray-900">45,200 MAD</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Performances CRM & B2B</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                      <span className="text-gray-700">Clients Actifs (CRM)</span>
                      <span className="font-medium">1,204</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                      <span className="text-gray-700">Agences Partenaires</span>
                      <span className="font-medium">15</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Occupation & Sources</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-sm text-gray-500 mb-2">Taux de Remplissage</div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-serif font-medium text-gray-900">85%</span>
                        <span className="text-sm text-green-600 font-medium mb-1">+5% vs hier</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#DDA956] h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-sm text-gray-500 mb-3">Sources de Réservation</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">Direct / Téléphone</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">WhatsApp IA</span>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">Portail B2B Riads</span>
                          <span className="font-medium">25%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3 print:hidden">
              <button 
                onClick={() => setIsSummaryModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 shadow-sm"
              >
                <FileSpreadsheet size={18} /> Exporter Excel
              </button>
              <button 
                onClick={() => {
                  showToast("Impression du résumé en cours...");
                  setTimeout(() => window.print(), 500);
                }}
                className="px-6 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download size={18} /> Imprimer / Exporter PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function Reservations() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNewResOpen, setIsNewResOpen] = useState(false);
  const [isAddWaitlistOpen, setIsAddWaitlistOpen] = useState(false);
  const [newWaitlistName, setNewWaitlistName] = useState('');
  const [newWaitlistPax, setNewWaitlistPax] = useState(2);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [selectedActionRes, setSelectedActionRes] = useState<any>(null);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isNoShowOpen, setIsNoShowOpen] = useState(false);

  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem('mouda_reservations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'RES-1029', name: 'Sophie Martin', date: 'Aujourd\'hui, 19:30', pax: 4, source: 'TripAdvisor', status: 'Confirmé', phone: '+33 6 12 34 56 78', tag: 'VIP', table: 'T3' },
      { id: 'RES-1030', name: 'Jean Dupont', date: 'Aujourd\'hui, 20:00', pax: 2, source: 'WhatsApp Bot', status: 'Confirmé', phone: '+212 6 00 00 00 00', tag: 'Nouveau', table: 'T1' },
      { id: 'RES-1031', name: 'Famille Dubois', date: 'Aujourd\'hui, 20:30', pax: 6, source: 'Site Web', status: 'En attente', phone: '+33 6 98 76 54 32', tag: 'Allergies', table: null },
    ];
  });

  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem('mouda_tables');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'T1', capacity: 2, status: 'occupied', x: 50, y: 80, type: 'round' },
      { id: 'T2', capacity: 2, status: 'available', x: 50, y: 220, type: 'round' },
      { id: 'T3', capacity: 4, status: 'reserved', x: 50, y: 360, type: 'square' },
      { id: 'T4', capacity: 4, status: 'available', x: 220, y: 80, type: 'square' },
      { id: 'T5', capacity: 6, status: 'available', x: 220, y: 220, type: 'rectangle' },
      { id: 'T6', capacity: 2, status: 'available', x: 220, y: 360, type: 'round' },
      { id: 'T7', capacity: 8, status: 'available', x: 420, y: 80, type: 'rectangle' },
      { id: 'T8', capacity: 4, status: 'available', x: 420, y: 220, type: 'square' },
      { id: 'T9', capacity: 4, status: 'occupied', x: 420, y: 360, type: 'square' },
      { id: 'T10', capacity: 2, status: 'available', x: 620, y: 80, type: 'round' },
      { id: 'T11', capacity: 6, status: 'reserved', x: 620, y: 220, type: 'rectangle' },
      { id: 'T12', capacity: 2, status: 'available', x: 620, y: 360, type: 'round' },
      { id: 'T13', capacity: 8, status: 'available', x: 820, y: 120, type: 'rectangle' },
      { id: 'T14', capacity: 4, status: 'available', x: 820, y: 280, type: 'square' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mouda_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('mouda_tables', JSON.stringify(tables));
  }, [tables]);

  const [waitlist, setWaitlist] = useState(() => {
    const saved = localStorage.getItem('mouda_waitlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing waitlist from localStorage", e);
      }
    }
    return [
      { id: 'WL-1', name: 'M. Karim', pax: 2, time: '10 min', status: 'waiting' },
      { id: 'WL-2', name: 'Mme. Yasmine', pax: 4, time: '25 min', status: 'waiting' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mouda_waitlist', JSON.stringify(waitlist));
  }, [waitlist]);

  const autoAssignTables = () => {
    let updatedTables = [...tables];
    let updatedReservations = reservations.map(res => {
      if (!res.table && res.status !== 'Annulé') {
        // Find best table
        const suitableTable = updatedTables.find(t => t.capacity >= res.pax && t.status === 'available');
        if (suitableTable) {
          suitableTable.status = 'reserved';
          return { ...res, table: suitableTable.id };
        }
      }
      return res;
    });
    setTables(updatedTables);
    setReservations(updatedReservations);
    showToast("Attribution automatique des tables effectuée avec succès.");
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const currentMonthName = monthNames[calendarDate.getMonth()];
  const currentYear = calendarDate.getFullYear();
  const daysInMonth = new Date(currentYear, calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, calendarDate.getMonth(), 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 0 for Monday

  const handlePrevMonth = () => setCalendarDate(new Date(currentYear, calendarDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCalendarDate(new Date(currentYear, calendarDate.getMonth() + 1, 1));
  const handleToday = () => setCalendarDate(new Date());

  const today = new Date();
  const isCurrentMonth = today.getMonth() === calendarDate.getMonth() && today.getFullYear() === currentYear;

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Réservations (CRM)</h2>
          <p className="text-gray-500">Gestion des réservations, historique client et synchronisation TripAdvisor.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <CalendarCheck size={16} />
            Vue Calendrier
          </button>
          <button 
            onClick={() => setIsNewResOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nouvelle Réservation
          </button>
        </div>
      </header>

      {/* TripAdvisor Integration Banner */}
      <div className="bg-[#00AA6C]/10 border border-[#00AA6C]/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48 text-[#00AA6C]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H8c-.55 0-1-.45-1-1s.45-1 1-1h3V8c0-.55.45-1 1-1s1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1z" />
          </svg>
        </div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#00AA6C]/30 flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="#00AA6C" className="w-8 h-8">
              <path d="M12 2C6.47 2 2 6.47 2 12c0 2.21.73 4.25 1.95 5.89L2.5 21.5l3.6-1.45A9.973 9.973 0 0012 22c5.53 0 10-4.47 10-10S17.53 2 12 2zm4.18 14.62c-.17.35-.91.68-1.3.72-.34.04-.84.09-2.31-.39-1.78-.58-2.92-1.76-3.79-2.74-.86-.97-1.43-2.02-1.42-3.15 0-1.12.58-1.68.8-1.92.21-.24.47-.29.62-.29.15 0 .31.01.44.01.14 0 .33-.05.51.37.19.44.63 1.54.68 1.66.05.11.08.24.01.38-.07.15-.11.24-.22.37-.11.13-.23.27-.33.38-.11.12-.23.24-.11.45.12.21.53.88 1.14 1.42.78.69 1.43.91 1.63 1.01.21.11.33.09.46-.05.12-.15.54-.62.68-.84.15-.22.29-.18.49-.11.21.07 1.3.61 1.52.72.22.11.36.17.42.27.05.11.05.61-.12.96z" />
            </svg>
          </div>
          <div>
            <h3 className="font-serif font-medium text-[#1A1A1A] text-lg flex items-center gap-2">
              Synchronisation TripAdvisor Active
              <span className="px-2 py-0.5 bg-[#00AA6C] text-white text-[10px] uppercase font-bold tracking-wider rounded-sm">Connecté</span>
            </h3>
            <p className="text-gray-600 text-sm mt-0.5">Note moyenne : 4.8/5 (243 avis) • Réservations LaFourchette/TripAdvisor synchronisées en temps réel.</p>
          </div>
        </div>
        <div className="flex gap-2 relative z-10">
          <a 
            href="https://www.tripadvisor.fr/Search?q=Mouda+Palace+Fes" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white text-[#1A1A1A] rounded-lg font-medium text-sm hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Voir la page
          </a>
          <button 
            onClick={() => showToast('Synchronisation TripAdvisor... (Simulation)')}
            className="p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm"
            title="Synchroniser"
          >
            <Loader2 size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] flex overflow-x-auto hide-scrollbar p-2 gap-2">
          {['upcoming', 'floorplan', 'waitlist', 'history', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab ? 'bg-[#DDA956]/20 text-[#DDA956]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              {tab === 'upcoming' && 'À venir (3)'}
              {tab === 'floorplan' && 'Plan de Salle'}
              {tab === 'waitlist' && 'Liste d\'attente'}
              {tab === 'history' && 'Historique'}
              {tab === 'reviews' && 'Avis & CRM'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-0">
          {activeTab === 'upcoming' && (
            <div className="divide-y divide-gray-100">
              {reservations.map((res, i) => (
                <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${res.source === 'TripAdvisor' ? 'bg-[#00AA6C]/10 border-[#00AA6C]/20 text-[#00AA6C]' : res.source === 'WhatsApp Bot' ? 'bg-green-100 border-green-200 text-green-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                      {res.source === 'TripAdvisor' ? <Star size={20} /> : res.source === 'WhatsApp Bot' ? <MessageCircle size={20} /> : <Globe size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{res.name}</h4>
                        {res.tag && (
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${res.tag === 'VIP' ? 'bg-[#DDA956]/20 text-[#DDA956]' : res.tag === 'Allergies' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {res.tag}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><Clock size={14} /> {res.date}</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {res.pax} pax</span>
                        {res.table && (
                          <span className="flex items-center gap-1 text-[#DDA956] font-medium bg-[#DDA956]/10 px-2 py-0.5 rounded-md">
                            Table {res.table}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Smartphone size={12} /> {res.phone} • Source: <span className="font-medium text-gray-600">{res.source}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {res.status === 'En attente' ? (
                      <>
                        <button 
                          onClick={() => showToast(`Réservation ${res.id} confirmée`)}
                          className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          Confirmer
                        </button>
                        <button 
                          onClick={() => showToast(`Réservation ${res.id} refusée`)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          Refuser
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium flex items-center gap-1">
                        <CheckCircle size={16} /> {res.status}
                      </span>
                    )}
                    <div className="flex items-center gap-1 ml-2 border-l border-gray-200 pl-3">
                      <button 
                        onClick={() => {
                          setSelectedActionRes(res);
                          setIsSendConfirmOpen(true);
                        }}
                        title="Confirmation SMS / WhatsApp / Email"
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      >
                        <Send size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedActionRes(res);
                          setIsPaymentOpen(true);
                        }}
                        title="Paiement Acompte"
                        className="p-2 text-gray-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
                      >
                        <CreditCard size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedActionRes(res);
                          setIsNoShowOpen(true);
                        }}
                        title="Marquer No-show"
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <UserX size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'floorplan' && (
             <div className="p-8 bg-[#FDFBF7]">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div>
                   <h3 className="text-xl font-serif font-medium text-gray-900 mb-1">Plan de Salle Interactif</h3>
                   <p className="text-sm text-gray-500">Gérez les tables et les affectations en temps réel.</p>
                 </div>
                 <button onClick={autoAssignTables} className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm flex items-center gap-2">
                   <Wand2 size={16} /> Attribution Auto
                 </button>
               </div>
               
               <div className="relative w-full h-[500px] bg-white border border-gray-200 rounded-2xl overflow-auto shadow-sm">
                 <div className="sticky top-4 left-4 inline-flex gap-4 text-xs font-medium bg-white/95 p-2.5 rounded-xl shadow-sm border border-gray-100 z-20 backdrop-blur-sm m-4">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Disponible</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Réservée</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Occupée</div>
                 </div>

                 <div className="relative w-[1000px] h-[500px]">
                   {/* Rendering tables */}
                   {tables.map(table => (
                     <div 
                       key={table.id}
                       className={`absolute flex flex-col items-center justify-center font-bold text-sm shadow-sm transition-all cursor-pointer hover:ring-2 hover:ring-[#DDA956]/80
                         ${table.type === 'round' ? 'rounded-full w-20 h-20' : table.type === 'square' ? 'rounded-xl w-20 h-20' : 'rounded-xl w-32 h-20'}
                         ${table.status === 'available' ? 'bg-green-50 border border-green-200 text-green-700' : table.status === 'reserved' ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-red-50 border border-red-200 text-red-700'}
                       `}
                       style={{ left: table.x, top: table.y }}
                       onClick={() => showToast(`Table ${table.id} (${table.capacity} pax) - ${table.status === 'available' ? 'Disponible' : table.status === 'reserved' ? 'Réservée' : 'Occupée'}`)}
                     >
                       <span className="text-lg mb-0.5">{table.id}</span>
                       <div className="text-[10px] font-medium opacity-80">{table.capacity} pax</div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          )}
          {activeTab === 'waitlist' && (
             <div className="p-8 bg-[#FDFBF7]">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div>
                   <h3 className="text-xl font-serif font-medium text-gray-900 mb-1">Liste d'attente</h3>
                   <p className="text-sm text-gray-500">Gérez les clients en attente d'une table.</p>
                 </div>
                 <button onClick={() => setIsAddWaitlistOpen(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
                   <Plus size={16} /> Ajouter à la liste
                 </button>
               </div>
               
               {waitlist.length === 0 ? (
                 <div className="text-center text-gray-500 py-12 border border-dashed border-gray-200 bg-white rounded-2xl">
                   Aucun client en attente.
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {waitlist.map(item => (
                     <div key={item.id} className="flex flex-col p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-4">
                         <div>
                           <span className="font-semibold text-gray-900 block text-lg">{item.name}</span>
                           <span className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Users size={14} /> {item.pax} personnes</span>
                         </div>
                         <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-medium border border-amber-100 flex items-center gap-1">
                           <Clock size={12} /> {item.time}
                         </span>
                       </div>
                       <button 
                         onClick={() => {
                           setWaitlist(waitlist.filter(w => w.id !== item.id));
                           showToast(`Table attribuée à ${item.name}`);
                         }}
                         className="w-full mt-auto py-2.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors rounded-xl text-sm font-medium flex justify-center items-center gap-2"
                       >
                         <CheckCircle size={16} /> Attribuer une table
                       </button>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}
          {activeTab === 'history' && (
             <div className="p-12 text-center text-gray-500">
               Historique des réservations passées.
             </div>
          )}

          {activeTab === 'reviews' && (
             <div className="p-8">
               <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2"><Star size={18} className="text-[#DDA956]" /> Derniers avis TripAdvisor</h4>
               <div className="space-y-4">
                 {[1,2].map(i => (
                    <div key={i} className="p-5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">Client TripAdvisor {i}</span>
                          <span className="text-gray-400 text-xs">• Il y a 2 jours</span>
                        </div>
                        <div className="flex gap-0.5 text-[#00AA6C]">
                          <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">"Excellente expérience, cadre magnifique et tajines délicieux. Service impeccable via la réservation en ligne."</p>
                      <button onClick={() => showToast && showToast('Action en cours de développement...')}  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <MessageSquare size={14} /> Répondre publiquement
                      </button>
                    </div>
                 ))}
               </div>
             </div>
          )}
        </div>
      </div>

      {/* Calendar View Modal */}
      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Calendrier des Réservations</h3>
              <button onClick={() => setIsCalendarOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            {/* Calendar View */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-medium text-gray-900 capitalize">{currentMonthName} {currentYear}</h4>
                <div className="flex gap-2">
                  <button onClick={handlePrevMonth} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Précédent</button>
                  <button onClick={handleToday} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Aujourd'hui</button>
                  <button onClick={handleNextMonth} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Suivant</button>
                </div>
              </div>
              <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-100 last:border-0">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-fr">
                {Array.from({ length: 42 }).map((_, i) => {
                  const day = i - startOffset + 1;
                  const isValidDay = day > 0 && day <= daysInMonth;
                  const isTodayHighlight = isCurrentMonth && day === today.getDate();
                  const hasReservation = isValidDay && [13, 15, 18, 22].includes(day);

                  return (
                    <div key={i} className={`min-h-[100px] p-2 border-r border-b border-gray-100 ${!isValidDay ? 'bg-gray-50/50' : 'bg-white'}`}>
                      {isValidDay && (
                        <>
                          <div className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isTodayHighlight ? 'bg-[#DDA956] text-white' : 'text-gray-700'}`}>
                            {day}
                          </div>
                          {hasReservation && (
                            <div 
                              onClick={() => showToast(`${day === 13 ? '3 réservations' : '1 réservation'} pour le ${day} ${currentMonthName}`)}
                              className="bg-blue-50 border border-blue-100 text-blue-700 text-xs p-1.5 rounded-md truncate cursor-pointer hover:bg-blue-100 transition-colors"
                            >
                              {day === 13 ? '3 Réservations' : '1 Réservation'}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {isNewResOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouvelle Réservation</h3>
              <button onClick={() => setIsNewResOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: M. Dubois" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input type="time" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personnes (Pax)</label>
                  <input type="number" defaultValue={2} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="+212..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source / Canal</label>
                <select className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                  <option>Téléphone</option>
                  <option>Passage (Walk-in)</option>
                  <option>WhatsApp / Instagram</option>
                  <option>Site Web</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Tags spéciaux</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none" placeholder="Allergies, anniversaire..."></textarea>
              </div>
              <button 
                onClick={() => {
                  showToast("Réservation ajoutée avec succès");
                  setIsNewResOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Confirmer la réservation
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddWaitlistOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-serif text-xl font-medium text-gray-900">Ajouter à la liste d'attente</h3>
              <button onClick={() => setIsAddWaitlistOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input 
                  type="text" 
                  value={newWaitlistName}
                  onChange={(e) => setNewWaitlistName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DDA956]/50 focus:border-[#DDA956] outline-none transition-all"
                  placeholder="Ex: M. Martin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de personnes</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNewWaitlistPax(Math.max(1, newWaitlistPax - 1))} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">-</button>
                  <span className="w-12 text-center font-medium">{newWaitlistPax}</span>
                  <button onClick={() => setNewWaitlistPax(newWaitlistPax + 1)} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">+</button>
                </div>
              </div>
              <button 
                onClick={() => {
                  if(newWaitlistName) {
                    setWaitlist([...waitlist, {
                      id: `WL-${Date.now().toString().slice(-4)}`,
                      name: newWaitlistName,
                      pax: newWaitlistPax,
                      time: '0 min',
                      status: 'waiting'
                    }]);
                    showToast(`${newWaitlistName} ajouté à la liste d'attente`);
                    setNewWaitlistName('');
                    setNewWaitlistPax(2);
                    setIsAddWaitlistOpen(false);
                  } else {
                    showToast('Veuillez entrer un nom');
                  }
                }}
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {isSendConfirmOpen && selectedActionRes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-serif text-xl font-medium text-gray-900">Envoyer une confirmation</h3>
              <button onClick={() => setIsSendConfirmOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">Choisissez le canal pour envoyer la confirmation à <span className="font-semibold text-gray-900">{selectedActionRes.name}</span>.</p>
              <div className="space-y-3">
                <button 
                  onClick={() => { showToast(`SMS envoyé à ${selectedActionRes.phone}`); setIsSendConfirmOpen(false); }}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><MessageSquare size={20} /></div>
                  <div>
                    <div className="font-medium text-gray-900">SMS</div>
                    <div className="text-sm text-gray-500">{selectedActionRes.phone}</div>
                  </div>
                </button>
                <button 
                  onClick={() => { showToast(`WhatsApp envoyé à ${selectedActionRes.phone}`); setIsSendConfirmOpen(false); }}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors text-left"
                >
                  <div className="bg-green-100 text-green-600 p-2 rounded-lg"><MessageCircle size={20} /></div>
                  <div>
                    <div className="font-medium text-gray-900">WhatsApp</div>
                    <div className="text-sm text-gray-500">{selectedActionRes.phone}</div>
                  </div>
                </button>
                <button 
                  onClick={() => { showToast(`Email envoyé avec succès`); setIsSendConfirmOpen(false); }}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                >
                  <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><Mail size={20} /></div>
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-sm text-gray-500">Envoyer sur l'adresse enregistrée</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPaymentOpen && selectedActionRes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-serif text-xl font-medium text-gray-900">Demande d'acompte</h3>
              <button onClick={() => setIsPaymentOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Générez un lien de paiement pour valider la réservation de <span className="font-semibold">{selectedActionRes.name}</span>.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant de l'acompte (MAD)</label>
                <input 
                  type="number" 
                  defaultValue={200 * selectedActionRes.pax}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DDA956]/50 focus:border-[#DDA956] outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Suggestion basée sur {selectedActionRes.pax} pax x 200 MAD</p>
              </div>
              <button 
                onClick={() => {
                  showToast(`Lien de paiement envoyé par SMS à ${selectedActionRes.phone}`);
                  setIsPaymentOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={18} /> Générer et envoyer le lien
              </button>
            </div>
          </div>
        </div>
      )}

      {isNoShowOpen && selectedActionRes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX size={32} />
              </div>
              <h3 className="font-serif text-xl font-medium text-gray-900 mb-2">Marquer comme No-show ?</h3>
              <p className="text-sm text-gray-500 mb-6">Êtes-vous sûr de vouloir marquer <span className="font-semibold text-gray-900">{selectedActionRes.name}</span> comme no-show ? Cette action affectera leur score de fiabilité.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsNoShowOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    const updated = reservations.map(r => r.id === selectedActionRes.id ? { ...r, status: 'No-show' } : r);
                    setReservations(updated);
                    showToast(`${selectedActionRes.name} marqué comme no-show`);
                    setIsNoShowOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function B2BPortal() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('partners');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerType, setNewPartnerType] = useState('Riad');
  const [newPartnerCommission, setNewPartnerCommission] = useState<number>(5);
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [newPartnerAccessCode, setNewPartnerAccessCode] = useState('');

  const [partners, setPartners] = useState(() => {
    const saved = localStorage.getItem('mouda_partners');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing partners from localStorage", e);
      }
    }
    return [
      { id: 'P-001', name: 'Riad Al Andalous', type: 'Riad', commission: 5, revenue: '12 500 MAD', active: true, clients: 45 },
      { id: 'P-002', name: 'Atlas Voyages', type: 'Agence', commission: 5, revenue: '34 200 MAD', active: true, clients: 120 },
      { id: 'P-003', name: 'LocaCar Marrakech', type: 'Location Auto', commission: 5, revenue: '4 800 MAD', active: true, clients: 15 },
      { id: 'P-004', name: 'Hôtel La Medina', type: 'Hôtel', commission: 5, revenue: '8 900 MAD', active: false, clients: 32 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mouda_partners', JSON.stringify(partners));
  }, [partners]);

  const getIconForType = (type: string) => {
    switch(type) {
      case 'Riad': return <Building size={20} />;
      case 'Hôtel': return <Building size={20} />;
      case 'Agence': return <Briefcase size={20} />;
      case 'Location Auto': return <Car size={20} />;
      default: return <Users size={20} />;
    }
  };

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Portail B2B & Partenaires</h2>
          <p className="text-gray-500">Gérez vos partenariats avec les Riads, Agences et loueurs, et suivez vos commissions.</p>
        </div>
        <button 
          onClick={() => setIsAddPartnerModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm"
        >
          <Plus size={16} />
          Ajouter un Partenaire
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-500">Total Partenaires</h4>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Share2 size={18} /></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{partners.length}</h3>
          <p className="text-xs text-green-600 mt-2 font-medium">+3 ce mois</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-500">Chiffre d'Affaires B2B</h4>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={18} /></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">245k <span className="text-sm font-normal text-gray-500">MAD</span></h3>
          <p className="text-xs text-green-600 mt-2 font-medium">+12% vs mois dernier</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-500">Clients Apportés</h4>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={18} /></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">890</h3>
          <p className="text-xs text-gray-500 mt-2 font-medium">Depuis le début de l'année</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-500">Commissions Dues</h4>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Banknote size={18} /></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">14.5k <span className="text-sm font-normal text-gray-500">MAD</span></h3>
          <p className="text-xs text-amber-600 mt-2 font-medium">À régler ce mois-ci</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] flex overflow-x-auto hide-scrollbar p-2 gap-2">
          {['partners', 'commissions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab ? 'bg-[#DDA956]/20 text-[#DDA956]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              {tab === 'partners' && 'Liste des Partenaires'}
              {tab === 'commissions' && 'Commissions & Versements'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-0">
          {activeTab === 'partners' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Partenaire</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Commission</th>
                    <th className="px-6 py-4">Clients</th>
                    <th className="px-6 py-4">CA Généré</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partners.map(partner => (
                    <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${partner.active ? 'bg-[#DDA956]/10 text-[#DDA956]' : 'bg-gray-100 text-gray-400'}`}>
                            {getIconForType(partner.type)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 block">{partner.name}</span>
                            <span className={`text-xs ${partner.active ? 'text-green-600' : 'text-gray-400'}`}>
                              {partner.active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{partner.type}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium text-xs">
                          <Percent size={12} /> {partner.commission}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{partner.clients} couverts</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{partner.revenue}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedPartner(partner);
                              setIsQRModalOpen(true);
                            }}
                            className="p-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 border border-gray-200 shadow-sm"
                            title="Générer QR Code Partenaire"
                          >
                            <QrCode size={16} />
                            <span className="sr-only">QR Code</span>
                          </button>
                          <button onClick={() => showToast && showToast('Action en cours de développement...')}  
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                            title="Paramètres Partenaire"
                          >
                            <Settings size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="p-0">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-medium text-gray-900">Historique des Versements</h3>
                <button onClick={() => showToast('Génération du rapport...')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                  <Download size={16} /> Exporter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Partenaire</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Montant</th>
                      <th className="px-6 py-4">Méthode</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: 'Riad Aladina', date: '01 Juil 2026', amount: '1,200 MAD', method: 'Virement bancaire', status: 'Payé' },
                      { name: 'Voyage Maroc', date: '28 Juin 2026', amount: '4,500 MAD', method: 'Espèces', status: 'Payé' }
                    ].map((tx, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{tx.name}</td>
                        <td className="px-6 py-4 text-gray-600">{tx.date}</td>
                        <td className="px-6 py-4 font-medium text-[#DDA956]">{tx.amount}</td>
                        <td className="px-6 py-4 text-gray-600">{tx.method}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Partner Modal */}
      {isQRModalOpen && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md text-center max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-xl font-serif font-semibold">QR Code Partenaire</h3>
              <button onClick={() => setIsQRModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium text-[#1A1A1A]">{selectedPartner.name}</h4>
              <p className="text-sm text-gray-500">ID de suivi : {selectedPartner.id}</p>
            </div>

            <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100 flex flex-col items-center justify-center mb-4 md:mb-6 flex-shrink-0">
              <QrCode className="text-gray-800 w-32 h-32 md:w-44 md:h-44" />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left flex-shrink-0">
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm text-blue-900 font-medium">Que contient ce QR Code ?</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Lorsqu'un client de <strong>{selectedPartner.name}</strong> scanne ce code, il est dirigé vers :
                  </p>
                  <ul className="text-xs text-blue-800 mt-2 list-disc list-inside space-y-1">
                    <li>Le menu digital & formulaire de réservation</li>
                    <li>L'itinéraire GPS exact vers Mouda Palace</li>
                    <li>Le tag de commission ({selectedPartner.commission}%) est appliqué automatiquement</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 flex-shrink-0 mt-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>QR Code - ${selectedPartner.name}</title>
                            <style>
                              body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; background: #fff; }
                              .print-container { max-width: 800px; padding: 40px; }
                              h1 { font-size: 3rem; margin-bottom: 0.5rem; color: #1A1A1A; }
                              p.subtitle { font-size: 1.5rem; color: #666; margin-bottom: 3rem; }
                              .qr-wrapper { display: inline-block; padding: 2rem; border: 4px solid #1A1A1A; border-radius: 2rem; margin-bottom: 3rem; }
                              .qr-placeholder { width: 400px; height: 400px; background-image: url('https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://moudapalace.com/reserve/${selectedPartner.id}'); background-size: cover; background-position: center; }
                              .controls { margin-top: 2rem; }
                              button { padding: 15px 30px; font-size: 1.2rem; cursor: pointer; background: #DDA956; color: #1A1A1A; border: none; border-radius: 8px; font-weight: bold; margin: 0 10px; }
                              button.secondary { background: #1A1A1A; color: #fff; }
                              @media print { .controls { display: none !important; } }
                            </style>
                          </head>
                          <body>
                            <div class="print-container">
                              <h1>MOUDA PALACE</h1>
                              <p class="subtitle">Scannez pour découvrir notre Menu & GPS<br/><br/><strong>${selectedPartner.name}</strong></p>
                              <div class="qr-wrapper">
                                <div class="qr-placeholder"></div>
                              </div>
                              <div class="controls">
                                <button onClick={() => showToast && showToast('Action en cours de développement...')}  onclick="window.print()">Imprimer (A5 / Poster)</button>
                                <button onClick={() => showToast && showToast('Action en cours de développement...')}  class="secondary" onclick="window.close()">Fermer</button>
                              </div>
                            </div>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                    showToast("Page d'impression HD ouverte dans un nouvel onglet");
                    setIsQRModalOpen(false);
                  }}
                  className="flex-1 bg-[#1A1A1A] text-[#DDA956] py-2.5 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Ouvrir HD / Imprimer
                </button>
                <button 
                  onClick={() => {
                    showToast("Téléchargement du kit QR partenaire...");
                    setIsQRModalOpen(false);
                  }}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Kit ZIP
                </button>
              </div>
              <button 
                onClick={() => {
                  showToast(`Scan détecté : Client redirigé vers Menu & GPS. Commission de ${selectedPartner.commission}% en attente d'encaissement.`);
                  setIsQRModalOpen(false);
                }}
                className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2.5 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone size={18} />
                Simuler un scan client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {isAddPartnerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouveau Partenaire</h3>
              <button onClick={() => setIsAddPartnerModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'établissement / agence</label>
                <input 
                  type="text" 
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" 
                  placeholder="Ex: Riad Dar Salam" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de partenaire</label>
                  <select 
                    value={newPartnerType} 
                    onChange={(e) => setNewPartnerType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]"
                  >
                    <option value="Riad">Riad</option>
                    <option value="Hôtel">Hôtel</option>
                    <option value="Agence">Agence</option>
                    <option value="Location Auto">Location Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
                  <input 
                    type="number" 
                    value={newPartnerCommission}
                    onChange={(e) => setNewPartnerCommission(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                  <input 
                    type="email" 
                    value={newPartnerEmail}
                    onChange={(e) => setNewPartnerEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" 
                    placeholder="contact@riad.com" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code d'accès (Secret)</label>
                  <input 
                    type="text" 
                    value={newPartnerAccessCode}
                    onChange={(e) => setNewPartnerAccessCode(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" 
                    placeholder="Ex: RIAD2026" 
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!newPartnerAccessCode) {
                    showToast("Veuillez définir un code d'accès pour ce partenaire.", "error");
                    return;
                  }
                  
                  const newPartner = {
                    id: `P-00${partners.length + 1}`,
                    name: newPartnerName || 'Nouveau Partenaire',
                    type: newPartnerType,
                    commission: newPartnerCommission,
                    revenue: '0 MAD',
                    active: true,
                    clients: 0,
                    accessCode: newPartnerAccessCode,
                    email: newPartnerEmail
                  };
                  
                  setPartners([...partners, newPartner]);
                  showToast("Partenaire ajouté. QR Code généré et prêt à l'emploi.");
                  setIsAddPartnerModalOpen(false);
                  setSelectedPartner(newPartner);
                  setIsQRModalOpen(true);
                  
                  setNewPartnerName('');
                  setNewPartnerType('Riad');
                  setNewPartnerCommission(5);
                  setNewPartnerEmail('');
                  setNewPartnerAccessCode('');
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Ajouter et générer le QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

let savedPrompt = `Tu es l'assistant virtuel du restaurant gastronomique Mouda Palace à Fès. \nTon ton doit être élégant, chaleureux et professionnel.\nTu peux répondre aux questions sur le menu, les horaires, l'adresse et l'emplacement du restaurant, prendre des réservations et fournir le site web du restaurant : www.moudapalace.com, ainsi que le menu digital. \nSi une demande est complexe, propose au client d'être contacté par un humain.`;

function WhatsAppAI() {
  const { showToast } = useToast();
  const [isBotActive, setIsBotActive] = useState(true);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [prompt, setPrompt] = useState(savedPrompt);

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10">
        <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">WhatsApp & IA</h2>
        <p className="text-gray-500">Configuration du bot WhatsApp et paramètres de l'IA.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-serif font-semibold text-gray-900">État du Bot</h3>
                <p className="text-sm text-gray-500">Activer ou désactiver les réponses automatiques IA.</p>
              </div>
              <button 
                onClick={() => {
                  setIsBotActive(!isBotActive);
                  showToast(isBotActive ? "Bot WhatsApp désactivé" : "Bot WhatsApp activé");
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isBotActive ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isBotActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <MessageCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Numéro connecté</h4>
                  <p className="text-sm text-gray-500">+212 6 00 00 00 00</p>
                </div>
                <button onClick={() => showToast && showToast('Action en cours de développement...')}  className="ml-auto px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Déconnecter
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-1">Comportement de l'IA (Prompt Système)</h3>
            <p className="text-sm text-gray-500 mb-6">Définissez comment le bot doit s'adresser aux clients.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions principales</label>
                <textarea 
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#DDA956] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Langue par défaut</label>
                  <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#DDA956]">
                    <option>Français (par défaut)</option>
                    <option>Anglais</option>
                    <option>Arabe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Délai de réponse (secondes)</label>
                  <input type="number" defaultValue={2} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              
              <button onClick={() => {
                savedPrompt = prompt;
                showToast("Paramètres IA enregistrés");
              }} className="mt-4 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-lg text-sm font-medium hover:bg-[#333] transition-colors">
                Enregistrer les paramètres
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-4">Statistiques du Bot</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Conversations actives</div>
                <div className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                  12
                  <TrendingUp className="text-green-500" size={20} />
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Réservations générées (Ce mois)</div>
                <div className="text-2xl font-bold text-gray-900">45</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Taux de résolution IA</div>
                <div className="text-2xl font-bold text-gray-900">85%</div>
                <div className="text-xs text-gray-400 mt-1">15% transférés à un humain</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <BookOpen size={20} />
              </div>
              <h4 className="font-medium text-blue-900">Base de Connaissances</h4>
            </div>
            <p className="text-sm text-blue-800 mb-4">
              L'IA utilise le menu digital et les informations du restaurant (adresse, horaires) pour répondre aux clients.
            </p>
            <button onClick={() => setIsKnowledgeBaseOpen(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Gérer les informations <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Knowledge Base Modal */}
      {isKnowledgeBaseOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Base de Connaissances (IA)</h3>
              <button onClick={() => setIsKnowledgeBaseOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 mb-4">
                Ces informations sont utilisées par l'assistant IA pour répondre aux questions fréquentes des clients sur WhatsApp, Instagram, etc.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du restaurant</label>
                <input type="text" defaultValue="Mouda Palace" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
                <textarea rows={2} defaultValue="Derb El Hammam, Medina, Fès, Maroc" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horaires (Ouverture)</label>
                  <input type="time" defaultValue="12:00" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horaires (Fermeture)</label>
                  <input type="time" defaultValue="23:30" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Indications d'accès (Parking, repères)</label>
                <textarea rows={3} defaultValue="Parking sécurisé à Bab Boujloud (à 5min à pied). Le restaurant est situé juste derrière la fontaine bleue." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Informations supplémentaires</label>
                <textarea rows={3} defaultValue="- Option végétarienne et vegan disponibles.\n- Animation musicale (Luth/Oud) tous les vendredis et samedis soirs.\n- Accessible aux fauteuils roulants au rez-de-chaussée uniquement." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none" />
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => setIsKnowledgeBaseOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button onClick={() => {
                  showToast("Base de connaissances mise à jour avec succès.");
                  setIsKnowledgeBaseOpen(false);
                }} className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg font-medium hover:bg-[#333] transition-colors">
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DigitalMenu() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('Entrées');
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<any>(null);
  const [newDishForm, setNewDishForm] = useState({ name: '', category: 'Entrées', price: '', desc: '' });
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [displayLanguage, setDisplayLanguage] = useState('fr');

  const categories = ['Entrées', 'Plats Principaux', 'Desserts', 'Boissons'];
  
  const [menuItems, setMenuItems] = useState([
    { id: 1, category: 'Entrées', name: 'Briouates au Fromage', price: '85 MAD', desc: 'Feuilletés croustillants farcis au fromage de chèvre et herbes fraîches.', active: true, translated: true, translations: { en: { name: 'Cheese Briouates', desc: 'Crispy pastries stuffed with goat cheese and fresh herbs.' }, es: { name: 'Briouates de Queso', desc: 'Pasteles crujientes rellenos de queso de cabra y hierbas frescas.' }, ar: { name: 'بريوات بالجبن', desc: 'معجنات مقرمشة محشوة بجبن الماعز والأعشاب الطازجة.' } } },
    { id: 2, category: 'Entrées', name: 'Salade Zaalouk', price: '75 MAD', desc: 'Caviar d\'aubergines grillées à la tomate, ail et épices.', active: true, translated: true, translations: { en: { name: 'Zaalouk Salad', desc: 'Grilled eggplant caviar with tomato, garlic, and spices.' }, es: { name: 'Ensalada Zaalouk', desc: 'Caviar de berenjenas asadas con tomate, ajo y especias.' }, ar: { name: 'سلطة زعلوك', desc: 'كافيار الباذنجان المشوي مع الطماطم والثوم والتوابل.' } } },
    { id: 3, category: 'Plats Principaux', name: 'Tagine d\'Agneau aux Pruneaux', price: '220 MAD', desc: 'Agneau mijoté aux épices douces, pruneaux caramélisés et amandes.', active: true, translated: true, translations: { en: { name: 'Lamb Tagine with Prunes', desc: 'Lamb simmered with sweet spices, caramelized prunes, and almonds.' }, es: { name: 'Tajín de Cordero con Ciruelas', desc: 'Cordero a fuego lento con especias dulces, ciruelas caramelizadas y almendras.' }, ar: { name: 'طاجين اللحم بالبرقوق', desc: 'لحم ضأن مطبوخ ببطء مع توابل حلوة، برقوق مكرمل ولوز.' } } },
    { id: 4, category: 'Plats Principaux', name: 'Pastilla au Pigeon', price: '240 MAD', desc: 'Tourte sucrée-salée aux amandes, cannelle et fleur d\'oranger.', active: false, translated: false },
    { id: 5, category: 'Desserts', name: 'Orange à la Cannelle', price: '50 MAD', desc: 'Tranches d\'orange fraîche, cannelle moulue et sirop de fleur d\'oranger.', active: true, translated: true, translations: { en: { name: 'Cinnamon Orange', desc: 'Fresh orange slices, ground cinnamon, and orange blossom syrup.' }, es: { name: 'Naranja a la Canela', desc: 'Rodajas de naranja fresca, canela molida y sirope de azahar.' }, ar: { name: 'برتقال بالقرفة', desc: 'شرائح برتقال طازجة، قرفة مطحونة وشراب زهر البرتقال.' } } },
    { id: 6, category: 'Boissons', name: 'Thé à la Menthe Royal', price: '40 MAD', desc: 'Thé vert traditionnel infusé à la menthe fraîche et pignons de pin.', active: true, translated: true, translations: { en: { name: 'Royal Mint Tea', desc: 'Traditional green tea infused with fresh mint and pine nuts.' }, es: { name: 'Té de Menta Real', desc: 'Té verde tradicional infundido con menta fresca y piñones.' }, ar: { name: 'شاي ملكي بالنعناع', desc: 'شاي أخضر تقليدي منقوع بالنعناع الطازج وحبوب الصنوبر.' } } }
  ]);

  const handleTranslate = async () => {
    const untranslatedItems = menuItems.filter(item => !item.translated);
    
    if (untranslatedItems.length === 0) {
      showToast('Tous les plats sont déjà traduits.');
      return;
    }

    setIsTranslating(true);
    showToast('Traduction du menu en cours avec Vertex AI...');
    
    try {
      const response = await fetch('/api/translate-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: untranslatedItems })
      });
      
      if (!response.ok) throw new Error('Translation failed');
      
      const translationsResult = await response.json();
      
      setMenuItems(prevItems => prevItems.map(item => {
        const transResult = translationsResult.find((t: any) => t.id === item.id);
        if (transResult) {
          return {
            ...item,
            translated: true,
            translations: transResult.translations
          };
        }
        return item;
      }));
      
      showToast('Traduction terminée avec succès !');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de la traduction.');
    } finally {
      setIsTranslating(false);
    }
  };

  const openAddModal = () => {
    setEditingDish(null);
    setNewDishForm({ name: '', category: activeCategory, price: '', desc: '' });
    setIsAddDishModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingDish(item);
    setNewDishForm({ 
      name: item.name, 
      category: item.category, 
      price: item.price.replace(' MAD', ''), 
      desc: item.desc 
    });
    setIsAddDishModalOpen(true);
  };

  const handleSaveDish = () => {
    if (!newDishForm.name || !newDishForm.price) {
      showToast("Veuillez remplir les champs obligatoires");
      return;
    }
    
    if (editingDish) {
      setMenuItems(items => items.map(item => item.id === editingDish.id ? {
        ...item,
        name: newDishForm.name,
        category: newDishForm.category,
        price: `${newDishForm.price} MAD`,
        desc: newDishForm.desc,
        translated: false
      } : item));
      showToast("Plat modifié avec succès (Traduction requise)");
    } else {
      const newItem = {
        id: Date.now(),
        name: newDishForm.name,
        category: newDishForm.category,
        price: `${newDishForm.price} MAD`,
        desc: newDishForm.desc,
        active: true,
        translated: false
      };
      setMenuItems(items => [...items, newItem]);
      showToast("Plat ajouté avec succès (Traduction requise)");
    }
    setIsAddDishModalOpen(false);
  };

  const handleDeleteDish = (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce plat ?")) {
      setMenuItems(items => items.filter(item => item.id !== id));
      showToast("Plat supprimé avec succès");
    }
  };

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Menu Digital</h2>
          <p className="text-gray-500">Gestion des plats, prix, et traductions automatiques.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <QrCode size={16} />
            Imprimer QR Code
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Ajouter un plat
          </button>
        </div>
      </header>

      {/* AI Translation Banner */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 text-white">
          <div className="p-3 bg-[#DDA956]/20 text-[#DDA956] rounded-xl">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="font-medium text-lg">Traductions IA Multilingues</h3>
            <p className="text-[#E8E6E1]/70 text-sm">Traduisez automatiquement votre menu en 8 langues avec Vertex AI.</p>
          </div>
        </div>
        <button 
          onClick={handleTranslate}
          disabled={isTranslating}
          className={`whitespace-nowrap px-5 py-2.5 bg-white text-[#1A1A1A] rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2 ${isTranslating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isTranslating ? <Loader2 size={16} className="text-[#DDA956] animate-spin" /> : <Sparkles size={16} className="text-[#DDA956]" />}
          {isTranslating ? 'Traduction en cours...' : 'Traduire les plats non traduits'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Categories Tab and Language Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-[#1A1A1A] to-[#333] p-2 gap-4">
          <div className="flex overflow-x-auto hide-scrollbar p-2 gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeCategory === category ? 'bg-[#DDA956]/20 text-[#DDA956]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="px-4 flex items-center gap-2">
            <Globe size={16} className="text-gray-400" />
            <select 
              value={displayLanguage}
              onChange={(e) => setDisplayLanguage(e.target.value)}
              className="text-sm border-none bg-transparent text-white font-medium focus:ring-0 cursor-pointer"
            >
              <option value="fr">Français (FR)</option>
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
              <option value="ar">العربية (AR)</option>
            </select>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="divide-y divide-gray-100">
          {filteredItems.map(item => {
            // @ts-ignore - dynamic properties
            const currentTranslation = displayLanguage !== 'fr' && item.translations ? item.translations[displayLanguage] : null;
            const displayName = currentTranslation?.name || item.name;
            const displayDesc = currentTranslation?.desc || item.desc;
            
            return (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <UtensilsCrossed className="text-gray-400" size={24} />
                </div>
                <div className={displayLanguage === 'ar' ? 'text-right w-full' : ''} dir={displayLanguage === 'ar' ? 'rtl' : 'ltr'}>
                  <div className={`flex items-center gap-3 mb-1 ${displayLanguage === 'ar' ? 'justify-start flex-row-reverse' : ''}`}>
                    <h4 className="font-medium text-gray-900">{displayName}</h4>
                    {!item.active && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium flex items-center gap-1">
                        <EyeOff size={12} /> Masqué
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 max-w-2xl">{displayDesc}</p>
                  
                  <div className={`flex items-center gap-4 mt-3 ${displayLanguage === 'ar' ? 'justify-start flex-row-reverse' : ''}`}>
                    <span className="font-semibold text-[#1A1A1A]">{item.price}</span>
                    <div className="w-px h-4 bg-gray-200"></div>
                    {item.translated ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Globe size={12} /> Traduit (FR, EN, ES, AR)
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle size={12} /> Traduction requise
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setMenuItems(items => items.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
                    showToast(`Visibilité de ${item.name} modifiée`);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  title={item.active ? "Masquer" : "Afficher"}
                >
                  {item.active ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button 
                  onClick={() => openEditModal(item)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  title="Modifier"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteDish(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Aucun plat dans cette catégorie.
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {isQRModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Menu Digital QR</h3>
              <button onClick={() => setIsQRModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center justify-center mb-6">
              <QrCode size={160} className="text-gray-800" />
              <p className="mt-4 text-sm text-gray-500 font-medium">Scannez pour voir le menu</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  showToast("Lancement de l'impression...");
                  setIsQRModalOpen(false);
                }}
                className="flex-1 bg-[#1A1A1A] text-white py-2.5 rounded-lg font-medium hover:bg-[#333] transition-colors"
              >
                Imprimer
              </button>
              <button 
                onClick={() => setIsQRModalOpen(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Dish Modal */}
      {isAddDishModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">{editingDish ? 'Modifier Plat' : 'Nouveau Plat'}</h3>
              <button onClick={() => setIsAddDishModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                <input 
                  type="text" 
                  value={newDishForm.name}
                  onChange={(e) => setNewDishForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" 
                  placeholder="Ex: Pastilla au Poulet" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select 
                    value={newDishForm.category}
                    onChange={(e) => setNewDishForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
                  <input 
                    type="number" 
                    value={newDishForm.price}
                    onChange={(e) => setNewDishForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" 
                    placeholder="0" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (FR)</label>
                <textarea 
                  rows={3} 
                  value={newDishForm.desc}
                  onChange={(e) => setNewDishForm(prev => ({ ...prev, desc: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none" 
                  placeholder="Description du plat..."
                ></textarea>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="p-2 bg-[#DDA956]/20 text-[#DDA956] rounded-md">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Traduction IA Automatique</p>
                  <p className="text-xs text-gray-500">Le titre et la description seront traduits en EN, ES, AR après l'enregistrement.</p>
                </div>
              </div>
              <button 
                onClick={handleSaveDish}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                {editingDish ? 'Enregistrer et Traduire' : 'Ajouter et Traduire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Inventory() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('stocks');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isAutoCreateModalOpen, setIsAutoCreateModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [txType, setTxType] = useState<'in' | 'out'>('in');
  
  const [productionTasks, setProductionTasks] = useState([
    { item: "Fonds de volaille", qty: "10 L", progress: 100, status: "Terminé", priority: "Basse" },
    { item: "Légumes taillés (Brunoise)", qty: "5 kg", progress: 60, status: "En cours", priority: "Moyenne" },
    { item: "Pâte à Pastilla", qty: "40 feuilles", progress: 0, status: "À faire", priority: "Haute" }
  ]);

  const stockItems = [
    { id: 'INV-001', name: 'Safran de Taliouine', category: 'Épices', supplier: 'Coopérative Taliouine', quantity: 250, unit: 'g', minStock: 100 },
    { id: 'INV-002', name: 'Huile d\'Olive Vierge Extra', category: 'Épicerie', supplier: 'Ferme Atlas', quantity: 15, unit: 'L', minStock: 20 },
    { id: 'INV-003', name: 'Viande d\'Agneau (Épaule)', category: 'Viandes', supplier: 'Boucherie Médina', quantity: 45, unit: 'kg', minStock: 20 },
    { id: 'INV-004', name: 'Menthe Fraîche', category: 'Herbes', supplier: 'Marché Central', quantity: 2, unit: 'kg', minStock: 5 },
    { id: 'INV-005', name: 'Amandes Émondées', category: 'Fruits Secs', supplier: 'Grossiste Fès', quantity: 12, unit: 'kg', minStock: 10 }
  ].map(item => ({ ...item, status: calculateStockStatus(item.quantity, item.minStock) }));

  const recentTransactions = [
    { id: 'TX-1209', type: 'out', item: 'Menthe Fraîche', amount: 0.5, unit: 'kg', reason: 'Service Thé du Soir (Cuisine)', date: 'Aujourd\'hui, 17:30', user: 'Chef Hassan' },
    { id: 'TX-1208', type: 'in', item: 'Viande d\'Agneau (Épaule)', amount: 20, unit: 'kg', reason: 'Livraison Hebdomadaire', date: 'Aujourd\'hui, 09:15', user: 'Réception' },
    { id: 'TX-1207', type: 'out', item: 'Huile d\'Olive Vierge Extra', amount: 2, unit: 'L', reason: 'Préparation Tagines (Cuisine)', date: 'Hier, 11:00', user: 'Chef Hassan' }
  ];

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Production Cuisine & Stocks</h2>
          <p className="text-gray-500">Fiches techniques, food cost, production journalière et inventaires automatiques.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => showToast('Inventaire automatique en cours...')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Wand2 size={16} />
            Auto-Inventaire IA
          </button>
          <button 
            onClick={() => setIsScannerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <QrCode size={16} />
            Scanner Bon de Livraison
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Ajouter un produit
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-gray-50 text-gray-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Références</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">142</h4>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alertes Stock Bas</p>
            <h4 className="text-2xl font-bold text-red-600 mt-1">12</h4>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Commandes Fournisseur en cours</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">3</h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] flex overflow-x-auto hide-scrollbar p-2 gap-2">
          {['stocks', 'recipes', 'production', 'waste', 'transactions', 'suppliers'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab ? 'bg-[#DDA956]/20 text-[#DDA956]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              {tab === 'stocks' && 'Inventaires Actuels'}
              {tab === 'recipes' && 'Fiches Techniques & Marges'}
              {tab === 'production' && 'Production Journalière'}
              {tab === 'waste' && 'Pertes & Gaspillage'}
              {tab === 'transactions' && 'Entrées & Sorties'}
              {tab === 'suppliers' && 'Fournisseurs'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-0">
          {activeTab === 'stocks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Produit</th>
                    <th className="px-6 py-4">Catégorie</th>
                    <th className="px-6 py-4">Fournisseur</th>
                    <th className="px-6 py-4">Quantité</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stockItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${item.status === 'ok' ? 'bg-green-500' : item.status === 'alert' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 text-gray-500">{item.supplier}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`font-semibold ${item.status === 'critical' ? 'text-red-600' : item.status === 'alert' ? 'text-amber-600' : 'text-gray-900'}`}>
                            {item.quantity} {item.unit}
                          </span>
                          <span className="text-xs text-gray-400">Min: {item.minStock} {item.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedProduct(item);
                              setTxType('out');
                              setIsTxModalOpen(true);
                            }}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                            title="Sortie (Consommation)"
                          >
                            <ArrowUpFromLine size={16} />
                            <span className="sr-only">Sortie</span>
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProduct(item);
                              setTxType('in');
                              setIsTxModalOpen(true);
                            }}
                            className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1"
                            title="Entrée (Achat)"
                          >
                            <ArrowDownToLine size={16} />
                            <span className="sr-only">Entrée</span>
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsSettingsModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                            title="Historique & Paramètres"
                          >
                            <Settings size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'recipes' && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Fiches Techniques & Food Cost</h3>
                <button 
                  onClick={() => setIsNewRecipeModalOpen(true)}
                  className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Nouvelle Fiche
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  { name: "Tagine d'Agneau aux Amandes", cost: 45, price: 180, margin: 75, category: "Plat Principal" },
                  { name: "Pastilla au Pigeon", cost: 38, price: 150, margin: 74, category: "Entrée" },
                  { name: "Salade Marocaine", cost: 12, price: 65, margin: 81, category: "Entrée" }
                ].map((recipe, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{recipe.name}</h4>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">{recipe.category}</span>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Food Cost (Coût Matière)</span>
                          <span className="font-medium text-red-600">{recipe.cost} MAD</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Prix de Vente</span>
                          <span className="font-medium text-gray-900">{recipe.price} MAD</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Marge brute</span>
                      <span className="text-sm font-bold text-green-600">{recipe.margin}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Plan de Production Journalier</h3>
                <button 
                  onClick={() => {
                    showToast("Plan de production généré avec succès d'après 45 pax aujourd'hui");
                    setProductionTasks([
                      ...productionTasks,
                      { item: "Tagines d'Agneau (Précuisson)", qty: "20 portions", progress: 0, status: "À faire", priority: "Haute" },
                      { item: "Salades Marocaines", qty: "15 portions", progress: 0, status: "À faire", priority: "Moyenne" },
                      { item: "Pigeons (Désossage)", qty: "10 pièces", progress: 0, status: "À faire", priority: "Basse" }
                    ]);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <ClipboardList size={16} /> Générer depuis Réservations
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-4">Article à préparer</th>
                      <th className="px-6 py-4">Quantité Requise</th>
                      <th className="px-6 py-4">Priorité</th>
                      <th className="px-6 py-4">Progression</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productionTasks.map((task, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{task.item}</td>
                        <td className="px-6 py-4 text-gray-500">{task.qty}</td>
                        <td className="px-6 py-4">
                          <select 
                            value={task.priority}
                            onChange={(e) => {
                              const newTasks = [...productionTasks];
                              newTasks[idx].priority = e.target.value;
                              setProductionTasks(newTasks);
                            }}
                            className={`border rounded-lg text-sm p-1.5 focus:outline-none focus:ring-1 focus:ring-[#DDA956] ${
                              task.priority === 'Haute' ? 'bg-red-50 text-red-700 border-red-200' : 
                              task.priority === 'Moyenne' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                              'bg-green-50 text-green-700 border-green-200'
                            }`}
                          >
                            <option value="Basse">Basse</option>
                            <option value="Moyenne">Moyenne</option>
                            <option value="Haute">Haute</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 w-48">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full ${task.progress === 100 ? 'bg-green-500' : task.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${task.status === 'Terminé' ? 'bg-green-50 text-green-700' : task.status === 'En cours' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'waste' && (
             <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Déclarations de Pertes & Gaspillage</h3>
                <button onClick={() => showToast && showToast('Action en cours de développement...')}  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2">
                  <TrendingDown size={16} /> Déclarer une perte
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-5 border border-red-100 bg-red-50/30 rounded-xl">
                  <p className="text-sm text-red-600 font-medium mb-1">Coût total des pertes (Ce mois)</p>
                  <p className="text-2xl font-bold text-red-700">1 450 MAD</p>
                </div>
                <div className="p-5 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500 font-medium mb-1">Article le plus gaspillé</p>
                  <p className="text-lg font-bold text-gray-900">Menthe Fraîche (350 MAD)</p>
                </div>
                <div className="p-5 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500 font-medium mb-1">Ratio de perte moyen</p>
                  <p className="text-lg font-bold text-gray-900">2.4% <span className="text-sm font-normal text-green-600 ml-1">↓ 0.5%</span></p>
                </div>
              </div>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {[
                  { date: "Hier, 22:30", item: "Menthe Fraîche", qty: "0.5 kg", reason: "Oxydée", cost: "15 MAD", user: "Chef Hassan" },
                  { date: "15 Juil, 14:00", item: "Tomates", qty: "2 kg", reason: "Abîmées à la livraison", cost: "30 MAD", user: "Réception" }
                ].map((waste, idx) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center bg-white hover:bg-gray-50 gap-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{waste.item} <span className="text-gray-500 font-normal">({waste.qty})</span></h4>
                      <p className="text-sm text-gray-500 mt-1">Cause : {waste.reason} • {waste.date}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-medium text-red-600">-{waste.cost}</p>
                      <p className="text-xs text-gray-400 mt-1">{waste.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="divide-y divide-gray-100">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.type === 'in' ? <ArrowDownToLine size={20} /> : <ArrowUpFromLine size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{tx.item}</h4>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${tx.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.type === 'in' ? '+ Entrée' : '- Sortie'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{tx.reason}</p>
                      <div className="text-xs text-gray-400 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock size={12} /> {tx.date}</span>
                        <span className="flex items-center gap-1"><Users size={12} /> {tx.user}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'in' ? '+' : '-'}{tx.amount} {tx.unit}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Réf: {tx.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Annuaire Fournisseurs</h3>
                <div className="flex gap-2">
                  <button onClick={() => setIsNewOrderModalOpen(true)}  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Truck size={16} /> Nouvelle Commande
                  </button>
                  <button onClick={() => setIsNewSupplierModalOpen(true)}  className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors flex items-center gap-2">
                    <Plus size={16} /> Nouveau Fournisseur
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Pending Orders Summary / List */}
                <div className="lg:col-span-1 border border-gray-200 rounded-xl bg-gray-50/50 p-5">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart size={18} className="text-[#DDA956]" /> Commandes en cours
                  </h4>
                  <div className="space-y-3">
                    {[
                      { id: "CMD-401", supplier: "Ferme Atlas", status: "En route", amount: "1 200 MAD", date: "Aujourd'hui" },
                      { id: "CMD-402", supplier: "Coopérative Taliouine", status: "Validée", amount: "3 400 MAD", date: "Demain" }
                    ].map((order, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm text-gray-900">{order.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === 'En route' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{order.supplier}</div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-400">Prévu: {order.date}</span>
                          <span className="text-sm font-semibold text-gray-900">{order.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suppliers List */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                        <tr>
                          <th className="px-6 py-4">Fournisseur</th>
                          <th className="px-6 py-4">Catégorie</th>
                          <th className="px-6 py-4">Contact</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          { name: "Coopérative Taliouine", category: "Épices & Condiments", contact: "Fatima Zahra", phone: "+212 661 234 567", email: "contact@taliouine-safran.ma", city: "Taliouine" },
                          { name: "Ferme Atlas", category: "Légumes & Huiles", contact: "Karim Benali", phone: "+212 662 345 678", email: "commandes@ferme-atlas.ma", city: "Marrakech" },
                          { name: "Boucherie Médina", category: "Viandes", contact: "Hassan", phone: "+212 663 456 789", email: "hassan.boucher@gmail.com", city: "Marrakech" },
                          { name: "Grossiste Fès", category: "Fruits Secs", contact: "Omar", phone: "+212 664 567 890", email: "grossiste.fes@menara.ma", city: "Fès" }
                        ].map((supplier, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{supplier.name}</div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <MapPin size={12} /> {supplier.city}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs">
                                {supplier.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900">{supplier.contact}</div>
                              <div className="flex flex-col gap-1 mt-1">
                                <a href={`tel:${supplier.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#DDA956] transition-colors">
                                  <Phone size={12} /> {supplier.phone}
                                </a>
                                <a href={`mailto:${supplier.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#DDA956] transition-colors">
                                  <Mail size={12} /> {supplier.email}
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => showToast && showToast('Action en cours de développement...')}  className="p-2 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-amber-50">
                                <Settings size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scanner Modal */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Scanner Bon de Livraison</h3>
              <button onClick={() => setIsScannerModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="w-full aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <QrCode size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">Placez le QR Code ou le code barre ici</p>
                <p className="text-xs mt-1">La caméra va scanner automatiquement</p>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#DDA956] shadow-[0_0_8px_#DDA956] animate-scan"></div>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button 
                  onClick={() => {
                    showToast("Simulation : Code scanné avec succès");
                    setIsScannerModalOpen(false);
                    setIsTxModalOpen(true);
                    setSelectedProduct(stockItems[0]); // Simulate picking a product
                    setTxType('in');
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Simuler scan (Produit Existant)
                </button>
                <button 
                  onClick={() => {
                    showToast("IA: Extraction des données du nouveau produit...");
                    setIsScannerModalOpen(false);
                    setIsAutoCreateModalOpen(true);
                  }}
                  className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} className="text-[#DDA956]" />
                  Simuler scan (Nouveau Produit)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto Create Product from Scan Modal */}
      {isAutoCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Création Automatique</h3>
              <button onClick={() => setIsAutoCreateModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="text-blue-500 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-blue-900 font-medium">Produit non reconnu dans l'inventaire.</p>
                  <p className="text-xs text-blue-700 mt-1">L'IA a extrait les informations du bon de livraison pour créer la fiche produit automatiquement.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Nom du produit détecté</label>
                <div className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">Cœur d'Artichaut Extra</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Catégorie</label>
                  <div className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">Légumes</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Unité</label>
                  <div className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">kg</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Quantité Livrée</label>
                  <div className="font-medium text-gray-900 bg-green-50 p-3 rounded-lg border border-green-100 text-green-700">+ 15 kg</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Fournisseur</label>
                  <div className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">Coop Fès Primeurs</div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte suggéré (Min. Stock)</label>
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={5} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                  <span className="text-gray-500 text-sm">kg</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  showToast("Nouveau produit créé et entrée en stock enregistrée avec succès.");
                  setIsAutoCreateModalOpen(false);
                }}
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Valider la création automatique
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Recipe Modal */}
      {isNewRecipeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouvelle Fiche Technique</h3>
              <button onClick={() => setIsNewRecipeModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                  <input type="text" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Tagine de poulet" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]">
                    <option>Entrée</option>
                    <option>Plat Principal</option>
                    <option>Dessert</option>
                    <option>Boisson</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Ingrédients (Nécessite connexion à l'inventaire)</h4>
                  <button onClick={() => showToast && showToast('Action en cours de développement...')}  className="text-sm text-[#DDA956] hover:text-[#c4954b] font-medium">+ Ajouter ingrédient</button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-500">
                  Sélectionnez des articles de l'inventaire pour calculer le coût matière automatiquement.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix de vente estimé (MAD)</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 150" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marge cible (%)</label>
                  <input type="number" defaultValue={70} className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => {
                    showToast("Nouvelle fiche technique créée avec succès");
                    setIsNewRecipeModalOpen(false);
                  }}
                  className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
                >
                  Enregistrer la Fiche
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouveau Produit</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Miel pur" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option>Épices</option>
                    <option>Épicerie</option>
                    <option>Viandes</option>
                    <option>Fruits Secs</option>
                    <option>Herbes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option>kg</option>
                    <option>g</option>
                    <option>L</option>
                    <option>unité</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => {
                  showToast("Produit ajouté avec succès");
                  setIsAddModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Ajouter à l'inventaire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {isTxModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">
                {txType === 'in' ? 'Entrée de Stock' : 'Sortie de Stock'}
              </h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Produit</p>
              <p className="font-medium text-gray-900">{selectedProduct.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Stock actuel: {selectedProduct.quantity} {selectedProduct.unit}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité ({selectedProduct.unit})</label>
                <input type="number" min="0" step="0.1" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raison / Commentaire</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder={txType === 'in' ? "Ex: Achat du jour" : "Ex: Service Cuisine"} />
              </div>
              <button 
                onClick={() => {
                  showToast(`Transaction enregistrée pour ${selectedProduct.name}`);
                  setIsTxModalOpen(false);
                }}
                className={`w-full py-3 rounded-xl font-medium mt-4 text-white transition-colors ${txType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Valider {txType === 'in' ? "l'entrée" : "la sortie"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Paramètres Produit</h3>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <p className="font-medium text-gray-900">{selectedProduct.name}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte (Min. Stock)</label>
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={selectedProduct.minStock} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                  <span className="text-gray-500 text-sm">{selectedProduct.unit}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur Préféré</label>
                <input type="text" defaultValue={selectedProduct.supplier} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                onClick={() => {
                  showToast(`Paramètres mis à jour pour ${selectedProduct.name}`);
                  setIsSettingsModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Commande */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsNewOrderModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Nouvelle Commande</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                  <option>Coopérative Taliouine</option>
                  <option>Ferme Atlas</option>
                  <option>Boucherie Centrale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison prévue</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Articles</label>
                <textarea rows={3} placeholder="Ex: Safran 500g, Huile d'olive 20L..." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none"></textarea>
              </div>
              <button 
                onClick={() => {
                  showToast("Commande envoyée avec succès");
                  setIsNewOrderModalOpen(false);
                }}
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Valider la Commande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouveau Fournisseur */}
      {isNewSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsNewSupplierModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Nouveau Fournisseur</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input type="text" placeholder="Ex: Grossiste Bio Plus" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <input type="text" placeholder="Ex: Fruits & Légumes" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Email ou Téléphone)</label>
                <input type="text" placeholder="Ex: contact@bioplus.ma" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                onClick={() => {
                  showToast("Fournisseur ajouté avec succès");
                  setIsNewSupplierModalOpen(false);
                }}
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Ajouter le Fournisseur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffHR() {
  const [activeTab, setActiveTab] = useState('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const initialStaff = [
    { id: 'EMP-01', name: 'Ahmed Benali', role: 'Chef de Cuisine', department: 'Cuisine', phone: '+212 6 00 11 22 33', status: 'Actif', shift: 'Soir' },
    { id: 'EMP-02', name: 'Karima Idrissi', role: 'Maître d\'Hôtel', department: 'Salle', phone: '+212 6 00 11 22 34', status: 'Actif', shift: 'Matin' },
    { id: 'EMP-03', name: 'Youssef Tazi', role: 'Serveur', department: 'Salle', phone: '+212 6 00 11 22 35', status: 'En congé', shift: '-' },
    { id: 'EMP-04', name: 'Sofia Amrani', role: 'Réceptionniste', department: 'Accueil', phone: '+212 6 00 11 22 36', status: 'Actif', shift: 'Soir' },
  ];

  const [staffData, setStaffData] = useState(initialStaff);
  
  const [leavesList, setLeavesList] = useState([
    { id: 1, name: "Sofia Amrani", type: "Congé Annuel", dates: "12 Août - 26 Août", status: "En attente" },
    { id: 2, name: "Karima Idrissi", type: "Maladie", dates: "Aujourd'hui", status: "Approuvé" }
  ]);
  
  const [evaluationsList, setEvaluationsList] = useState([
    { id: 1, name: "Ahmed Benali", role: "Chef de Cuisine", score: "4.8/5", date: "Juin 2026", next: "Déc 2026" },
    { id: 2, name: "Karima Idrissi", role: "Maître d'Hôtel", score: "4.9/5", date: "Jan 2026", next: "Juil 2026" },
    { id: 3, name: "Sofia Amrani", role: "Réceptionniste", score: "4.5/5", date: "Fév 2026", next: "Août 2026" }
  ]);

  const [trainingSessions, setTrainingSessions] = useState([
    { id: 1, title: "Hygiène et Sécurité Alimentaire (HACCP)", date: "15 Juillet 2026", participants: 8, status: "Planifié", trainer: "Expert Externe" },
    { id: 2, title: "Standards de Service Salle", date: "02 Juin 2026", participants: 12, status: "Complété", trainer: "Karima Idrissi" },
    { id: 3, title: "Introduction aux Vins Locaux", date: "10 Août 2026", participants: 5, status: "Planifié", trainer: "Sommelier Invité" }
  ]);

  const [rolesList, setRolesList] = useState([
    { id: 1, role: "Administrateur", users: 2, access: "Accès total à tous les modules" },
    { id: 2, role: "Manager", users: 3, access: "Accès à la gestion des stocks, personnel et réservations. Pas d'accès financier." },
    { id: 3, role: "Cuisine", users: 5, access: "Accès aux commandes, recettes et plan de production." },
    { id: 4, role: "Réception", users: 4, access: "Accès aux réservations et annuaire client." }
  ]);

  const [scheduleData, setScheduleData] = useState([
    { id: 1, name: "Ahmed Benali", mon: "15:00 - 23:30", tue: "15:00 - 23:30", wed: "15:00 - 23:30", thu: "15:00 - 23:30", fri: "15:00 - 23:30", sat: "Repos", sun: "Repos" },
    { id: 2, name: "Karima Idrissi", mon: "08:00 - 16:30", tue: "08:00 - 16:30", wed: "08:00 - 16:30", thu: "08:00 - 16:30", fri: "Repos", sat: "Repos", sun: "08:00 - 16:30" },
    { id: 3, name: "Youssef Tazi", mon: "Repos", tue: "Repos", wed: "15:00 - 23:30", thu: "15:00 - 23:30", fri: "15:00 - 23:30", sat: "15:00 - 23:30", sun: "15:00 - 23:30" },
  ]);

  const [attendanceList, setAttendanceList] = useState([
    { id: 1, name: "Ahmed Benali", in: "08:15", out: "-", status: "En poste" },
    { id: 2, name: "Karima Idrissi", in: "08:30", out: "-", status: "En poste" },
    { id: 3, name: "Youssef Tazi", in: "-", out: "-", status: "Absent" }
  ]);

  const [payrollList, setPayrollList] = useState([
    { id: 1, period: "Juin 2026", name: "Ahmed Benali", net: "12 500 MAD", status: "Payé" },
    { id: 2, period: "Juin 2026", name: "Karima Idrissi", net: "8 200 MAD", status: "Payé" },
    { id: 3, period: "Juin 2026", name: "Sofia Amrani", net: "5 500 MAD", status: "Payé" }
  ]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  
  const [isLeaveBalanceModalOpen, setIsLeaveBalanceModalOpen] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<{empId: number, dayKey: string, current: string} | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  
  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDept, setFilterDept] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');

  const handleSaveStaff = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newStaff = {
      id: editingStaff?.id || `EMP-${Date.now().toString().slice(-4)}`,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      phone: formData.get('phone') as string,
      status: formData.get('status') as string,
      shift: formData.get('shift') as string || '-',
    };

    if (editingStaff) {
      setStaffData(prev => prev.map(s => s.id === editingStaff.id ? newStaff : s));
      showToast("Employé mis à jour avec succès");
    } else {
      setStaffData(prev => [...prev, newStaff]);
      showToast("Employé ajouté avec succès");
    }
    
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleDeleteStaff = (id: string) => {
    setStaffData(prev => prev.filter(s => s.id !== id));
    showToast("Employé supprimé");
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const filteredStaff = staffData.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'Tous' || s.department === filterDept;
    const matchesStatus = filterStatus === 'Tous' || s.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Staff & RH</h2>
          <p className="text-gray-500">Gestion du personnel, plannings et accès.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setEditingStaff(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Ajouter un employé
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Employés" value={staffData.length.toString()} subtitle={`${staffData.filter(s => s.status === 'En congé').length} en congé`} icon={<Users size={20} />} />
        <DashboardCard title="En service (Actuel)" value={staffData.filter(s => s.status === 'Actif').length.toString()} subtitle="Employés actifs" icon={<CheckCircle size={20} />} />
        <DashboardCard title="Heures sup. (Mois)" value="45h" subtitle="+12% vs le mois dernier" icon={<Clock size={20} />} />
        <DashboardCard title="Prochains congés" value="5" subtitle="Dans les 7 prochains jours" icon={<CalendarCheck size={20} />} />
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] rounded-2xl shadow-xl flex overflow-x-auto hide-scrollbar p-2 gap-2 mb-6">
        {[
          { id: 'directory', label: 'Annuaire' },
          { id: 'attendance', label: 'Pointage' },
          { id: 'planning', label: 'Horaires & Planning' },
          { id: 'leaves', label: 'Congés & Absences' },
          { id: 'evaluations', label: 'Évaluations' },
          { id: 'training', label: 'Formations' },
          { id: 'payroll', label: 'Fiches de Paie' },
          { id: 'roles', label: 'Droits & Accès' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab.id ? 'bg-[#DDA956]/20 text-[#DDA956]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'directory' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-50/50 gap-4">
            <div className="relative flex-1 md:w-64 md:flex-none">
              <input 
                type="text" 
                placeholder="Rechercher un employé..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors ${isFilterOpen ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Filter size={14} />
                Filtres
                {(filterDept !== 'Tous' || filterStatus !== 'Tous') && (
                  <span className="w-2 h-2 rounded-full bg-[#DDA956] ml-1"></span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-20">
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Département</label>
                    <select 
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#DDA956]"
                    >
                      <option value="Tous">Tous les départements</option>
                      <option value="Cuisine">Cuisine</option>
                      <option value="Salle">Salle</option>
                      <option value="Accueil">Accueil</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Statut</label>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#DDA956]"
                    >
                      <option value="Tous">Tous les statuts</option>
                      <option value="Actif">Actif</option>
                      <option value="En congé">En congé</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                    <button 
                      onClick={() => {
                        setFilterDept('Tous');
                        setFilterStatus('Tous');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Employé</th>
                  <th className="px-6 py-4">Département</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Service Actuel</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map(staff => (
                    <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#DDA956]/20 text-[#DDA956] flex items-center justify-center font-bold text-xs uppercase">
                            {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{staff.name}</div>
                            <div className="text-xs text-gray-500">{staff.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {staff.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {staff.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                          staff.status === 'Actif' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Actif' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                          {staff.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {staff.shift}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingStaff(staff);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucun employé ne correspond à votre recherche ou à vos filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Planning Hebdomadaire</h3>
            <button 
              onClick={() => showToast("Publication du planning...")}
              className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
            >
              <CheckCircle size={16} /> Publier Planning
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Employé</th>
                  <th className="px-6 py-4">Lun 13</th>
                  <th className="px-6 py-4">Mar 14</th>
                  <th className="px-6 py-4">Mer 15</th>
                  <th className="px-6 py-4">Jeu 16</th>
                  <th className="px-6 py-4">Ven 17</th>
                  <th className="px-6 py-4">Sam 18</th>
                  <th className="px-6 py-4">Dim 19</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scheduleData.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{schedule.name}</td>
                    {[
                      { key: 'mon', val: schedule.mon },
                      { key: 'tue', val: schedule.tue },
                      { key: 'wed', val: schedule.wed },
                      { key: 'thu', val: schedule.thu },
                      { key: 'fri', val: schedule.fri },
                      { key: 'sat', val: schedule.sat },
                      { key: 'sun', val: schedule.sun }
                    ].map((shift, j) => (
                      <td key={j} className="px-6 py-4">
                        <button 
                          onClick={() => {
                            setEditingShift({ empId: schedule.id, dayKey: shift.key, current: shift.val });
                            setIsShiftModalOpen(true);
                          }}
                          className={`px-2 py-1 text-xs rounded-md w-full text-center hover:opacity-80 transition-opacity ${shift.val === 'Repos' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700 font-medium border border-blue-100'}`}
                        >
                          {shift.val}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Pointage du jour</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAttendanceModalOpen(true)}
                className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-black transition-colors"
              >
                <Plus size={16} /> Saisir Pointage
              </button>
              <button 
                onClick={() => showToast("Exportation des pointages du jour...")}
                className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
              >
                <Timer size={16} /> Exporter Pointages
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Employé</th>
                  <th className="px-6 py-4">Heure d'arrivée</th>
                  <th className="px-6 py-4">Heure de départ</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceList.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{att.name}</td>
                    <td className="px-6 py-4">{att.in}</td>
                    <td className="px-6 py-4">{att.out}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${att.status === 'En poste' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Demandes de congés & Absences</h3>
            <div className="space-y-4">
              {leavesList.map((leave) => (
                <div key={leave.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900">{leave.name}</h4>
                    <p className="text-sm text-gray-500">{leave.type} • {leave.dates}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      leave.status === 'Approuvé' ? 'bg-green-100 text-green-700' : 
                      leave.status === 'Refusé' ? 'bg-red-100 text-red-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {leave.status}
                    </span>
                    {leave.status === 'En attente' && (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            setLeavesList(leavesList.map(l => l.id === leave.id ? { ...l, status: 'Approuvé' } : l));
                            showToast("Demande de congé approuvée");
                          }}
                          className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setLeavesList(leavesList.map(l => l.id === leave.id ? { ...l, status: 'Refusé' } : l));
                            showToast("Demande de congé refusée");
                          }}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
             <h3 className="text-lg font-medium text-gray-900 mb-4">Solde Congés</h3>
             <p className="text-sm text-gray-500 mb-6 flex-1">Gérez les compteurs de jours de congé annuel pour chaque employé.</p>
             <button 
               onClick={() => showToast("Ouverture du gestionnaire de soldes...")}
               className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex justify-center items-center gap-2 hover:bg-gray-200 transition-colors"
             >
                <CalendarRange size={16} /> Gérer les soldes
             </button>
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Évaluations & Performances</h3>
            <button 
              onClick={() => setIsEvalModalOpen(true)}
              className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
            >
              <Star size={16} /> Nouvelle Évaluation
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluationsList.map((evalItem) => (
              <div key={evalItem.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors bg-gray-50/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{evalItem.name}</h4>
                    <p className="text-xs text-gray-500">{evalItem.role}</p>
                  </div>
                  <div className="bg-[#DDA956] text-[#1A1A1A] font-bold px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> {evalItem.score}
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dernière éval.</span>
                    <span className="font-medium">{evalItem.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prochaine éval.</span>
                    <span className="font-medium">{evalItem.next}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Formations & Développement</h3>
            <button 
              onClick={() => setIsTrainingModalOpen(true)}
              className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
            >
              <Plus size={16} /> Nouvelle Session
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainingSessions.map((training) => (
              <div key={training.id} className="border border-gray-100 rounded-xl p-5 flex flex-col justify-between hover:border-gray-200 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{training.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${training.status === 'Complété' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {training.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Formateur: {training.trainer}</p>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3 mt-2">
                  <div className="flex items-center gap-1 text-gray-500">
                    <CalendarCheck size={14} /> {training.date}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users size={14} /> {training.participants} inscrits
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Fiches de Paie</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsPayrollModalOpen(true)}
                className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
              >
                <Plus size={16} /> Générer Fiche
              </button>
              <button 
                onClick={() => showToast("Exportation de la masse salariale...")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Download size={16} /> Exporter Masse Salariale
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Période</th>
                  <th className="px-6 py-4">Employé</th>
                  <th className="px-6 py-4">Salaire Net</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payrollList.map((pay) => (
                  <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{pay.period}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{pay.name}</td>
                    <td className="px-6 py-4">{pay.net}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => showToast(`Téléchargement de la fiche de paie de ${pay.name}`)}
                        className="text-gray-400 hover:text-[#DDA956] transition-colors p-2 rounded-lg hover:bg-amber-50"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Droits & Accès</h3>
            <button 
              onClick={() => {
                setEditingRole(null);
                setIsRoleModalOpen(true);
              }}
              className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#c4954b] transition-colors"
            >
              <Plus size={16} /> Nouveau Rôle
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rolesList.map((role) => (
              <div key={role.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Shield size={16} className="text-[#DDA956]" /> {role.role}
                  </h4>
                  <button 
                    onClick={() => {
                      setEditingRole(role);
                      setIsRoleModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-[#DDA956] transition-colors p-1"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">{role.access}</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <UserCheck size={14} /> {role.users} utilisateurs
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                {editingStaff ? "Modifier l'employé" : "Ajouter un employé"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveStaff} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input name="name" defaultValue={editingStaff?.name} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Karim El Fassi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <input name="role" defaultValue={editingStaff?.role} required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Serveur" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <select name="department" defaultValue={editingStaff?.department || 'Salle'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="Salle">Salle</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Accueil">Accueil</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" defaultValue={editingStaff?.phone} type="tel" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="+212..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select name="status" defaultValue={editingStaff?.status || 'Actif'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="Actif">Actif</option>
                    <option value="En congé">En congé</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service (Optionnel)</label>
                  <select name="shift" defaultValue={editingStaff?.shift || '-'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="-">- Non assigné -</option>
                    <option value="Matin">Matin</option>
                    <option value="Soir">Soir</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                {editingStaff ? (
                  <button 
                    type="button" 
                    onClick={() => handleDeleteStaff(editingStaff.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    <Trash2 size={16} /> Supprimer
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors"
                  >
                    {editingStaff ? 'Sauvegarder' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Leave Balance Modal */}
      {isLeaveBalanceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Gestion des soldes de congés
              </h3>
              <button onClick={() => setIsLeaveBalanceModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6">Mettez à jour le solde de congés annuels pour les employés.</p>
              <div className="space-y-4">
                {staffData.map(staff => (
                  <div key={staff.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                    <span className="font-medium text-gray-900">{staff.name}</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        defaultValue={21}
                        className="w-20 p-2 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" 
                      />
                      <span className="text-sm text-gray-500">jours</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsLeaveBalanceModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    showToast("Soldes mis à jour");
                    setIsLeaveBalanceModalOpen(false);
                  }}
                  className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Eval Modal */}
      {isEvalModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Nouvelle Évaluation
              </h3>
              <button onClick={() => setIsEvalModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setEvaluationsList([...evaluationsList, {
                id: Date.now(),
                name: formData.get('staffName') as string,
                role: "Poste",
                score: `${formData.get('score')}/5`,
                date: "Aujourd'hui",
                next: "Dans 6 mois"
              }]);
              showToast("Évaluation enregistrée");
              setIsEvalModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="staffName" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]">
                    {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score global (sur 5)</label>
                  <input type="number" name="score" min="1" max="5" step="0.1" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires et points d'amélioration</label>
                  <textarea rows={4} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEvalModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">Sauvegarder</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Training Modal */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Nouvelle Session de Formation
              </h3>
              <button onClick={() => setIsTrainingModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setTrainingSessions([...trainingSessions, {
                id: Date.now(),
                title: formData.get('title') as string,
                date: formData.get('date') as string,
                participants: parseInt(formData.get('participants') as string) || 0,
                status: "Planifié",
                trainer: formData.get('trainer') as string
              }]);
              showToast("Formation planifiée");
              setIsTrainingModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la formation</label>
                  <input type="text" name="title" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" name="date" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formateur</label>
                  <input type="text" name="trainer" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre prévu de participants</label>
                  <input type="number" name="participants" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTrainingModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">Planifier</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                {editingRole ? 'Modifier le Rôle' : 'Nouveau Rôle'}
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newRole = {
                id: editingRole?.id || Date.now(),
                role: formData.get('role') as string,
                users: editingRole?.users || 0,
                access: formData.get('access') as string
              };
              if (editingRole) {
                setRolesList(rolesList.map(r => r.id === editingRole.id ? newRole : r));
                showToast("Rôle mis à jour");
              } else {
                setRolesList([...rolesList, newRole]);
                showToast("Rôle créé");
              }
              setIsRoleModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Rôle</label>
                  <input type="text" name="role" defaultValue={editingRole?.role} required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description des Accès</label>
                  <textarea name="access" defaultValue={editingRole?.access} rows={4} required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">{editingRole ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Shift Edit Modal */}
      {isShiftModalOpen && editingShift && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Modifier l'horaire
              </h3>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newShift = formData.get('shift') as string;
              setScheduleData(scheduleData.map(s => {
                if (s.id === editingShift.empId) {
                  return { ...s, [editingShift.dayKey]: newShift };
                }
                return s;
              }));
              showToast("Horaire mis à jour");
              setIsShiftModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horaire</label>
                  <select name="shift" defaultValue={editingShift.current} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]">
                    <option value="Repos">Repos</option>
                    <option value="08:00 - 16:30">Matin (08:00 - 16:30)</option>
                    <option value="15:00 - 23:30">Soir (15:00 - 23:30)</option>
                    <option value="09:00 - 18:00">Journée (09:00 - 18:00)</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsShiftModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Saisir un Pointage
              </h3>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setAttendanceList([...attendanceList, {
                id: Date.now(),
                name: formData.get('staffName') as string,
                in: formData.get('timeIn') as string || "-",
                out: formData.get('timeOut') as string || "-",
                status: formData.get('timeOut') ? "Terminé" : "En poste"
              }]);
              showToast("Pointage enregistré");
              setIsAttendanceModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="staffName" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]">
                    {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure d'arrivée</label>
                    <input type="time" name="timeIn" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heure de départ (Optionnel)</label>
                    <input type="time" name="timeOut" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAttendanceModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Payroll Modal */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">
                Générer Fiche de Paie
              </h3>
              <button onClick={() => setIsPayrollModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setPayrollList([...payrollList, {
                id: Date.now(),
                period: formData.get('period') as string,
                name: formData.get('staffName') as string,
                net: `${formData.get('net')} MAD`,
                status: "Payé"
              }]);
              showToast("Fiche de paie générée");
              setIsPayrollModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select name="staffName" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]">
                    {staffData.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Période (Ex: Juil 2026)</label>
                  <input type="text" name="period" required defaultValue="Juil 2026" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire Net (MAD)</label>
                  <input type="number" name="net" required className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsPayrollModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors">Générer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Configuration() {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const { showToast } = useToast();

  const handleSave = () => {
    showToast("Paramètres sauvegardés avec succès");
  };

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Configuration</h2>
          <p className="text-gray-500">Paramètres généraux de l'établissement.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#333] transition-colors">
          <Save size={18} />
          Sauvegarder
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex flex-col gap-2">
          <SettingsTab active={activeSettingsTab === 'general'} onClick={() => setActiveSettingsTab('general')} icon={<Building size={18} />} label="Général" />
          <SettingsTab active={activeSettingsTab === 'integrations'} onClick={() => setActiveSettingsTab('integrations')} icon={<Globe size={18} />} label="Intégrations & IA" />
          <SettingsTab active={activeSettingsTab === 'billing'} onClick={() => setActiveSettingsTab('billing')} icon={<CreditCard size={18} />} label="Facturation & Stripe" />
          <SettingsTab active={activeSettingsTab === 'notifications'} onClick={() => setActiveSettingsTab('notifications')} icon={<Bell size={18} />} label="Notifications" />
          <SettingsTab active={activeSettingsTab === 'security'} onClick={() => setActiveSettingsTab('security')} icon={<Shield size={18} />} label="Sécurité & Accès" />
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeSettingsTab === 'general' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8">
              <div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-xl font-serif font-medium text-[#1A1A1A] mb-0 border-0 pb-0">Informations de l'Établissement</h3>
                  <a href="/DOCUMENTATION.pdf" target="_blank" download className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-white rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm">
                    <Download size={16} />
                    Documentation (PDF)
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'établissement</label>
                    <input type="text" defaultValue="Mouda Palace" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select defaultValue="Restaurant" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors bg-white">
                      <option>Restaurant</option>
                      <option>Restaurant Gastronomique</option>
                      <option>Café / Lounge</option>
                      <option>Hôtel 5 étoiles</option>
                      <option>Riad</option>
                      <option>Maison d'hôtes</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input type="text" defaultValue="Fès, Maroc" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                    <input type="email" defaultValue="contact@moudapalace.com" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="text" defaultValue="+212 524 00 00 00" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 mb-6 text-[#1A1A1A]">Localisation & Devise</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Devise principale</label>
                    <select className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors bg-white">
                      <option>MAD (Dirham)</option>
                      <option>EUR (€)</option>
                      <option>USD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
                    <select className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors bg-white">
                      <option>UTC+1 (Casablanca)</option>
                      <option>UTC+0 (Londres)</option>
                      <option>UTC+2 (Paris)</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSettingsTab === 'integrations' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 text-[#1A1A1A]">Clés API et Intégrations</h3>
              
              <div className="space-y-6">
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shadow-sm"><Sparkles size={22} /></div>
                      <div>
                        <h4 className="font-medium text-gray-900">Google Gemini API</h4>
                        <p className="text-sm text-gray-500">Moteur d'IA pour l'analyse des avis et la génération de contenu.</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">Connecté</span>
                  </div>
                  <input type="password" value="••••••••••••••••••••••••••••••••" readOnly className="w-full p-2.5 border border-gray-200 bg-gray-100/50 text-gray-500 rounded-lg focus:outline-none" />
                </div>

                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-green-50 text-green-600 rounded-lg shadow-sm"><MessageCircle size={22} /></div>
                      <div>
                        <h4 className="font-medium text-gray-900">WhatsApp Business API</h4>
                        <p className="text-sm text-gray-500">Pour les communications avec les clients et le menu digital.</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200">Configuration requise</span>
                  </div>
                  <input type="text" placeholder="Collez votre jeton d'accès WhatsApp ici..." className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors bg-white" />
                </div>
              </div>
            </motion.div>
          )}

          {activeSettingsTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 text-[#1A1A1A]">Préférences de Notification</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900">Nouvelles réservations</h4>
                    <p className="text-sm text-gray-500">Recevoir un email pour chaque nouvelle réservation.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DDA956]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900">Avis clients négatifs</h4>
                    <p className="text-sm text-gray-500">Alerte immédiate par SMS en cas d'avis inférieur à 3 étoiles.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DDA956]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900">Rapports d'activité</h4>
                    <p className="text-sm text-gray-500">Recevoir le résumé hebdomadaire par email.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DDA956]"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {activeSettingsTab === 'billing' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 mb-6 text-[#1A1A1A]">Méthodes de paiement acceptées</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl bg-gray-50/30 hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-blue-900 rounded flex items-center justify-center text-white font-bold italic shadow-sm text-xs">VISA</div>
                      <div>
                        <h4 className="font-medium text-gray-900">Carte Visa</h4>
                        <p className="text-sm text-gray-500">Activé via Stripe</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DDA956]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl bg-gray-50/30 hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white font-medium shadow-sm text-[10px]">Mastercard</div>
                      <div>
                        <h4 className="font-medium text-gray-900">Mastercard</h4>
                        <p className="text-sm text-gray-500">Activé via Stripe</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DDA956]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl bg-gray-50/30 hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-[#008c44] rounded flex items-center justify-center text-white font-bold shadow-sm text-xs border-b-4 border-red-600">CMI</div>
                      <div>
                        <h4 className="font-medium text-gray-900">Centre Monétique Interbancaire</h4>
                        <p className="text-sm text-gray-500">Paiement local marocain</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DDA956]"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 mb-6 text-[#1A1A1A]">Intégration Stripe</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clé publique (Publishable key)</label>
                    <input type="text" defaultValue="pk_live_••••••••••••••••••••••••" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clé secrète (Secret key)</label>
                    <input type="password" defaultValue="sk_live_••••••••••••••••••••••••" className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSettingsTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-gray-400 text-center">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Clock size={32} className="text-gray-300" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Section en construction</h4>
              <p className="max-w-xs">Cette partie des paramètres sera disponible dans la prochaine mise à jour.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
        active 
          ? 'bg-white text-[#DDA956] shadow-sm border border-gray-100' 
          : 'text-gray-500 hover:bg-white/60 hover:text-gray-900 border border-transparent'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${active ? 'bg-[#333] text-white' : 'text-gray-400 hover:bg-[#222] hover:text-white'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DashboardCard({ title, value, subtitle, icon, delay = 0 }: { title: string, value: string, subtitle: string, icon: ReactNode, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-[#FDFBF7] rounded-lg">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-serif font-semibold text-[#1A1A1A] mb-1">
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-auto">
        {subtitle}
      </div>
    </motion.div>
  );
}

function IntegrationRow({ name, status, desc }: { name: string, status: string, desc: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-medium text-gray-900">{name}</h4>
          <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] uppercase font-semibold tracking-wider border border-green-100">
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PortalSelection({ onSelect }: { onSelect: (mode: 'admin' | 'partner') => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] to-[#2a2a2a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "url('/mouda 2.JPG')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-24 bg-[#DDA956] mb-6" style={{
            maskImage: 'url(/mouda.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url(/mouda.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center'
          }} />
          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-wide mb-4">MOUDA PALACE</h1>
          <p className="text-[#DDA956] tracking-[0.2em] uppercase text-sm font-medium">Système de Gestion Centralisé</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => onSelect('admin')}
            className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-[#DDA956]/50 transition-all text-left flex flex-col items-center text-center gap-6"
          >
            <div className="p-4 bg-[#DDA956]/20 text-[#DDA956] rounded-2xl group-hover:scale-110 transition-transform">
              <Settings size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-white mb-2">Accès Administration</h3>
              <p className="text-gray-400 text-sm">Tableau de bord, gestion des réservations, stocks et configuration.</p>
            </div>
          </button>

          <button 
            onClick={() => onSelect('partner')}
            className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-[#DDA956]/50 transition-all text-left flex flex-col items-center text-center gap-6"
          >
            <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Briefcase size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-white mb-2">Accès Partenaire</h3>
              <p className="text-gray-400 text-sm">Consultez vos coordonnées, vos performances et vos commissions (Riads/Agences).</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PartnerPortal({ onBack }: { onBack: () => void }) {
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] to-[#2a2a2a] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "url('/mouda 2.JPG')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Briefcase size={32} />
            </div>
            <h2 className="text-2xl font-serif text-[#1A1A1A] font-semibold mb-2">Espace Partenaire</h2>
            <p className="text-gray-500 text-sm mb-8">Veuillez saisir votre code d'accès pour consulter vos performances et commissions.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (accessCode.trim().length > 3) {
                setIsAuthenticated(true);
              } else {
                setError('Code d\'accès invalide.');
              }
            }}>
              <div className="mb-6 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">Code d'accès secret</label>
                <input 
                  type="password"
                  value={accessCode}
                  onChange={(e) => { setAccessCode(e.target.value); setError(''); }}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-all text-center text-lg tracking-[0.2em]"
                  placeholder="••••••••"
                />
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3.5 rounded-xl font-medium hover:bg-[#333] transition-colors mb-4"
              >
                Accéder à mon espace
              </button>
              <button 
                type="button"
                onClick={onBack}
                className="w-full text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Retour à l'accueil
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-12 relative z-10 flex flex-col items-center">
      <div className="w-full max-w-4xl pt-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Espace Partenaire</h2>
            <p className="text-gray-500">Bienvenue sur votre portail Riad & Agence.</p>
          </div>
          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm self-start">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Building size={24} />
              </div>
              <h3 className="text-xl font-serif font-semibold text-gray-900">Vos Coordonnées</h3>
            </div>
            <div className="space-y-4 text-sm text-gray-600">
              <div><strong className="text-gray-900 block mb-1">Nom du Partenaire</strong> Riad Dar Al Medina</div>
              <div><strong className="text-gray-900 block mb-1">Responsable</strong> Ahmed Benali</div>
              <div><strong className="text-gray-900 block mb-1">Email</strong> contact@riad-daralmedina.com</div>
              <div><strong className="text-gray-900 block mb-1">Téléphone</strong> +212 6 00 00 00 00</div>
              <div><strong className="text-gray-900 block mb-1">Commission actuelle</strong> 5% par réservation</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm self-start">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Banknote size={24} />
              </div>
              <h3 className="text-xl font-serif font-semibold text-gray-900">Vos Commissions (Mois en cours)</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Total généré</div>
              <div className="text-4xl font-serif text-gray-900 font-semibold">1,450 MAD</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600">2 Réservations (Hier)</span>
                <span className="text-sm font-medium text-green-700">+ 300 MAD</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600">5 Réservations (Sem. dernière)</span>
                <span className="text-sm font-medium text-green-700">+ 750 MAD</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600">3 Réservations (Il y a 2 sem.)</span>
                <span className="text-sm font-medium text-green-700">+ 400 MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function TacSystemsPOS() {
  const { showToast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalSearch, setJournalSearch] = useState('');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast("Synchronisation TacSystems terminée");
    }, 1500);
  };

  const handleSaveApiKeys = (e: any) => {
    e.preventDefault();
    setIsSimulationMode(false);
    setIsApiModalOpen(false);
    showToast("Clés API TacSystems enregistrées avec succès");
  };

  const cashMovements = [
    { id: 'TX-1045', time: '14:32', type: 'Encaissement', amount: '+ 450 MAD', method: 'Espèces', user: 'Sofia Amrani' },
    { id: 'TX-1046', time: '14:45', type: 'Encaissement', amount: '+ 1200 MAD', method: 'TPE (Carte)', user: 'Karima Idrissi' },
    { id: 'TX-1047', time: '15:10', type: 'Dépense', amount: '- 150 MAD', method: 'Caisse', user: 'Admin' },
    { id: 'TX-1048', time: '15:22', type: 'Encaissement', amount: '+ 850 MAD', method: 'TPE (Carte)', user: 'Sofia Amrani' },
  ];

  const fullJournalMovements = [
    ...cashMovements,
    { id: 'TX-1044', time: '13:15', type: 'Encaissement', amount: '+ 320 MAD', method: 'Espèces', user: 'Karima Idrissi' },
    { id: 'TX-1043', time: '12:50', type: 'Encaissement', amount: '+ 500 MAD', method: 'TPE (Carte)', user: 'Sofia Amrani' },
    { id: 'TX-1042', time: '12:30', type: 'Dépense', amount: '- 200 MAD', method: 'Caisse', user: 'Admin' },
    { id: 'TX-1041', time: '11:45', type: 'Encaissement', amount: '+ 1500 MAD', method: 'TPE (Carte)', user: 'Karima Idrissi' },
    { id: 'TX-1040', time: '11:10', type: 'Encaissement', amount: '+ 750 MAD', method: 'Espèces', user: 'Sofia Amrani' },
    { id: 'TX-1039', time: '10:20', type: 'Encaissement', amount: '+ 900 MAD', method: 'TPE (Carte)', user: 'Karima Idrissi' },
  ];

  const filteredJournal = fullJournalMovements.filter(tx => 
    tx.id.toLowerCase().includes(journalSearch.toLowerCase()) || 
    tx.user.toLowerCase().includes(journalSearch.toLowerCase()) ||
    tx.type.toLowerCase().includes(journalSearch.toLowerCase())
  );

  const handleExportCSV = () => {
    if (filteredJournal.length === 0) {
      showToast("Aucune transaction à exporter");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Transaction,Heure,Opérateur,Type,Méthode,Montant\n";
    filteredJournal.forEach(tx => {
      const amount = tx.amount.replace(/,/g, '.'); 
      csvContent += `${tx.id},${tx.time},${tx.user},${tx.type},${tx.method},${amount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `journal_caisse_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("Exportation réussie");
  };

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Caisse & Finance</h2>
          <p className="text-gray-500">Passerelle API TacSystems : Mouvements de caisse en temps réel.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {isSyncing ? 'Synchronisation...' : 'Synchroniser la caisse'}
          </button>
        </div>
      </header>

      {/* Connection Status Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 text-white">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <Terminal size={24} />
          </div>
          <div>
            <h3 className="text-lg font-medium">Intégration TacSystems (Logiciel de caisse)</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              {isSimulationMode 
                ? "La passerelle API est prête. En attente des clés API (Endpoint, API Key, et Secret) de la part du fournisseur TacSystems pour basculer en mode production."
                : "Passerelle API active. Connexion en temps réel avec TacSystems."}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {isSimulationMode ? (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold tracking-wider uppercase border border-yellow-500/30 mb-2">
              Mode Simulation
            </span>
          ) : (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold tracking-wider uppercase border border-green-500/30 mb-2">
              En Production
            </span>
          )}
          <button onClick={() => setIsApiModalOpen(true)} className="text-[#DDA956] text-sm hover:underline font-medium">
            Configurer les clés API &rarr;
          </button>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Chiffre d'affaires (Jour)" value="14,500 MAD" subtitle="Dernière synchro: 15:25" icon={<Banknote size={20} />} />
        <DashboardCard title="Total Espèces" value="3,250 MAD" subtitle="En tiroir-caisse" icon={<Wallet size={20} />} />
        <DashboardCard title="Total TPE (Cartes)" value="11,250 MAD" subtitle="Paiements électroniques" icon={<CreditCard size={20} />} />
        <DashboardCard title="Écart de Caisse" value="0 MAD" subtitle="Caisse balancée" icon={<CheckCircle size={20} />} />
      </div>

      {/* AI Analysis */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Sparkles size={80} className="text-blue-600" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
              <Sparkles size={18} />
            </div>
            <h3 className="font-serif text-lg font-medium text-gray-900">Analyse IA des Encaissements</h3>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full">Gemini Pro</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 rounded-xl p-4 border border-blue-100/50">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" /> Performances Financières
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Le chiffre d'affaires actuel (14,500 MAD) est en hausse de <span className="font-medium text-green-600">+18%</span> par rapport à la moyenne des mardis précédents. La part des paiements par TPE (77%) indique une forte préférence pour les paiements électroniques aujourd'hui.
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border border-blue-100/50">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-blue-600" /> Heures de Pointe Identifiées
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Le pic d'encaissement a eu lieu entre <span className="font-medium text-blue-700">13h15 et 14h45</span> (service du midi). Prévision IA : le prochain afflux majeur en caisse est attendu vers <span className="font-medium text-blue-700">20h30</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-gray-900">Derniers Mouvements de Caisse</h3>
          <button onClick={() => setIsJournalOpen(true)} className="text-sm text-[#DDA956] hover:text-[#c4954b] font-medium">Voir le journal complet</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">ID Transaction</th>
                <th className="px-6 py-4">Heure</th>
                <th className="px-6 py-4">Opérateur</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Méthode</th>
                <th className="px-6 py-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cashMovements.map((tx, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.id}</td>
                  <td className="px-6 py-4 text-gray-600">{tx.time}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{tx.user}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${tx.type === 'Encaissement' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      {tx.method.includes('TPE') ? <CreditCard size={14} className="text-gray-400" /> : <Banknote size={14} className="text-gray-400" />}
                      {tx.method}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Journal Modal */}
      {isJournalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-serif font-medium text-gray-900">Journal de Caisse Complet</h3>
                <p className="text-sm text-gray-500 mt-1">Aujourd'hui - Toutes les transactions synchronisées</p>
              </div>
              <button onClick={() => setIsJournalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Rechercher par ID, Opérateur ou Type..." 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
              <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                <Download size={16} />
                Exporter (CSV)
              </button>
            </div>

            <div className="overflow-auto flex-1 p-0">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">ID Transaction</th>
                    <th className="px-6 py-4">Heure</th>
                    <th className="px-6 py-4">Opérateur</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Méthode</th>
                    <th className="px-6 py-4 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredJournal.length > 0 ? (
                    filteredJournal.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.id}</td>
                        <td className="px-6 py-4 text-gray-600">{tx.time}</td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{tx.user}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${tx.type === 'Encaissement' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            {tx.method.includes('TPE') ? <CreditCard size={14} className="text-gray-400" /> : <Banknote size={14} className="text-gray-400" />}
                            {tx.method}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Aucune transaction trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* API Configuration Modal */}
      {isApiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900">Configuration API TacSystems</h3>
              <button onClick={() => setIsApiModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveApiKeys} className="p-6">
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint URL</label>
                  <input required type="url" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="https://api.tacsystems.com/v1/" defaultValue="https://api.tacsystems.com/v1/" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store ID</label>
                  <input required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="ST-10045" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key / Token</label>
                  <input required type="password" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="••••••••••••••••••••••••••••••••" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsApiModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b] transition-colors flex items-center gap-2"
                >
                  <Save size={16} /> Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
