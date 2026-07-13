/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
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
  ArrowLeft
} from 'lucide-react';
import { isCriticalStock } from './lib/inventory';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { signInWithPopup, googleProvider, auth, signOut, db } from './firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

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

  useEffect(() => {
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
    } catch (error) {
      console.error("Login failed", error);
      showToast("Erreur de connexion", "error");
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
      case 'config':
        return <Configuration />;
      default:
        return <Overview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-[#1A1A1A] p-4 text-[#DDA956] z-50 sticky top-0">
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
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-[#1A1A1A] text-[#E8E6E1] p-6 flex-col border-r border-[#333] fixed md:sticky top-16 md:top-0 h-[calc(100vh-4rem)] md:h-screen z-40 overflow-y-auto`}>
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
          <NavItem icon={<ChefHat size={18} />} label="Inventaire & Stock" active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} />
          <NavItem icon={<Users size={18} />} label="Staff & RH" active={activeTab === 'staff'} onClick={() => handleTabChange('staff')} />
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
  
  return (
    <>
      {/* Background Hero */}
      <div 
        className="absolute top-0 left-0 w-full h-[42rem] bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/mouda 2.JPG')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FDFBF7]"></div>
      </div>

      <div className="relative z-10 p-8 md:p-12 pt-16 md:pt-20">
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-serif text-white font-semibold mb-2 drop-shadow-md">Tableau de Bord</h2>
            <p className="text-[#FDFBF7]/90 text-lg drop-shadow-sm">Vue consolidée des activités du restaurant et des intégrations.</p>
          </div>
          <div className="flex gap-3">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-green-800 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm border border-white/20">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Systèmes Opérationnels
            </span>
          </div>
        </header>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
          <DashboardCard 
            title="Réservations du Jour" 
            value="42"
            subtitle="+12 via WhatsApp IA, 4 via Riads B2B"
            icon={<CalendarCheck className="text-[#DDA956]" size={24} />}
            delay={0.1}
          />
          <DashboardCard 
            title="Chiffre d'Affaires Prév." 
            value="45,200 MAD"
            subtitle="Basé sur les réservations du jour"
            icon={<Banknote className="text-[#DDA956]" size={24} />}
            delay={0.2}
          />
        </div>

        {/* Operations Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </>
  );
}

function Reservations() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNewResOpen, setIsNewResOpen] = useState(false);

  const reservations = [
    { id: 'RES-1029', name: 'Sophie Martin', date: 'Aujourd\'hui, 19:30', pax: 4, source: 'TripAdvisor', status: 'Confirmé', phone: '+33 6 12 34 56 78', tag: 'VIP' },
    { id: 'RES-1030', name: 'Jean Dupont', date: 'Aujourd\'hui, 20:00', pax: 2, source: 'WhatsApp Bot', status: 'Confirmé', phone: '+212 6 00 00 00 00', tag: 'Nouveau' },
    { id: 'RES-1031', name: 'Famille Dubois', date: 'Aujourd\'hui, 20:30', pax: 6, source: 'Site Web', status: 'En attente', phone: '+33 6 98 76 54 32', tag: 'Allergies' },
  ];

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
        <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar px-2">
          {['upcoming', 'history', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#DDA956]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {tab === 'upcoming' && 'À venir (3)'}
              {tab === 'history' && 'Historique'}
              {tab === 'reviews' && 'Avis & CRM'}
              {activeTab === tab && (
                <motion.div layoutId="activeResTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DDA956]" />
              )}
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
                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                      <Settings size={18} />
                    </button>
                  </div>
                </div>
              ))}
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
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
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
            
            {/* Fake Calendar View */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Juillet 2026</h4>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Précédent</button>
                  <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Aujourd'hui</button>
                  <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Suivant</button>
                </div>
              </div>
              <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-100 last:border-0">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-fr">
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 2; // Offset for month start
                  const isValidDay = day > 0 && day <= 31;
                  const isToday = day === 13;
                  const hasReservation = isValidDay && [13, 15, 18, 22].includes(day);

                  return (
                    <div key={i} className={`min-h-[100px] p-2 border-r border-b border-gray-100 ${!isValidDay ? 'bg-gray-50/50' : 'bg-white'}`}>
                      {isValidDay && (
                        <>
                          <div className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-[#DDA956] text-white' : 'text-gray-700'}`}>
                            {day}
                          </div>
                          {hasReservation && (
                            <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs p-1.5 rounded-md truncate cursor-pointer hover:bg-blue-100">
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
    </div>
  );
}

function B2BPortal() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('partners');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  const partners = [
    { id: 'P-001', name: 'Riad Al Andalous', type: 'Riad', commission: 5, revenue: '12 500 MAD', active: true, clients: 45 },
    { id: 'P-002', name: 'Atlas Voyages', type: 'Agence', commission: 5, revenue: '34 200 MAD', active: true, clients: 120 },
    { id: 'P-003', name: 'LocaCar Marrakech', type: 'Location Auto', commission: 5, revenue: '4 800 MAD', active: true, clients: 15 },
    { id: 'P-004', name: 'Hôtel La Medina', type: 'Hôtel', commission: 5, revenue: '8 900 MAD', active: false, clients: 32 }
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-500">Total Partenaires</h4>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Share2 size={18} /></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">42</h3>
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
        <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar px-2">
          {['partners', 'commissions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#DDA956]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {tab === 'partners' && 'Liste des Partenaires'}
              {tab === 'commissions' && 'Commissions & Versements'}
              {activeTab === tab && (
                <motion.div layoutId="activeB2BTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DDA956]" />
              )}
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
                          <button 
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
            <div className="p-12 text-center text-gray-500">
              Historique des reversements de commissions en cours de développement.
            </div>
          )}
        </div>
      </div>

      {/* QR Code Partner Modal */}
      {isQRModalOpen && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">QR Code Partenaire</h3>
              <button onClick={() => setIsQRModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium text-[#1A1A1A]">{selectedPartner.name}</h4>
              <p className="text-sm text-gray-500">ID de suivi : {selectedPartner.id}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center justify-center mb-6">
              <QrCode size={180} className="text-gray-800" />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
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

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  showToast("Téléchargement du kit QR partenaire...");
                  setIsQRModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-2.5 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Télécharger Kit
              </button>
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouveau Partenaire</h3>
              <button onClick={() => setIsAddPartnerModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'établissement / agence</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Riad Dar Salam" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de partenaire</label>
                  <select className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option>Riad</option>
                    <option>Hôtel</option>
                    <option>Agence</option>
                    <option>Location Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
                  <input type="number" defaultValue={5} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                <input type="email" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="contact@riad.com" />
              </div>
              <button 
                onClick={() => {
                  showToast("Partenaire ajouté. QR Code généré et prêt à l'emploi.");
                  setIsAddPartnerModalOpen(false);
                  setSelectedPartner({ id: 'P-005', name: 'Nouveau Partenaire', type: 'Riad', commission: 5, active: true, clients: 0 });
                  setIsQRModalOpen(true);
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
                <button className="ml-auto px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
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
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const categories = ['Entrées', 'Plats Principaux', 'Desserts', 'Boissons'];
  
  const menuItems = [
    { id: 1, category: 'Entrées', name: 'Briouates au Fromage', price: '85 MAD', desc: 'Feuilletés croustillants farcis au fromage de chèvre et herbes fraîches.', active: true, translated: true },
    { id: 2, category: 'Entrées', name: 'Salade Zaalouk', price: '75 MAD', desc: 'Caviar d\'aubergines grillées à la tomate, ail et épices.', active: true, translated: true },
    { id: 3, category: 'Plats Principaux', name: 'Tagine d\'Agneau aux Pruneaux', price: '220 MAD', desc: 'Agneau mijoté aux épices douces, pruneaux caramélisés et amandes.', active: true, translated: true },
    { id: 4, category: 'Plats Principaux', name: 'Pastilla au Pigeon', price: '240 MAD', desc: 'Tourte sucrée-salée aux amandes, cannelle et fleur d\'oranger.', active: false, translated: false },
    { id: 5, category: 'Desserts', name: 'Orange à la Cannelle', price: '50 MAD', desc: 'Tranches d\'orange fraîche, cannelle moulue et sirop de fleur d\'oranger.', active: true, translated: true },
    { id: 6, category: 'Boissons', name: 'Thé à la Menthe Royal', price: '40 MAD', desc: 'Thé vert traditionnel infusé à la menthe fraîche et pignons de pin.', active: true, translated: true }
  ];

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
            onClick={() => setIsAddDishModalOpen(true)}
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
          onClick={() => showToast('Traduction du menu en cours...')}
          className="whitespace-nowrap px-5 py-2.5 bg-white text-[#1A1A1A] rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2"
        >
          <Sparkles size={16} className="text-[#DDA956]" />
          Traduire les plats non traduits
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Categories Tab */}
        <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeCategory === category ? 'text-[#DDA956]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {category}
              {activeCategory === category && (
                <motion.div layoutId="activeCategory" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DDA956]" />
              )}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="divide-y divide-gray-100">
          {filteredItems.map(item => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <UtensilsCrossed className="text-gray-400" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {!item.active && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium flex items-center gap-1">
                        <EyeOff size={12} /> Masqué
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 max-w-2xl">{item.desc}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
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
                  onClick={() => showToast(`Visibilité de ${item.name} modifiée`)}
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  title={item.active ? "Masquer" : "Afficher"}
                >
                  {item.active ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button 
                  onClick={() => showToast(`Édition de ${item.name}`)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  title="Modifier"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => showToast(`Suppression de ${item.name}`)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
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
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center">
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

      {/* Add Dish Modal */}
      {isAddDishModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouveau Plat</h3>
              <button onClick={() => setIsAddDishModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Pastilla au Poulet" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (FR)</label>
                <textarea rows={3} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none" placeholder="Description du plat..."></textarea>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="p-2 bg-[#DDA956]/20 text-[#DDA956] rounded-md">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Traduction IA Automatique</p>
                  <p className="text-xs text-gray-500">Le titre et la description seront traduits en EN, ES, AR après l'ajout.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  showToast("Plat ajouté avec succès (Traduction en arrière-plan...)");
                  setIsAddDishModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Ajouter et Traduire
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
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isAutoCreateModalOpen, setIsAutoCreateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [txType, setTxType] = useState<'in' | 'out'>('in');

  const stockItems = [
    { id: 'INV-001', name: 'Safran de Taliouine', category: 'Épices', supplier: 'Coopérative Taliouine', quantity: 250, unit: 'g', minStock: 100, status: 'ok' },
    { id: 'INV-002', name: 'Huile d\'Olive Vierge Extra', category: 'Épicerie', supplier: 'Ferme Atlas', quantity: 15, unit: 'L', minStock: 20, status: 'alert' },
    { id: 'INV-003', name: 'Viande d\'Agneau (Épaule)', category: 'Viandes', supplier: 'Boucherie Médina', quantity: 45, unit: 'kg', minStock: 20, status: 'ok' },
    { id: 'INV-004', name: 'Menthe Fraîche', category: 'Herbes', supplier: 'Marché Central', quantity: 2, unit: 'kg', minStock: 5, status: 'critical' },
    { id: 'INV-005', name: 'Amandes Émondées', category: 'Fruits Secs', supplier: 'Grossiste Fès', quantity: 12, unit: 'kg', minStock: 10, status: 'ok' }
  ];

  const recentTransactions = [
    { id: 'TX-1209', type: 'out', item: 'Menthe Fraîche', amount: 0.5, unit: 'kg', reason: 'Service Thé du Soir (Cuisine)', date: 'Aujourd\'hui, 17:30', user: 'Chef Hassan' },
    { id: 'TX-1208', type: 'in', item: 'Viande d\'Agneau (Épaule)', amount: 20, unit: 'kg', reason: 'Livraison Hebdomadaire', date: 'Aujourd\'hui, 09:15', user: 'Réception' },
    { id: 'TX-1207', type: 'out', item: 'Huile d\'Olive Vierge Extra', amount: 2, unit: 'L', reason: 'Préparation Tagines (Cuisine)', date: 'Hier, 11:00', user: 'Chef Hassan' }
  ];

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Inventaire & Stock</h2>
          <p className="text-gray-500">Suivi des stocks, entrées fournisseurs et sorties automatiques cuisine.</p>
        </div>
        <div className="flex gap-3">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar px-2">
          {['stocks', 'transactions', 'suppliers'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#DDA956]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {tab === 'stocks' && 'Stocks Actuels'}
              {tab === 'transactions' && 'Entrées & Sorties'}
              {tab === 'suppliers' && 'Fournisseurs'}
              {activeTab === tab && (
                <motion.div layoutId="activeInventoryTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DDA956]" />
              )}
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
            <div className="p-12 text-center text-gray-500">
              Base de données des fournisseurs, contacts et commandes en attente.
            </div>
          )}
        </div>
      </div>

      {/* Scanner Modal */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
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

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
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
    </div>
  );
}

function StaffHR() {
  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10">
        <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Staff & RH</h2>
        <p className="text-gray-500">Gestion du personnel, plannings et accès.</p>
      </header>
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px] text-gray-400">
        <p>Le module RH est en cours de développement.</p>
      </div>
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
                <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 mb-6 text-[#1A1A1A]">Informations de l'Établissement</h3>
                
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
      transition={{ duration: 0.5, delay }}
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
              <div><strong className="text-gray-900 block mb-1">Commission actuelle</strong> 15% par réservation</div>
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
