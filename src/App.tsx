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
  Filter
} from 'lucide-react';
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
          if (data.quantity < data.criticalThreshold) {
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
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
        return <Overview />;
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

function Overview() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Facebook (Abonnés)" 
            value="12.4K"
            subtitle="+24 cette semaine • Portée: 4.2K"
            icon={<Facebook className="text-[#DDA956]" size={24} />}
            delay={0.1}
          />
          <DashboardCard 
            title="Instagram (Abonnés)" 
            value="8.2K"
            subtitle="+52 cette semaine • Portée: 6.8K"
            icon={<Instagram className="text-[#DDA956]" size={24} />}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard 
            title="Point de Vente (POS)" 
            value="Actif"
            subtitle="Synchronisation des tables en temps réel"
            icon={<Store className="text-[#DDA956]" size={24} />}
            delay={0.5}
          />
          <DashboardCard 
            title="Clients Actifs (CRM)" 
            value="1,204"
            subtitle="Base Firestore synchronisée en temps réel"
            icon={<Users className="text-[#DDA956]" size={24} />}
            delay={0.6}
          />
          <DashboardCard 
            title="Commissions Riads" 
            value="3,450 MAD"
            subtitle="À régler pour le mois en cours"
            icon={<MapPin className="text-[#DDA956]" size={24} />}
            delay={0.7}
          />
        </div>

        <InventoryAlerts />

        {/* Quick Operations Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => showToast('Ouverture du module Réservation...')}
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
            onClick={() => showToast('Ouverture du module Inventaire...')}
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
            onClick={() => showToast('Envoi d\'annonce WhatsApp...')}
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
  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10">
        <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Réservations (CRM)</h2>
        <p className="text-gray-500">Gestion des réservations, historique client et préférences.</p>
      </header>
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px] text-gray-400">
        <p>Le module de réservations est en cours de développement.</p>
      </div>
    </div>
  );
}

function B2BPortal() {
  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10">
        <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Portail B2B Riads</h2>
        <p className="text-gray-500">Suivi des partenariats et commissions avec les riads.</p>
      </header>
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px] text-gray-400">
        <p>Le portail B2B est en cours de développement.</p>
      </div>
    </div>
  );
}

function WhatsAppAI() {
  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10">
        <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">WhatsApp & IA</h2>
        <p className="text-gray-500">Configuration du bot WhatsApp et paramètres de l'IA.</p>
      </header>
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px] text-gray-400">
        <p>L'interface de gestion WhatsApp est en cours de développement.</p>
      </div>
    </div>
  );
}

function DigitalMenu() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('Entrées');

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
            onClick={() => showToast('Génération du QR Code en cours...')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <QrCode size={16} />
            Imprimer QR Code
          </button>
          <button 
            onClick={() => showToast('Ouverture du formulaire...')}
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
    </div>
  );
}

function Inventory() {
  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10">
        <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Inventaire & Stock</h2>
        <p className="text-gray-500">Suivi des stocks et approvisionnements.</p>
      </header>
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px] text-gray-400">
        <p>Le module d'inventaire est en cours de développement.</p>
      </div>
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
