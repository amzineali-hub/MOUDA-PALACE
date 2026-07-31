import MenuGenerator from "./MenuGenerator";
import BarcodeScanner from "./components/BarcodeScanner";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { calculateStockStatus } from './lib/inventoryUtils';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineChart, Line } from 'recharts';
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
  Printer,
  Upload,
  Image as ImageIcon,
  Video,
  MonitorPlay,
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
  PenTool,
  Timer,
  Info,
  ChevronDown,
  BarChart2,
AlertCircle, Monitor, Calendar, File } from 'lucide-react';
import { isCriticalStock } from './lib/inventory';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { signInWithPopup, googleProvider, auth, signOut, db } from './firebase';
import { collection, query, onSnapshot, doc, getDoc, setDoc, addDoc, serverTimestamp, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';
import Accounting from './Accounting';
import BlogWriterAI from './BlogWriterAI';
import SeoAnalyticsContainer from './components/SeoAnalyticsContainer';
import Documentation from "./Documentation";
import GuideEcrans from "./GuideEcrans";
import AchatsFournisseurs from "./AchatsFournisseurs";
import Recettes from "./Recettes";
import GestionTables from "./GestionTables";
import POSTactile from "./POSTactile";
import EcranCuisine from "./EcranCuisine";
import DeviceManagement from "./DeviceManagement";
import DeviceSimulator from "./DeviceSimulator";
import SystemMonitoring from "./SystemMonitoring";
import ChatBot from './components/ChatBot';
import RH from './RH';
import NotificationSystem from './NotificationSystem';
import DocumentsRestaurant from "./DocumentsRestaurant";

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
  const [orderingItem, setOrderingItem] = useState<any | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'inventoryItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lowStockItems: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.quantity !== undefined && data.minStock !== undefined) {
          if (data.quantity <= data.minStock) {
            lowStockItems.push({ ...data, id: doc.id });
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
  }, [user]);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Commande fournisseur envoyée pour ${orderingItem?.name}`);
    setOrderingItem(null);
  };

  if (loading || alerts.length === 0) return null;

  return (
    <>
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
            <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white/60 p-3 rounded-lg border border-red-50 gap-4">
              <span className="font-medium text-red-900">{item.name || 'Produit inconnu'}</span>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <span className="text-sm text-red-700">Stock actuel: {item.quantity} {item.unit || ''}</span>
                <span className="text-sm text-red-500 font-medium">Seuil: {item.criticalThreshold} {item.unit || ''}</span>
                <button 
                  onClick={() => setOrderingItem(item)}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  <ShoppingCart size={16} />
                  Commander
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Order Modal */}
      {orderingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-serif font-medium text-gray-900">Nouvelle Commande Fournisseur</h3>
              <button onClick={() => setOrderingItem(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleOrderSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                  <input 
                    type="text" 
                    value={orderingItem.name || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actuel</label>
                    <input 
                      type="text" 
                      value={`${orderingItem.quantity} ${orderingItem.unit || ''}`}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-red-50 text-red-600 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Suggérée</label>
                    <input 
                      type="number" 
                      defaultValue={Math.max((orderingItem.criticalThreshold * 3) - orderingItem.quantity, orderingItem.criticalThreshold * 2)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur (Optionnel)</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all">
                    <option value="">Sélectionner un fournisseur régulier</option>
                    <option value="f1">Fournisseur Principal (Marché Central)</option>
                    <option value="f2">Grossiste Viande & Volaille</option>
                    <option value="f3">Distributeur Epicerie Fine</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setOrderingItem(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-[#DDA956] hover:bg-[#c99a4e] transition-colors shadow-lg shadow-[#DDA956]/20 flex justify-center items-center gap-2"
                >
                  <Send size={18} />
                  Envoyer Commande
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}

const NavCategory = ({ title, icon, isExpanded, onClick, children }: any) => (
  <div className="mb-2">
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
        isExpanded 
          ? 'bg-[#DDA956] text-[#1A1A1A] shadow-lg shadow-[#DDA956]/20' 
          : 'text-[#DDA956] border border-[#DDA956]/30 hover:border-[#DDA956] hover:bg-[#DDA956]/10'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="tracking-wide">{title}</span>
      </div>
      <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[400px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="flex flex-col space-y-1 pl-4 border-l-2 border-[#DDA956]/20 ml-6 py-1">
        {children}
      </div>
    </div>
  </div>
);

const SubNavItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium w-full text-left ${
      active 
        ? 'bg-[#333] text-white shadow-sm' 
        : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-[#E8E6E1]'
    }`}
  >
    <span className={`${active ? 'text-[#DDA956]' : 'text-gray-500'}`}>{icon}</span>
    {label}
  </button>
);

export default function App() {
  const [appMode, setAppMode] = useState<'selection' | 'admin' | 'partner'>('admin');
  const { user, loading, role } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const searchItems = [
    { type: 'Navigation', text: 'Vue d\'ensemble', tab: 'overview', keywords: ['dashboard', 'accueil', 'home', 'statistiques'] },
    { type: 'Production', text: 'Production cuisine', tab: 'inventory', keywords: ['inventaire', 'produits', 'ingrédients', 'marchandise', 'stock'] },
    { type: 'Production', text: 'Achats fournisseurs', tab: 'achats', keywords: ['commandes', 'dépenses', 'fournitures', 'achats'] },
    { type: 'Production', text: 'Recettes et stocks', tab: 'recettes', keywords: ['cuisine', 'préparation', 'ingrédients', 'tajine', 'couscous', 'recette', 'fiche technique'] },
    { type: 'Clientèle', text: 'Réservations', tab: 'reservations', keywords: ['clients', 'table', 'dîner', 'déjeuner', 'réserver'] },
    { type: 'Clientèle', text: 'Menus digitaux', tab: 'menu', keywords: ['carte', 'plats', 'boissons', 'desserts', 'tajine', 'couscous', 'pastilla', 'menu'] },
    { type: 'Clientèle', text: 'Tables', tab: 'tables', keywords: ['plan', 'salle', 'service', 'placement'] },
    { type: 'Clientèle', text: 'Partenaires B2B', tab: 'b2b', keywords: ['agences', 'tourisme', 'riad', 'hôtel', 'crm', 'partenaires'] },
    { type: 'Gestion', text: 'Comptabilité', tab: 'accounting', keywords: ['finances', 'bilan', 'revenus', 'dépenses', 'chiffre d\'affaires', 'compta'] },
    { type: 'Gestion', text: 'Caisse / POS Tactile', tab: 'finance', keywords: ['pos', 'encaissement', 'factures', 'paiement', 'commandes', 'caisse'] },
    { type: 'RH', text: 'RH personnel', tab: 'staff', keywords: ['employés', 'personnel', 'salaires', 'présence', 'équipe', 'rh', 'planning'] },
    { type: 'Configuration', text: 'WhatsApp & IA', tab: 'whatsapp', keywords: ['chatbot', 'messages', 'auto-répondeur', 'ia'] },
    { type: 'Configuration', text: 'API & Paramètres', tab: 'config', keywords: ['réglages', 'système', 'options', 'paramètres'] },
    { type: 'Marketing', text: 'Articles du blog', tab: 'blog', keywords: ['seo', 'contenu', 'générateur', 'ia', 'blog', 'article'] },
    { type: 'Marketing', text: 'Analytics SEO', tab: 'seo_analytics', keywords: ['référencement', 'trafic', 'stats seo', 'analytics'] },
    { type: 'Documentation', text: 'Centre de Doc', tab: 'docs', keywords: ['guide', 'aide', 'procédures', 'manuel', 'recrutement'] }
  ];

  const filteredSearch = searchQuery.length > 0 
    ? searchItems.filter(item => 
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some(kw => kw.includes(searchQuery.toLowerCase()))
      )
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
    
    // Request full screen for device modes
    if (['kds', 'finance', 'tables', 'device_simulator'].includes(tab)) {
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn("Fullscreen request failed:", err);
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const isFullScreenMode = ['kds', 'finance', 'tables', 'device_simulator'].includes(activeTab);

  const isFullScreenView = ['kds', 'finance', 'tables', 'device_simulator'].includes(activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview setActiveTab={handleTabChange} />;
      case 'reservations':
        return <Reservations />;
      case 'b2b':
        return <B2BPortal />;
      case 'whatsapp':
        return <WhatsAppAI />;
      case 'blog':
        return <BlogWriterAI />;
      case 'seo_analytics':
        return <SeoAnalyticsContainer />;
      case 'menu':
        return <MenuGenerator />;
      case 'kds':
        return <EcranCuisine />;
      case 'inventory':
        return <Inventory />;
      case 'staff':
        return <RH />;
      case 'finance':
        return <POSTactile />;
      case 'accounting':
        return <Accounting />;
      case 'documents':
        return <DocumentsRestaurant />;
      case 'device_simulator':
        return <DeviceSimulator setActiveTab={handleTabChange} />;
      case 'docs_devices':
        return <DeviceManagement setActiveTab={handleTabChange} />;
      case 'docs':
        return <Documentation />;
      case 'docs_procede':
        return <Documentation initialGuideId={11} />;
      case 'docs_screens':
        return <GuideEcrans />;
      case 'config':
        return <Configuration />;
      case 'achats':
        return <AchatsFournisseurs />;
      case 'recettes':
        return <Recettes />;
      case 'tables':
        return <GestionTables setActiveTab={handleTabChange} />;
      default:
        return <Overview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className={`min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative print:block print:min-h-0 print:h-auto ${isFullScreenView ? "overflow-hidden print:overflow-visible" : ""}`}>
      <NotificationSystem />
      {/* Mobile Header */}
      {!isFullScreenView && (
      <div className="print:hidden md:hidden flex items-center justify-between bg-[#1A1A1A] p-4 text-[#DDA956] z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <div 
             className="h-10 w-12 bg-[#DDA956]" 
             style={{
              maskImage: 'url(/mouda-1.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: 'url(/mouda-1.png)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center'
            }}
          />
          <span className="font-serif font-normal tracking-[0.1em] uppercase text-base text-white">Mouda Palace</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#E8E6E1] p-1">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      )}

      {/* Sidebar Navigation */}
      {!isFullScreenView && (
      <aside className={`print:hidden ${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex shrink-0 w-full md:w-64 bg-[#1A1A1A] text-[#E8E6E1] p-6 flex-col border-r border-[#333] fixed md:sticky top-16 md:top-0 h-[calc(100vh-4rem)] md:h-screen z-40 overflow-y-auto`}>
        <div className="mb-12 hidden md:flex flex-col items-center text-center">
          <div 
            className="h-24 w-32 mb-4 bg-[#DDA956]" 
            style={{
              maskImage: 'url(/mouda-1.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: 'url(/mouda-1.png)',
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
                    <li key={idx} className="px-4 py-3 hover:bg-[#333] cursor-pointer transition-colors border-b border-[#333] last:border-0" onClick={() => { setSearchQuery(''); handleTabChange(item.tab); setIsMobileMenuOpen(false); }}>
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

        <div className="flex-1 overflow-y-auto pr-2 pb-8 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
          <div className="mb-4 text-[#DDA956] font-serif text-lg tracking-wider font-semibold border-b border-[#333] pb-2">
            Tableau de Bord
          </div>
          
          <button
            onClick={() => handleTabChange('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 ${
              activeTab === 'overview'
                ? 'bg-[#DDA956] text-[#1A1A1A] shadow-lg shadow-[#DDA956]/20'
                : 'text-[#DDA956] border border-[#DDA956]/30 hover:border-[#DDA956] hover:bg-[#DDA956]/10'
            }`}
          >
            <TrendingUp size={18} />
            <span>Vue d'ensemble</span>
          </button>

          <button
            onClick={() => handleTabChange('finance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 ${
              activeTab === 'finance'
                ? 'bg-[#DDA956] text-[#1A1A1A] shadow-lg shadow-[#DDA956]/20'
                : 'text-[#DDA956] border border-[#DDA956]/30 hover:border-[#DDA956] hover:bg-[#DDA956]/10'
            }`}
          >
            <Wallet size={18} />
            <span>Caisse / POS Tactile</span>
          </button>

          <button
            onClick={() => handleTabChange('docs_devices')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 ${
              activeTab === 'docs_devices'
                ? 'bg-[#DDA956] text-[#1A1A1A] shadow-lg shadow-[#DDA956]/20'
                : 'text-[#DDA956] border border-[#DDA956]/30 hover:border-[#DDA956] hover:bg-[#DDA956]/10'
            }`}
          >
            <Monitor size={18} />
            <span>Gestion Écrans Tactile & Cuisine</span>
          </button>

          <button
            onClick={() => handleTabChange('menu')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold mb-6 border-2 shadow-sm ${
              activeTab === 'menu'
                ? 'bg-[#DDA956] text-[#1A1A1A] border-[#DDA956] shadow-[#DDA956]/30'
                : 'text-[#DDA956] border-[#DDA956]/50 hover:border-[#DDA956] hover:bg-[#DDA956]/10'
            }`}
          >
            <div className="flex items-center gap-3">
               <Printer size={18} />
               <span>Génération du Menu</span>
            </div>
            <Sparkles size={16} className="text-[#DDA956] opacity-70" />
          </button>

          <NavCategory 
            title="Production" 
            icon={<ChefHat size={18} />} 
            isExpanded={expandedCategory === 'production'} 
            onClick={() => setExpandedCategory(expandedCategory === 'production' ? null : 'production')}
          >
            <SubNavItem icon={<ChefHat size={16} />} label="Production cuisine" active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} />
            <SubNavItem icon={<AlertCircle size={16} />} label="Écran Cuisine (KDS)" active={activeTab === 'kds'} onClick={() => handleTabChange('kds')} />
            <SubNavItem icon={<ShoppingCart size={16} />} label="Achats fournisseurs" active={activeTab === 'achats'} onClick={() => handleTabChange('achats')} />
            <SubNavItem icon={<UtensilsCrossed size={16} />} label="Recettes et stocks" active={activeTab === 'recettes'} onClick={() => handleTabChange('recettes')} />
          </NavCategory>

          <NavCategory 
            title="Clientèle" 
            icon={<Users size={18} />} 
            isExpanded={expandedCategory === 'clientele'} 
            onClick={() => setExpandedCategory(expandedCategory === 'clientele' ? null : 'clientele')}
          >
            <SubNavItem icon={<CalendarCheck size={16} />} label="Réservations" active={activeTab === 'reservations'} onClick={() => handleTabChange('reservations')} />
            <SubNavItem icon={<UtensilsCrossed size={16} />} label="Menus digitaux" active={activeTab === 'menu'} onClick={() => handleTabChange('menu')} />
            <SubNavItem icon={<ConciergeBell size={16} />} label="Tables" active={activeTab === 'tables'} onClick={() => handleTabChange('tables')} />
            <SubNavItem icon={<Globe size={16} />} label="Partenaires B2B" active={activeTab === 'b2b'} onClick={() => handleTabChange('b2b')} />
          </NavCategory>

          <NavCategory 
            title="Gestion comptabilité" 
            icon={<Briefcase size={18} />} 
            isExpanded={expandedCategory === 'gestion'} 
            onClick={() => setExpandedCategory(expandedCategory === 'gestion' ? null : 'gestion')}
          >
            <SubNavItem icon={<Receipt size={16} />} label="Comptabilité" active={activeTab === 'accounting'} onClick={() => handleTabChange('accounting')} />
                        <SubNavItem icon={<Users size={16} />} label="RH personnel" active={activeTab === 'staff'} onClick={() => handleTabChange('staff')} />
                    </NavCategory>

          <NavCategory 
            title="Documents restaurant" 
            icon={<FileText size={18} />} 
            isExpanded={expandedCategory === 'documents_cat'} 
            onClick={() => setExpandedCategory(expandedCategory === 'documents_cat' ? null : 'documents_cat')}
          >
            <SubNavItem icon={<File size={16} />} label="Fichiers & Modèles" active={activeTab === 'documents'} onClick={() => handleTabChange('documents')} />
          </NavCategory>

          <NavCategory 
            title="Configurations" 
            icon={<Settings size={18} />} 
            isExpanded={expandedCategory === 'config_cat'} 
            onClick={() => setExpandedCategory(expandedCategory === 'config_cat' ? null : 'config_cat')}
          >
            <SubNavItem icon={<MessageCircle size={16} />} label="WhatsApp & IA" active={activeTab === 'whatsapp'} onClick={() => handleTabChange('whatsapp')} />
            <SubNavItem icon={<Settings size={16} />} label="API & Paramètres" active={activeTab === 'config'} onClick={() => handleTabChange('config')} />
          </NavCategory>

          <NavCategory 
            title="Rédaction et SEO" 
            icon={<PenTool size={18} />} 
            isExpanded={expandedCategory === 'seo'} 
            onClick={() => setExpandedCategory(expandedCategory === 'seo' ? null : 'seo')}
          >
            <SubNavItem icon={<PenTool size={16} />} label="Articles du blog" active={activeTab === 'blog'} onClick={() => handleTabChange('blog')} />
            <SubNavItem icon={<BarChart2 size={16} />} label="Analytics SEO" active={activeTab === 'seo_analytics'} onClick={() => handleTabChange('seo_analytics')} />
          </NavCategory>

          <NavCategory 
            title="Documentation" 
            icon={<BookOpen size={18} />} 
            isExpanded={expandedCategory === 'docs_cat'} 
            onClick={() => setExpandedCategory(expandedCategory === 'docs_cat' ? null : 'docs_cat')}
          >
            <SubNavItem icon={<BookOpen size={16} />} label="Guide Logiciel" active={activeTab === 'docs'} onClick={() => handleTabChange('docs')} />
            <SubNavItem icon={<Monitor size={16} />} label="Guide Écrans" active={activeTab === 'docs_screens'} onClick={() => handleTabChange('docs_screens')} />
            <SubNavItem icon={<BookOpen size={16} />} label="Procédé de base" active={activeTab === 'docs_procede'} onClick={() => handleTabChange('docs_procede')} />
          </NavCategory>
        </div>

        <div className="mt-auto pt-4 border-t border-[#333]">
          <div className="flex items-center justify-between gap-3">
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

      )}
      {/* Main Content */}
      <main className={`flex-1 min-w-0 relative bg-[#FDFBF7] print:block print:h-auto print:min-h-0 print:overflow-visible ${isFullScreenView ? "h-screen overflow-hidden print:h-auto print:overflow-visible" : "min-h-screen print:min-h-0"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={isFullScreenView ? "h-full" : "min-h-full"}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* {!isFullScreenView && <ChatBot />} */}
      {isFullScreenView && activeTab !== 'device_simulator' && (
        <button 
          onClick={() => {
            setActiveTab('docs_devices');
            try {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              }
            } catch (e) {
              console.error(e);
            }
          }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white p-3 rounded-full shadow-lg hover:bg-black transition-colors z-50 print:hidden flex items-center gap-2 px-6"
          title="Quitter le mode plein écran"
        >
          <X size={20} />
          <span className="font-bold text-sm">Quitter l'écran</span>
        </button>
      )}
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2"
      >
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
      </motion.div>

      {/* Chart 2: Répartition des Sources (BarChart) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
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
      </motion.div>
    </div>
  );
}

function Overview({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { showToast } = useToast();
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const metricsCache = useRef<Record<string, any>>({});
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metrics, setMetrics] = useState({
    users: "324",
    aov: "1,076 MAD",
    reservations: "42",
    revenue: "45,200 MAD",
    pos: "Actif",
    crm: "1,204",
    commissions: "3,450 MAD"
  });

  useEffect(() => {
    const cacheKey = dateRange === 'custom' ? `${customStartDate}-${customEndDate}` : dateRange;
    
    if (metricsCache.current[cacheKey]) {
      setMetrics(metricsCache.current[cacheKey]);
      showToast(`Métriques ${cacheKey} chargées depuis le cache local`);
      return;
    }

    setIsLoadingMetrics(true);
    
    // Simulate Firestore fetch
    const fetchTimeout = setTimeout(() => {
      let multiplier = 1;
      if (dateRange === 'week') multiplier = 7;
      if (dateRange === 'month') multiplier = 30;
      if (dateRange === 'year') multiplier = 365;
      if (dateRange === 'custom') multiplier = 3;

      const newMetrics = {
        users: (324 * multiplier + Math.floor(Math.random() * 50)).toLocaleString(),
        aov: (1076 + Math.floor(Math.random() * 100)).toLocaleString() + " MAD",
        reservations: (42 * multiplier + Math.floor(Math.random() * 10)).toString(),
        revenue: (45200 * multiplier + Math.floor(Math.random() * 1000)).toLocaleString() + " MAD",
        pos: "Actif",
        crm: (1204 + (multiplier > 1 ? Math.floor(Math.random() * 100) : 0)).toLocaleString(),
        commissions: (3450 * multiplier).toLocaleString() + " MAD"
      };

      metricsCache.current[cacheKey] = newMetrics;
      setMetrics(newMetrics);
      setIsLoadingMetrics(false);
      showToast(`Nouvelles données ${cacheKey} récupérées depuis Firestore`);
    }, 600);

    return () => clearTimeout(fetchTimeout);
  }, [dateRange, customStartDate, customEndDate, showToast]);
  
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
        style={{ backgroundImage: "url('/img1.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FDFBF7]"></div>
      </div>

      <div className="relative z-10 p-4 md:p-12 pt-20 md:pt-20 print:hidden">
        <header className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-serif text-white font-semibold mb-2 drop-shadow-md">Tableau de Bord</h2>
            <p className="text-[#FDFBF7]/90 text-lg drop-shadow-sm">Vue consolidée des activités du restaurant et des intégrations.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-white/20 shadow-sm mr-2">
              <Calendar className="text-gray-500 ml-2" size={16} />
              <div className="flex items-center text-gray-700 bg-transparent rounded-md overflow-hidden">
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-transparent border-none py-1 px-2 text-sm font-medium focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                  <option value="custom">Personnalisé</option>
                </select>
              </div>
              {dateRange === 'custom' && (
                <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                  <input 
                    type="date" 
                    value={customStartDate} 
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="border border-gray-200 rounded-md py-1 px-2 text-sm text-gray-700 outline-none focus:border-[#DDA956] bg-white"
                  />
                  <span className="text-gray-500 text-sm">-</span>
                  <input 
                    type="date" 
                    value={customEndDate} 
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border border-gray-200 rounded-md py-1 px-2 text-sm text-gray-700 outline-none focus:border-[#DDA956] bg-white"
                  />
                </div>
              )}
            </div>
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

        <SystemMonitoring />

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Daily Active Users" 
            value={isLoadingMetrics ? "..." : metrics.users}
            subtitle="Utilisateurs uniques"
            icon={<Users className="text-[#DDA956]" size={24} />}
            delay={0.1}
          />
          <DashboardCard 
            title="Average Order Value" 
            value={isLoadingMetrics ? "..." : metrics.aov}
            subtitle="Panier moyen par table"
            icon={<CreditCard className="text-[#DDA956]" size={24} />}
            delay={0.2}
          />
          <DashboardCard 
            title="Réservations" 
            value={isLoadingMetrics ? "..." : metrics.reservations}
            subtitle="+12 via WhatsApp IA, 4 via Riads B2B"
            icon={<CalendarCheck className="text-[#DDA956]" size={24} />}
            delay={0.3}
          />
          <DashboardCard 
            title="Chiffre d'Affaires Prév." 
            value={isLoadingMetrics ? "..." : metrics.revenue}
            subtitle="Basé sur les réservations"
            icon={<Banknote className="text-[#DDA956]" size={24} />}
            delay={0.4}
          />
        </div>

        {/* Operations Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard 
            title="Point de Vente (POS)" 
            value={isLoadingMetrics ? "..." : metrics.pos}
            subtitle="Synchronisation des tables en temps réel"
            icon={<Store className="text-[#DDA956]" size={24} />}
            delay={0.3}
          />
          <DashboardCard 
            title="Clients Actifs (CRM)" 
            value={isLoadingMetrics ? "..." : metrics.crm}
            subtitle="Base Firestore synchronisée en temps réel"
            icon={<Users className="text-[#DDA956]" size={24} />}
            delay={0.4}
          />
          <DashboardCard 
            title="Commissions Riads" 
            value={isLoadingMetrics ? "..." : metrics.commissions}
            subtitle="À régler pour la période"
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.8 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
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
        </motion.div>

        {/* Central Marketing Command */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.9 }}
            className="lg:col-span-2 bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl"
          >
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
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1.0 }}
            className="flex flex-col gap-6"
          >
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
          </motion.div>
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
                  setTimeout(() => { try { window.print(); } catch(e) { showToast("Erreur d'impression", "error"); } }, 500);
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

  const [activeTab, setActiveTab] = useState(() => {
    if (sessionStorage.getItem('open-floorplan')) {
      sessionStorage.removeItem('open-floorplan');
      return 'floorplan';
    }
    return 'upcoming';
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(() => {
    if (sessionStorage.getItem('open-calendar')) {
      sessionStorage.removeItem('open-calendar');
      return true;
    }
    return false;
  });
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

  const [tables, setTables] = useState<any[]>(() => {
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

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      const fbTables = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          fbId: doc.id,
          id: data.id,
          capacity: data.capacity || 2,
          status: data.status === 'libre' ? 'available' : (data.status === 'reservee' ? 'reserved' : 'occupied'),
          type: data.shape === 'rond' ? 'round' : (data.shape === 'rectangle' ? 'rectangle' : 'square'),
          x: data.x || Math.floor(Math.random() * 800),
          y: data.y || Math.floor(Math.random() * 400),
          ...data
        };
      });
      if (fbTables.length > 0) {
        setTables(fbTables);
      }
    });
    return () => unsub();
  }, []);


  const autoAssignTables = async () => {
    let updatedTables = [...tables];
    let updatedReservations = reservations.map(res => {
      if (!res.table && res.status !== 'Annulé') {
        const suitableTable = updatedTables.find(t => t.capacity >= res.pax && (t.status === 'available' || t.status === 'libre'));
        if (suitableTable) {
          suitableTable.status = 'reserved';
          return { ...res, table: suitableTable.id };
        }
      }
      return res;
    });
    setTables(updatedTables);
    setReservations(updatedReservations);
    
    // Update Firestore
    try {
      for (const table of updatedTables) {
        if (table.fbId && table.status === 'reserved') {
           await updateDoc(doc(db, 'tables', table.fbId), { status: 'reservee' });
        }
      }
      showToast("Attribution automatique des tables effectuée avec succès.");
    } catch(e) {
      console.error(e);
      showToast("Attribution locale effectuée, mais erreur lors de la synchronisation au serveur.");
    }
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
                          <button onClick={() => showToast && showToast("Fonctionnalité à venir...")} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Modifier</button>
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
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nom = formData.get('nom') as string;
              const date = formData.get('date') as string;
              const time = formData.get('time') as string;
              const pax = Number(formData.get('pax'));
              const phone = formData.get('phone') as string;
              const source = formData.get('source') as string;
              const notes = formData.get('notes') as string;
              
              let tag = 'Nouveau';
              if (notes.toLowerCase().includes('vip')) tag = 'VIP';
              else if (notes.toLowerCase().includes('allergie')) tag = 'Allergies';

              const newRes = {
                id: 'RES-' + Date.now(),
                name: nom,
                date: date + ', ' + time,
                pax,
                source,
                status: 'Confirmé',
                phone,
                tag,
                notes,
                table: null,
                createdAt: serverTimestamp()
              };

              try {
                await addDoc(collection(db, 'reservations'), newRes);
                setReservations([newRes, ...reservations]);
                showToast("Réservation ajoutée avec succès");
              } catch (err) {
                console.error(err);
                showToast("Erreur", "error");
              }
              setIsNewResOpen(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input name="nom" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: M. Dubois" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input name="date" required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input name="time" required type="time" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personnes (Pax)</label>
                  <input name="pax" required type="number" defaultValue={2} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" required type="tel" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="+212..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source / Canal</label>
                <select name="source" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                  <option>Téléphone</option>
                  <option>Passage (Walk-in)</option>
                  <option>WhatsApp / Instagram</option>
                  <option>Site Web</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Tags spéciaux (ajoutez "VIP" pour tag VIP)</label>
                <textarea name="notes" rows={2} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none" placeholder="Allergies, anniversaire, VIP..."></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Confirmer la réservation
              </button>
            </form>
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
  const [isEditPartnerModalOpen, setIsEditPartnerModalOpen] = useState(false);

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

  const handleDeletePartner = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      setPartners(partners.filter((p: any) => p.id !== id));
      showToast("Partenaire supprimé avec succès");
    }
  };

  const handleDownloadPartner = (partner: any) => {
    const data = `FICHE PARTENAIRE
-------------------
Nom: ${partner.name}
ID: ${partner.id}
Type: ${partner.type}
Commission: ${partner.commission}%
Statut: ${partner.active ? 'Actif' : 'Inactif'}
CA Généré: ${partner.revenue}
Clients apportés: ${partner.clients}
`;
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fiche_${partner.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Téléchargement de la fiche de ${partner.name}`);
  };

  const openEditPartnerModal = (partner: any) => {
    setSelectedPartner(partner);
    setNewPartnerName(partner.name);
    setNewPartnerType(partner.type);
    setNewPartnerCommission(partner.commission);
    setNewPartnerEmail(partner.email || '');
    setNewPartnerAccessCode(partner.accessCode || '');
    setIsEditPartnerModalOpen(true);
  };

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
                          <button 
                            onClick={() => handleDownloadPartner(partner)}  
                            className="p-2 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-amber-50"
                            title="Télécharger Fiche Partenaire"
                          >
                            <Download size={18} />
                          </button>
                          <button 
                            onClick={() => openEditPartnerModal(partner)}  
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Modifier Partenaire"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeletePartner(partner.id)}  
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Supprimer Partenaire"
                          >
                            <Trash2 size={18} />
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
<th className="px-6 py-4 text-right">Actions</th>
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
                          <button class="secondary" onclick="window.close()">Fermer</button>
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

      {/* Edit Partner Modal */}
      {isEditPartnerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Modifier Partenaire</h3>
              <button onClick={() => setIsEditPartnerModalOpen(false)} className="text-gray-400 hover:text-gray-900">
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
                    placeholder="5" 
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
                  
                  const updatedPartner = {
                    ...selectedPartner,
                    name: newPartnerName,
                    type: newPartnerType,
                    commission: newPartnerCommission,
                    accessCode: newPartnerAccessCode,
                    email: newPartnerEmail
                  };
                  
                  setPartners(partners.map((p) => p.id === selectedPartner.id ? updatedPartner : p));
                  showToast("Partenaire modifié avec succès.");
                  setIsEditPartnerModalOpen(false);
                  
                  setNewPartnerName('');
                  setNewPartnerType('Riad');
                  setNewPartnerCommission(5);
                  setNewPartnerEmail('');
                  setNewPartnerAccessCode('');
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

let savedPrompt = `Tu es l'assistant virtuel du restaurant gastronomique Mouda Palace à Fès. 
Ton ton doit être élégant, chaleureux et professionnel.
Tu peux répondre aux questions sur le menu, les horaires, l'adresse et l'emplacement du restaurant, prendre des réservations et fournir le site web du restaurant : www.moudapalace.com, ainsi que le menu digital. 
Si une demande est complexe, propose au client d'être contacté par un humain.`;

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
                          <button onClick={() => showToast && showToast("Fonctionnalité à venir...")} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Modifier</button>
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
                <textarea rows={3} defaultValue="- Option végétarienne et vegan disponibles.
- Animation musicale (Luth/Oud) tous les vendredis et samedis soirs.
- Accessible aux fauteuils roulants au rez-de-chaussée uniquement." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none" />
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaEditingItem, setMediaEditingItem] = useState<any>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  
  const openMediaModal = (item: any, type: 'image' | 'video') => {
    setMediaEditingItem(item);
    setMediaType(type);
    setIsMediaModalOpen(true);
  };
  
  const playVideo = (videoUrl?: string) => {
    if (videoUrl) {
      setCurrentVideo(videoUrl);
      setIsVideoPlayerOpen(true);
    } else {
      showToast("Aucune vidéo disponible pour ce plat");
    }
  };

  const categories = ['Entrées', 'Plats Principaux', 'Desserts', 'Boissons'];
  
  const [menuItems, setMenuItems] = useState([
    { id: 1, category: 'Entrées', name: 'Briouates au Fromage', price: '85 MAD', desc: 'Feuilletés croustillants farcis au fromage de chèvre et herbes fraîches.', active: true, translated: true, translations: { en: { name: 'Cheese Briouates', desc: 'Crispy pastries stuffed with goat cheese and fresh herbs.' }, es: { name: 'Briouates de Queso', desc: 'Pasteles crujientes rellenos de queso de cabra y hierbas frescas.' }, ar: { name: 'بريوات بالجبن', desc: 'معجنات مقرمشة محشوة بجبن الماعز والأعشاب الطازجة.' }, de: { name: 'Käse-Briouates', desc: 'Knuspriges Gebäck gefüllt mit Ziegenkäse und frischen Kräutern.' }, zh: { name: '奶酪薄饼', desc: '脆皮糕点塞满了山羊奶酪和新鲜香草。' }, ko: { name: '치즈 브리오와트', desc: '염소 치즈와 신선한 허브로 속을 채운 바삭한 페이스트리.' }, pt: { name: 'Briouates de Queijo', desc: 'Pastéis crocantes recheados com queijo de cabra e ervas frescas.' } } },
    { id: 2, category: 'Entrées', name: 'Salade Zaalouk', price: '75 MAD', desc: 'Caviar d\'aubergines grillées à la tomate, ail et épices.', active: true, translated: true, translations: { en: { name: 'Zaalouk Salad', desc: 'Grilled eggplant caviar with tomato, garlic, and spices.' }, es: { name: 'Ensalada Zaalouk', desc: 'Caviar de berenjenas asadas con tomate, ajo y especias.' }, ar: { name: 'سلطة زعلوك', desc: 'كافيار الباذنجان المشوي مع الطماطم والثوم والتوابل.' }, de: { name: 'Zaalouk-Salat', desc: 'Gegrillter Auberginenkaviar mit Tomaten, Knoblauch und Gewürzen.' }, zh: { name: '扎卢克沙拉', desc: '烤茄子鱼子酱加番茄、大蒜和香料。' }, ko: { name: '잘룩 샐러드', desc: '토마토, 마늘, 향신료를 곁들인 구운 가지 캐비어.' }, pt: { name: 'Salada Zaalouk', desc: 'Caviar de berinjela grelhada com tomate, alho e especiarias.' } } },
    { id: 3, category: 'Plats Principaux', name: 'Tagine d\'Agneau aux Pruneaux', price: '220 MAD', desc: 'Agneau mijoté aux épices douces, pruneaux caramélisés et amandes.', active: true, translated: true, translations: { en: { name: 'Lamb Tagine with Prunes', desc: 'Lamb simmered with sweet spices, caramelized prunes, and almonds.' }, es: { name: 'Tajín de Cordero con Ciruelas', desc: 'Cordero a fuego lento con especias dulces, ciruelas caramelizadas y almendras.' }, ar: { name: 'طاجين اللحم بالبرقوق', desc: 'لحم ضأن مطبوخ ببطء مع توابل حلوة، برقوق مكرمل ولوز.' }, de: { name: 'Lamm-Tajine mit Pflaumen', desc: 'Lamm geschmort mit süßen Gewürzen, karamellisierten Pflaumen und Mandeln.' }, zh: { name: '羊肉塔吉锅配梅子', desc: '加入甜香料、焦糖梅子和杏仁炖煮的羊肉。' }, ko: { name: '자두 양고기 타진', desc: '달콤한 향신료, 캐러멜 처리된 자두, 아몬드로 푹 끓인 양고기.' }, pt: { name: 'Tajine de Cordeiro com Ameixas', desc: 'Cordeiro cozido em fogo brando com especiarias doces, ameixas caramelizadas e amêndoas.' } } },
    { id: 4, category: 'Plats Principaux', name: 'Pastilla au Pigeon', price: '240 MAD', desc: 'Tourte sucrée-salée aux amandes, cannelle et fleur d\'oranger.', active: true, translated: false },
    { id: 5, category: 'Desserts', name: 'Orange à la Cannelle', price: '50 MAD', desc: 'Tranches d\'orange fraîche, cannelle moulue et sirop de fleur d\'oranger.', active: true, translated: true, translations: { en: { name: 'Cinnamon Orange', desc: 'Fresh orange slices, ground cinnamon, and orange blossom syrup.' }, es: { name: 'Naranja a la Canela', desc: 'Rodajas de naranja fresca, canela molida y sirope de azahar.' }, ar: { name: 'برتقال بالقرفة', desc: 'شرائح برتقال طازجة، قرفة مطحونة وشراب زهر البرتقال.' }, de: { name: 'Zimtorange', desc: 'Frische Orangenscheiben, gemahlener Zimt und Orangenblütensirup.' }, zh: { name: '肉桂橙', desc: '新鲜橙片、肉桂粉和橙花糖浆。' }, ko: { name: '시나몬 오렌지', desc: '신선한 오렌지 슬라이스, 계피 가루, 오렌지 블라썸 시럽.' }, pt: { name: 'Laranja com Canela', desc: 'Fatias de laranja fresca, canela em pó e xarope de flor de laranjeira.' } } },
    { id: 6, category: 'Boissons', name: 'Thé à la Menthe Royal', price: '40 MAD', desc: 'Thé vert traditionnel infusé à la menthe fraîche et pignons de pin.', active: true, translated: true, translations: { en: { name: 'Royal Mint Tea', desc: 'Traditional green tea infused with fresh mint and pine nuts.' }, es: { name: 'Té de Menta Real', desc: 'Té verde tradicional infundido con menta fresca y piñones.' }, ar: { name: 'شاي ملكي بالنعناع', desc: 'شاي أخضر تقليدي منقوع بالنعناع الطازج وحبوب الصنوبر.' }, de: { name: 'Königlicher Minztee', desc: 'Traditioneller grüner Tee, aufgegossen mit frischer Minze und Pinienkernen.' }, zh: { name: '皇家薄荷茶', desc: '传统绿茶，泡有新鲜薄荷和松子。' }, ko: { name: '로열 민트 티', desc: '신선한 민트와 잣을 우려낸 전통 녹차.' }, pt: { name: 'Chá de Hortelã Real', desc: 'Chá verde tradicional infundido com hortelã fresca e pinhões.' } } }
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
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = 'Erreur lors de la traduction';
        if (errData.error === "API key not found") errMsg = "La clé d'API Gemini est manquante. Vérifiez les paramètres.";
        else if (errData.error && errData.error.includes("401")) errMsg = "La clé d'API Gemini utilisée semble invalide.";
        throw new Error(errMsg);
      }
      
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
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Erreur lors de la traduction.', 'error');
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
        <div className="flex flex-wrap justify-end gap-3">
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors shadow-sm"
          >
            {isPreviewMode ? <Menu size={16} /> : <ImageIcon size={16} />}
            {isPreviewMode ? 'Vue Liste' : 'Aperçu Multimédia'}
          </button>
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
          disabled={isTranslating || menuItems.filter(i => !i.translated).length === 0}
          className={`whitespace-nowrap px-5 py-2.5 bg-white text-[#1A1A1A] rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2 ${(isTranslating || menuItems.filter(i => !i.translated).length === 0) ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isTranslating ? <Loader2 size={16} className="text-[#DDA956] animate-spin" /> : <Sparkles size={16} className={menuItems.filter(i => !i.translated).length === 0 ? "text-gray-400" : "text-[#DDA956]"} />}
          {isTranslating ? 'Traduction en cours...' : menuItems.filter(i => !i.translated).length === 0 ? 'Tous les plats sont traduits' : `Traduire ${menuItems.filter(i => !i.translated).length} plat(s) non traduit(s)`}
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
              className="text-sm border-none bg-transparent text-white font-medium focus:ring-0 outline-none focus:outline-none cursor-pointer"
            >
              <option value="fr" className="bg-[#1A1A1A] text-white">Français (FR)</option>
              <option value="en" className="bg-[#1A1A1A] text-white">English (EN)</option>
              <option value="es" className="bg-[#1A1A1A] text-white">Español (ES)</option>
              <option value="ar" className="bg-[#1A1A1A] text-white">العربية (AR)</option>
              <option value="de" className="bg-[#1A1A1A] text-white">Deutsch (DE)</option>
              <option value="zh" className="bg-[#1A1A1A] text-white">中文 (ZH)</option>
              <option value="ko" className="bg-[#1A1A1A] text-white">한국어 (KO)</option>
              <option value="pt" className="bg-[#1A1A1A] text-white">Português (PT)</option>
            </select>
          </div>
        </div>

        {/* Menu Items List */}
        {/* Menu Items List */}
        <div className={isPreviewMode ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50" : "divide-y divide-gray-100"}>
          {filteredItems.map(item => {
            // @ts-ignore - dynamic properties
            const currentTranslation = displayLanguage !== 'fr' && item.translations ? item.translations[displayLanguage] : null;
            const displayName = currentTranslation?.name || item.name;
            const displayDesc = currentTranslation?.desc || item.desc;
            
            const defaultImages: Record<string, string> = {
              'Entrées': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop',
              'Plats Principaux': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&h=300&fit=crop',
              'Desserts': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=300&fit=crop',
              'Boissons': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=300&fit=crop'
            };
            const imageSrc = (item as any).image || defaultImages[item.category];
            
            return isPreviewMode ? (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col">
                <div className="aspect-video bg-gray-100 relative group overflow-hidden">
                  <img src={imageSrc} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => playVideo((item as any).video)} className="p-4 bg-white/95 backdrop-blur-sm rounded-full text-indigo-600 hover:scale-110 transition-transform shadow-lg">
                       <MonitorPlay size={28} className="ml-1" />
                     </button>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-bold text-gray-900 shadow-sm">
                    {item.price}
                  </div>
                </div>
                <div className={`p-5 flex-1 flex flex-col ${displayLanguage === 'ar' ? 'text-right' : ''}`} dir={displayLanguage === 'ar' ? 'rtl' : 'ltr'}>
                  <h4 className="font-serif font-medium text-lg text-gray-900 mb-2">{displayName}</h4>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1 leading-relaxed">{displayDesc}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    {item.translated ? (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-green-600 flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md">
                        <Globe size={12} /> Traduit
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md">
                        <AlertTriangle size={12} /> À traduire
                      </span>
                    )}
                    <div className="flex gap-1.5">
                      <button onClick={() => openMediaModal(item, 'video')} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors title='Ajouter une vidéo'"><MonitorPlay size={16}/></button>
                      <button onClick={() => openMediaModal(item, 'image')} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors title='Changer la photo'"><ImageIcon size={16}/></button>
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
                  onClick={() => openMediaModal(item, 'image')}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                  title="Ajouter une photo"
                >
                  <ImageIcon size={18} />
                </button>
                <button 
                  onClick={() => openMediaModal(item, 'video')}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                  title="Ajouter une vidéo"
                >
                  <MonitorPlay size={18} />
                </button>
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

      {/* Media Modal */}
      {isMediaModalOpen && mediaEditingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900 flex items-center gap-2">
                {mediaType === 'image' ? <ImageIcon size={20} className="text-indigo-600"/> : <MonitorPlay size={20} className="text-indigo-600"/>}
                Ajouter {mediaType === 'image' ? 'une photo' : 'une vidéo'}
              </h3>
              <button onClick={() => setIsMediaModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const url = formData.get('mediaUrl') as string;
              
              setMenuItems(items => items.map(item => item.id === mediaEditingItem.id ? {
                ...item,
                [mediaType]: url
              } : item));
              
              showToast(`${mediaType === 'image' ? 'Photo' : 'Vidéo'} ajoutée avec succès`);
              setIsMediaModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de la {mediaType === 'image' ? 'photo' : 'vidéo'}
                  </label>
                  <input 
                    type="url" 
                    name="mediaUrl" 
                    required 
                    defaultValue={mediaEditingItem[mediaType] || ''}
                    placeholder={`https://example.com/${mediaType === 'image' ? 'photo.jpg' : 'video.mp4'}`}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500" 
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {mediaType === 'image' 
                      ? "Pour une meilleure qualité, utilisez une image au format paysage (16:9)."
                      : "Lien vers une vidéo (MP4, WebM ou YouTube)."}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsMediaModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Video Player Modal */}
      {isVideoPlayerOpen && currentVideo ? (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={() => setIsVideoPlayerOpen(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsVideoPlayerOpen(false)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors">
              <X size={20} />
            </button>
            <iframe 
              src={currentVideo.includes('youtube.com/watch?v=') ? currentVideo.replace('watch?v=', 'embed/') : currentVideo} 
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ) : null}

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
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scanMode, setScanMode] = useState<'single'|'multiple'>('single');
  const [multiScanItems, setMultiScanItems] = useState<any[]>([]);
  const [isAutoCreateModalOpen, setIsAutoCreateModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'fournisseurs'), (snapshot) => {
      setFournisseurs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);
  const [txType, setTxType] = useState<'in' | 'out'>('in');
  const [newRecipeForm, setNewRecipeForm] = useState({ name: '', category: 'Entrée' });
  const [newRecipeIngredients, setNewRecipeIngredients] = useState<any[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [ingredientQty, setIngredientQty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const [productionTasks, setProductionTasks] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'productionTasks'), orderBy('createdAt', 'desc')), (snapshot) => {
      setProductionTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      console.error("Error fetching productionTasks", error);
    });
    return () => unsub();
  }, []);

  const [stockItemsData, setStockItemsData] = useState<any[]>([]);

  const categories = useMemo(() => {
    const defaultCats = ['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes', 'Poissons', 'Légumes', 'Boulangerie', 'Produits Laitiers'];
    const dbCats = stockItemsData.map(item => item.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats])).sort();
  }, [stockItemsData]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'inventoryItems'), orderBy('createdAt', 'desc')), (snapshot) => {
      setStockItemsData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      console.error("Error fetching inventoryItems", error);
    });
    return () => unsub();
  }, []);

  const stockItems = stockItemsData.map(item => ({ ...item, status: calculateStockStatus(item.quantity, item.minStock) }));
  
  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const handleExportPDF = () => {
    let printWindow = window.open('', '', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>État de l'Inventaire - Mouda Palace</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #DDA956; padding-bottom: 20px; }
              .logo-text { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; }
              .logo-sub { font-size: 14px; color: #666; letter-spacing: 4px; text-transform: uppercase; margin-top: 5px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
              .info { margin-bottom: 30px; line-height: 1.6; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .footer { text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; position: fixed; bottom: 40px; width: calc(100% - 80px); }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo-text">MOUDA PALACE</div>
              <div class="logo-sub">Restaurant Traditionnel Marocain</div>
            </div>
            <div class="title">RAPPORT D'INVENTAIRE</div>
            
            <div class="info">
              <strong>Date d'édition:</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Catégorie</th>
                  <th>Quantité Actuelle</th>
                  <th>Seuil Min.</th>
                  <th>Fournisseur</th>
                </tr>
              </thead>
              <tbody>
                ${filteredStockItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.category || '-'}</td>
                    <td>${item.quantity || 0} ${item.unit || ''}</td>
                    <td>${item.minStock || 0} ${item.unit || ''}</td>
                    <td>${item.supplier || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              Restaurant Mouda Palace - Fès, Maroc | contact@moudapalace.com | Tél: +212 5 35 XX XX XX
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'inventoryTransactions'), orderBy('createdAt', 'desc')), (snapshot) => {
      setRecentTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      console.error("Error fetching inventoryTransactions", error);
    });
    return () => unsub();
  }, []);

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
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{stockItemsData.length}</h4>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alertes Stock Bas</p>
            <h4 className="text-2xl font-bold text-red-600 mt-1">
              {stockItemsData.filter(i => i.quantity <= i.minStock).length}
            </h4>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Fournisseurs Actifs</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{fournisseurs.length}</h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] flex overflow-x-auto hide-scrollbar p-2 gap-2">
          {['stocks', 'requirements', 'recipes', 'production', 'waste', 'transactions', 'suppliers', 'price_history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab ? 'bg-[#DDA956]/20 text-[#DDA956]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              {tab === 'stocks' && 'Inventaires Actuels'}
              {tab === 'requirements' && 'Besoins & Seuils'}
              {tab === 'recipes' && 'Fiches Techniques & Marges'}
              {tab === 'production' && 'Production Journalière'}
              {tab === 'waste' && 'Pertes & Gaspillage'}
              {tab === 'transactions' && 'Entrées & Sorties'}
              {tab === 'suppliers' && 'Fournisseurs'}
              {tab === 'price_history' && 'Historique des Prix'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-0">
          {activeTab === 'stocks' && (
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                />
              </div>
              <div className="w-full sm:w-64">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                >
                  <option value="Tous">Toutes les catégories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-auto">
                <button 
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg hover:bg-[#c4954b] transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Printer size={16} />
                  Exporter PDF
                </button>
              </div>
            </div>
          )}
          {activeTab === 'stocks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">Produit {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('category')}>
                      <div className="flex items-center gap-1">Catégorie {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('supplier')}>
                      <div className="flex items-center gap-1">Fournisseur {sortConfig.key === 'supplier' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('quantity')}>
                      <div className="flex items-center gap-1">Quantité {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStockItems.map(item => (
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
                          <button 
                            onClick={async () => {
                              if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
                                try {
                                  
                                    await deleteDoc(doc(db, 'inventoryItems', item.id));
                                  
                                  showToast("Produit supprimé");
                                } catch (e) {
                                  console.error(e);
                                  showToast("Erreur lors de la suppression", "error");
                                }
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="overflow-x-auto p-4 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Définition des Besoins et Seuils d'Alerte</h3>
                <button 
                  onClick={() => showToast("Paramètres enregistrés avec succès")}
                  className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm font-medium hover:bg-[#333] transition-colors"
                >
                  Enregistrer les modifications
                </button>
              </div>
              <table className="w-full text-left text-sm whitespace-nowrap border border-gray-100 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4 border-b border-gray-100">Produit</th>
                    <th className="px-6 py-4 border-b border-gray-100">Unité</th>
                    <th className="px-6 py-4 border-b border-gray-100">Quantité Requise (Besoin)</th>
                    <th className="px-6 py-4 border-b border-gray-100">Stock Minimal (Alerte)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {stockItemsData.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                      <td className="px-6 py-4">
                        <input 
                          type="number"
                          className="w-32 border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956] text-gray-900 font-medium"
                          value={item.requiredQty || 0}
                          onChange={(e) => {
                            const newItems = [...stockItemsData];
                            newItems[idx] = { ...newItems[idx], requiredQty: Number(e.target.value) };
                            setStockItemsData(newItems);
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number"
                          className="w-32 border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956] text-gray-900 font-medium"
                          value={item.minStock || 0}
                          onChange={(e) => {
                            const newItems = [...stockItemsData];
                            newItems[idx] = { ...newItems[idx], minStock: Number(e.target.value) };
                            setStockItemsData(newItems);
                          }}
                        />
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
                    const tasks = [
                      { item: "Tagines d'Agneau (Précuisson)", qty: "20 portions", progress: 0, status: "À faire", priority: "Haute", createdAt: serverTimestamp() },
                      { item: "Salades Marocaines", qty: "15 portions", progress: 0, status: "À faire", priority: "Moyenne", createdAt: serverTimestamp() },
                      { item: "Pigeons (Désossage)", qty: "10 pièces", progress: 0, status: "À faire", priority: "Basse", createdAt: serverTimestamp() }
                    ];
                    tasks.forEach(async (t) => await addDoc(collection(db, 'productionTasks'), t));
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
                            onChange={async (e) => {
                              if (task.id) {
                                await updateDoc(doc(db, 'productionTasks', task.id), { priority: e.target.value });
                              }
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
                        <td className="px-6 py-4 text-right">
                          <button onClick={async () => {
                            if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
                              try {
                                if (task.id) await deleteDoc(doc(db, 'productionTasks', task.id));
                              } catch (e) {
                                console.error(e);
                              }
                            }
                          }} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Supprimer">
                            <Trash2 size={16} />
                          </button>
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
                          <button onClick={() => showToast && showToast("Fonctionnalité à venir...")} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Modifier</button>
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
                        {fournisseurs.length > 0 ? fournisseurs.map((supplier, idx) => (
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
                          <button onClick={() => { setSelectedSupplier(supplier); setIsEditSupplierModalOpen(true); }} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Modifier</button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              Aucun fournisseur enregistré.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'price_history' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Historique des prix d'achat</h3>
                <p className="text-sm text-gray-500">Suivez l'évolution des coûts par fournisseur au fil du temps pour optimiser vos achats.</p>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={recentTransactions.filter(tx => tx.type === 'in' && tx.unitPrice).map(tx => ({
                        date: tx.date,
                        prix: tx.unitPrice,
                        fournisseur: tx.supplier || 'Inconnu',
                        produit: tx.item || tx.itemName || 'Produit'
                      })).reverse()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `${val} MAD`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name, props) => [`${value} MAD`, `${props.payload.produit} (${props.payload.fournisseur})`]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="prix" 
                        stroke="#DDA956" 
                        strokeWidth={2}
                        fill="#DDA956" 
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Produit</th>
                      <th className="px-6 py-4">Fournisseur</th>
                      <th className="px-6 py-4 text-right">Quantité</th>
                      <th className="px-6 py-4 text-right">Prix Unitaire</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentTransactions.filter(tx => tx.type === 'in').length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          Aucun achat enregistré.
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.filter(tx => tx.type === 'in').map((tx, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{tx.item || tx.itemName}</td>
                          <td className="px-6 py-4 text-gray-900">{tx.supplier || <span className="text-gray-400 italic">Non spécifié</span>}</td>
                          <td className="px-6 py-4 text-right">{tx.amount || tx.quantity} {tx.unit}</td>
                          <td className="px-6 py-4 text-right font-medium">
                            {tx.unitPrice ? `${tx.unitPrice.toFixed(2)} MAD` : <span className="text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-[#DDA956]">
                            {tx.unitPrice ? `${(tx.unitPrice * (tx.amount || tx.quantity)).toFixed(2)} MAD` : <span className="text-gray-400 italic">-</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
              <button onClick={() => { setIsScannerModalOpen(false); setMultiScanItems([]); }} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button 
                onClick={() => setScanMode('single')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${scanMode === 'single' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Scan Unique
              </button>
              <button 
                onClick={() => setScanMode('multiple')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${scanMode === 'multiple' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Scan Multiple
              </button>
            </div>

            <div className="space-y-4">
              <div className="w-full bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 overflow-hidden relative min-h-[300px]">
                <BarcodeScanner 
                  onResult={(decodedText) => {
                    console.log("Scanned code:", decodedText);
                    const existingProduct = stockItems.find(item => item.barcode === decodedText || item.sku === decodedText || item.id === decodedText);
                    
                    if (scanMode === 'single') {
                      setIsScannerModalOpen(false);
                      if (existingProduct) {
                        showToast(`Produit trouvé : ${existingProduct.name}`, "success");
                        setIsTxModalOpen(true);
                        setSelectedProduct(existingProduct);
                        setTxType('in');
                      } else {
                        showToast(`Nouveau code scanné : ${decodedText}. Redirection vers création...`, "success");
                        setScannedBarcode(decodedText);
                        setIsAutoCreateModalOpen(true);
                      }
                    } else {
                      // Multiple scan mode
                      if (existingProduct) {
                        // Check if already in multiScanItems
                        setMultiScanItems(prev => {
                          const existingIdx = prev.findIndex(p => p.id === existingProduct.id);
                          if (existingIdx >= 0) {
                            const newItems = [...prev];
                            newItems[existingIdx].scanQty += 1;
                            showToast(`Quantité +1 pour ${existingProduct.name}`, "success");
                            return newItems;
                          } else {
                            showToast(`Ajouté : ${existingProduct.name}`, "success");
                            return [...prev, { ...existingProduct, scanQty: 1 }];
                          }
                        });
                      } else {
                        showToast(`Produit inconnu ignoré en scan multiple: ${decodedText}`, "error");
                      }
                    }
                  }} 
                  onError={(err) => {
                    // Ignore frequent read errors from html5-qrcode
                  }} 
                />
              </div>

              {scanMode === 'multiple' && multiScanItems.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Produits scannés ({multiScanItems.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                    {multiScanItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm bg-white px-2 py-1 rounded border border-gray-200">
                            {item.scanQty} {item.unit}
                          </span>
                          <button 
                            onClick={() => setMultiScanItems(prev => prev.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        for (const item of multiScanItems) {
                          const newQuantity = item.quantity + item.scanQty;
                          await updateDoc(doc(db, 'inventoryItems', item.id), {
                            quantity: newQuantity,
                            updatedAt: serverTimestamp()
                          });
                          
                          await addDoc(collection(db, 'inventoryTransactions'), {
                            itemId: item.id,
                            itemName: item.name,
                            type: 'in',
                            quantity: item.scanQty,
                            reason: 'Scan multiple',
                            date: new Date().toLocaleDateString('fr-FR'),
                            user: 'Admin',
                            amount: item.scanQty,
                            unit: item.unit,
                            item: item.name,
                            createdAt: serverTimestamp()
                          });
                        }
                        showToast(`Entrée en stock de ${multiScanItems.length} produits réussie`);
                        setIsScannerModalOpen(false);
                        setMultiScanItems([]);
                      } catch (err) {
                        console.error("Erreur scan multiple", err);
                        showToast("Erreur lors de la mise à jour des stocks", "error");
                      }
                    }}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Valider l'entrée groupée
                  </button>
                </div>
              )}

              {scanMode === 'single' && (
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
              )}
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
                onClick={async () => {
                  try {
                    const newProduct = {
                      name: "Cœur d'Artichaut Extra (Scanné)",
                      category: "Légumes",
                      quantity: 15,
                      unit: "kg",
                      minStock: 5,
                      barcode: scannedBarcode || 'SCANNED-' + Date.now(),
                      createdAt: serverTimestamp()
                    };
                    const docRef = await addDoc(collection(db, 'inventoryItems'), newProduct);
                    
                    await addDoc(collection(db, 'inventoryTransactions'), {
                      itemId: docRef.id,
                      itemName: newProduct.name,
                      type: 'in',
                      quantity: 15,
                      reason: 'Création auto via scan',
                      date: new Date().toLocaleDateString('fr-FR'),
                      user: 'Admin',
                      amount: 15,
                      unit: 'kg',
                      item: newProduct.name,
                      supplier: 'Coop Fès Primeurs',
                      createdAt: serverTimestamp()
                    });
                    
                    showToast("Nouveau produit créé et entrée en stock enregistrée avec succès.", "success");
                    setIsAutoCreateModalOpen(false);
                  } catch (e) {
                    console.error("Error creating from scan", e);
                    showToast("Erreur lors de la création", "error");
                  }
                }}
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors flex items-center justify-center gap-2"
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
                  <input 
                    type="text" 
                    value={newRecipeForm.name}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]" 
                    placeholder="Ex: Tagine de poulet" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={newRecipeForm.category}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, category: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Amuse-bouche">Amuse-bouche</option>
                    <option value="Entrées Froides">Entrées Froides</option>
                    <option value="Entrées Chaudes">Entrées Chaudes</option>
                    <option value="Soupes & Potages">Soupes & Potages</option>
                    <option value="Salades">Salades</option>
                    <option value="Plats Principaux">Plats Principaux</option>
                    <option value="Spécialités du Chef">Spécialités du Chef</option>
                    <option value="Grillades & Rôtis">Grillades & Rôtis</option>
                    <option value="Poissons & Fruits de mer">Poissons & Fruits de mer</option>
                    <option value="Pâtes & Risottos">Pâtes & Risottos</option>
                    <option value="Accompagnements">Accompagnements</option>
                    <option value="Sauces & Condiments">Sauces & Condiments</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Pâtisseries">Pâtisseries</option>
                    <option value="Glaces & Sorbets">Glaces & Sorbets</option>
                    <option value="Boissons Chaudes">Boissons Chaudes</option>
                    <option value="Boissons Froides">Boissons Froides</option>
                    <option value="Cocktails">Cocktails</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Ingrédients depuis l'inventaire</h4>
                </div>
                <div className="flex gap-2 mb-4">
                  <select 
                    value={selectedIngredient}
                    onChange={(e) => setSelectedIngredient(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner un produit...</option>
                    {stockItemsData.map(item => (
                      <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    value={ingredientQty}
                    onChange={(e) => setIngredientQty(e.target.value)}
                    className="w-24 border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#DDA956]" 
                    placeholder="Qté" 
                  />
                  <button 
                    onClick={() => {
                      if (!selectedIngredient || !ingredientQty) {
                        showToast("Veuillez sélectionner un ingrédient et une quantité", "error");
                        return;
                      }
                      const item = stockItemsData.find(i => i.id === selectedIngredient);
                      if (item) {
                        setNewRecipeIngredients([...newRecipeIngredients, {
                          id: item.id,
                          name: item.name,
                          unit: item.unit,
                          quantity: Number(ingredientQty),
                          costPerUnit: item.price || 0
                        }]);
                        setSelectedIngredient('');
                        setIngredientQty('');
                      }
                    }}
                    className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#c4954b]"
                  >
                    Ajouter
                  </button>
                </div>
                
                {newRecipeIngredients.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {newRecipeIngredients.map((ing, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                        <span className="text-sm font-medium">{ing.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{ing.quantity} {ing.unit}</span>
                          <button 
                            onClick={() => {
                              const newArr = [...newRecipeIngredients];
                              newArr.splice(idx, 1);
                              setNewRecipeIngredients(newArr);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => {
                  if (!newRecipeForm.name) {
                    showToast("Veuillez entrer le nom du plat", "error");
                    return;
                  }
                  if (newRecipeIngredients.length === 0) {
                    showToast("Veuillez ajouter au moins un ingrédient", "error");
                    return;
                  }
                  showToast("Fiche technique créée avec succès");
                  setNewRecipeForm({ name: '', category: 'Entrée' });
                  setNewRecipeIngredients([]);
                  setIsNewRecipeModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Sauvegarder Fiche Technique
              </button>
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
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = formData.get('category') as string;
              const unit = formData.get('unit') as string;
              const quantity = Number(formData.get('quantity') || 0);
              
              if (!categories.includes(category)) {
                try {
                  await addDoc(collection(db, 'inventoryCategories'), { name: category });
                } catch (err) {
                  console.error("Error adding category", err);
                }
              }
              
              const newProduct = {
                name,
                category,
                supplier: 'Non renseigné',
                quantity: quantity,
                unit,
                minStock: 10,
                createdAt: serverTimestamp()
              };
              try {
                await addDoc(collection(db, 'inventoryItems'), newProduct);
                showToast("Produit ajouté avec succès");
                setIsAddModalOpen(false);
              } catch (err) {
                console.error("Error adding product", err);
                showToast("Erreur lors de l'ajout", "error");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                <input name="name" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Miel pur" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    name="category"
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-[#DDA956]"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select name="unit" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="unité">unité</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Initiale</label>
                <input name="quantity" required type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 50" />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Ajouter à l'inventaire
              </button>
            </form>
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
                <input id="tx-qty" type="number" min="0" step="0.1" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {txType === 'out' ? 'Destinataire' : 'Raison / Commentaire'}
                </label>
                {txType === 'out' ? (
                  <select id="tx-reason" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                    <option value="">Sélectionner une destination</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Bar">Bar</option>
                  </select>
                ) : (
                  <input id="tx-reason" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Achat du jour" />
                )}
              </div>
              {txType === 'in' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                    <input id="tx-supplier" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: Marché Central" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix U. (MAD)</label>
                    <input id="tx-price" type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="0.00" />
                  </div>
                </div>
              )}
              <button 
                onClick={async () => {
                  const qtyInput = document.getElementById('tx-qty') as HTMLInputElement;
                  const reasonInput = document.getElementById('tx-reason') as HTMLInputElement;
                  const supplierInput = document.getElementById('tx-supplier') as HTMLInputElement;
                  const priceInput = document.getElementById('tx-price') as HTMLInputElement;
                  
                  const qty = Number(qtyInput?.value || 0);
                  if (qty <= 0) {
                    showToast("Veuillez entrer une quantité valide", "error");
                    return;
                  }
                  
                  try {
                    const newQuantity = txType === 'in' ? selectedProduct.quantity + qty : selectedProduct.quantity - qty;
                    
                    if (newQuantity < 0) {
                      showToast("Stock insuffisant pour cette sortie", "error");
                      return;
                    }

                    await updateDoc(doc(db, 'inventoryItems', selectedProduct.id), {
                      quantity: newQuantity,
                      updatedAt: serverTimestamp()
                    });

                    const txData: any = {
                      itemId: selectedProduct.id,
                      itemName: selectedProduct.name,
                      type: txType,
                      quantity: qty,
                      reason: reasonInput?.value || '',
                      date: new Date().toLocaleDateString('fr-FR'),
                      user: 'Admin',
                      amount: qty, // legacy support
                      unit: selectedProduct.unit, // legacy support
                      item: selectedProduct.name, // legacy support
                      createdAt: serverTimestamp()
                    };
                    
                    if (txType === 'in') {
                      txData.supplier = supplierInput?.value || '';
                      txData.unitPrice = Number(priceInput?.value || 0);
                    }
                    
                    await addDoc(collection(db, 'inventoryTransactions'), txData);

                    showToast(`Transaction enregistrée avec succès`);
                    setIsTxModalOpen(false);
                    if (qtyInput) qtyInput.value = '';
                    if (reasonInput) reasonInput.value = '';
                  } catch (err) {
                    console.error("Erreur lors de la transaction", err);
                    showToast("Erreur lors de la mise à jour du stock", "error");
                  }
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input id="edit-cat" type="text" defaultValue={selectedProduct.category} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                  <div className="flex items-center gap-2">
                    <input id="edit-qty" type="number" step="0.01" defaultValue={selectedProduct.quantity} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte (Min. Stock)</label>
                <div className="flex items-center gap-2">
                  <input id="edit-min" type="number" defaultValue={selectedProduct.minStock} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                  <span className="text-gray-500 text-sm">{selectedProduct.unit}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur Préféré</label>
                <input id="edit-sup" type="text" defaultValue={selectedProduct.supplier} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                onClick={async () => {
                  const newCat = (document.getElementById('edit-cat') as HTMLInputElement)?.value;
                  const newQty = Number((document.getElementById('edit-qty') as HTMLInputElement)?.value);
                  const newMin = Number((document.getElementById('edit-min') as HTMLInputElement)?.value);
                  const newSup = (document.getElementById('edit-sup') as HTMLInputElement)?.value;
                  
                  if (selectedProduct.id) {
                    try {
                      await updateDoc(doc(db, "inventoryItems", selectedProduct.id), {
                        category: newCat,
                        quantity: newQty,
                        minStock: newMin,
                        supplier: newSup,
                        updatedAt: serverTimestamp()
                      });
                      showToast(`Paramètres mis à jour pour ${selectedProduct.name}`);
                    } catch (err) {
                      console.error("Erreur update", err);
                      showToast("Erreur lors de la mise à jour", "error");
                    }
                  }
                  setIsSettingsModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Sauvegarder
              </button>
              <button 
                onClick={async () => {
                  if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
                    try {
                      
                        await deleteDoc(doc(db, 'inventoryItems', selectedProduct.id));
                      
                      showToast("Produit supprimé");
                      setIsSettingsModalOpen(false);
                    } catch (e) {
                      console.error(e);
                      showToast("Erreur lors de la suppression", "error");
                    }
                  }
                }}
                className="w-full bg-white text-red-500 border border-red-200 py-3 rounded-xl font-medium mt-2 hover:bg-red-50 transition-colors"
              >
                Supprimer le produit
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
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const supplier = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              const articles = formData.get('articles') as string;
              
              let fileContent = `BON DE COMMANDE\n\n`;
              fileContent += `Émetteur : Restaurant Mouda Palace\n`;
              fileContent += `Date d'émission : ${new Date().toLocaleDateString('fr-FR')}\n`;
              fileContent += `Fournisseur : ${supplier}\n`;
              fileContent += `Date de livraison prévue : ${deliveryDate}\n\n`;
              fileContent += `Articles commandés :\n${articles}\n\n`;
              fileContent += `Merci de bien vouloir confirmer la réception de cette commande.\n`;
              
              const encodedUri = encodeURI("data:text/plain;charset=utf-8," + fileContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `Bon_de_commande_${supplier.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.txt`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              
              showToast("Commande validée et bon de commande généré");
              setIsNewOrderModalOpen(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select name="supplier" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                  <option>Coopérative Taliouine</option>
                  <option>Ferme Atlas</option>
                  <option>Boucherie Centrale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison prévue</label>
                <input name="deliveryDate" type="date" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Articles</label>
                <textarea name="articles" required rows={3} placeholder="Ex: Safran 500g, Huile d'olive 20L..." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none"></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Valider la Commande
              </button>
            </form>
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
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = formData.get('category') as string;
              const contact = formData.get('contact') as string;
              const phone = formData.get('phone') as string;
              const email = formData.get('email') as string;
              const city = formData.get('city') as string;
              
              const newFournisseur = {
                  name,
                  category,
                  contact,
                  phone,
                  email,
                  city,
                  createdAt: serverTimestamp()
              };
              
              showToast("Ajout en cours...");
              setIsNewSupplierModalOpen(false);
              try {
                await addDoc(collection(db, 'fournisseurs'), newFournisseur);
                showToast("Fournisseur ajouté avec succès");
              } catch (err) {
                console.error(err);
                showToast("Erreur lors de l'ajout", "error");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input name="name" type="text" required placeholder="Ex: Grossiste Bio Plus" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input name="category" type="text" required placeholder="Ex: Fruits & Légumes" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input name="city" type="text" required placeholder="Ex: Fès" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personne à contacter</label>
                <input name="contact" type="text" required placeholder="Ex: Ahmed" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" type="text" required placeholder="Ex: +212..." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" placeholder="Ex: contact@bioplus.ma" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Ajouter le Fournisseur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier Fournisseur */}
      {isEditSupplierModalOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsEditSupplierModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Modifier Fournisseur</h3>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = formData.get('category') as string;
              const contact = formData.get('contact') as string;
              const phone = formData.get('phone') as string;
              const email = formData.get('email') as string;
              const city = formData.get('city') as string;
              
              const updatedData = {
                  name,
                  category,
                  contact,
                  phone,
                  email,
                  city
              };
              
              showToast("Modification en cours...");
              setIsEditSupplierModalOpen(false);
              try {
                if (selectedSupplier.id) {
                  await updateDoc(doc(db, 'fournisseurs', selectedSupplier.id), updatedData);
                  showToast("Fournisseur mis à jour avec succès");
                }
              } catch (err) {
                console.error(err);
                showToast("Erreur lors de la modification", "error");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input name="name" type="text" required defaultValue={selectedSupplier.name} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input name="category" type="text" required defaultValue={selectedSupplier.category} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input name="city" type="text" required defaultValue={selectedSupplier.city} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personne à contacter</label>
                <input name="contact" type="text" required defaultValue={selectedSupplier.contact} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" type="text" required defaultValue={selectedSupplier.phone} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" defaultValue={selectedSupplier.email} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors"
                >
                  Mettre à jour
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    if (window.confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) {
                      try {
                        setIsEditSupplierModalOpen(false);
                        if (selectedSupplier.id) {
                          await deleteDoc(doc(db, 'fournisseurs', selectedSupplier.id));
                          showToast("Fournisseur supprimé");
                        }
                      } catch (e) {
                        console.error(e);
                        showToast("Erreur lors de la suppression", "error");
                      }
                    }
                  }}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function Configuration() {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [websiteConfig, setWebsiteConfig] = useState({
    url: 'https://moudapalace.com',
    username: '',
    password: '',
    webhookUrl: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    const loadWebsiteConfig = async () => {
      try {
        const docRef = doc(db, 'settings', 'website');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWebsiteConfig(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration du site web:", error);
      }
    };
    loadWebsiteConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeSettingsTab === 'website') {
        const docRef = doc(db, 'settings', 'website');
        await setDoc(docRef, websiteConfig, { merge: true });
        
        // Also update webhook for backward compatibility with BlogWriter
        const webhookRef = doc(db, 'settings', 'webhook');
        await setDoc(webhookRef, { url: websiteConfig.webhookUrl }, { merge: true });
      }
      showToast("Paramètres sauvegardés avec succès");
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
      showToast("Erreur lors de la sauvegarde", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Configuration</h2>
          <p className="text-gray-500">Paramètres généraux de l'établissement.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#333] transition-colors disabled:opacity-50">
          <Save size={18} />
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex flex-col gap-2">
          <SettingsTab active={activeSettingsTab === 'general'} onClick={() => setActiveSettingsTab('general')} icon={<Building size={18} />} label="Général" />
          <SettingsTab active={activeSettingsTab === 'integrations'} onClick={() => setActiveSettingsTab('integrations')} icon={<Globe size={18} />} label="Intégrations & IA" />
          <SettingsTab active={activeSettingsTab === 'website'} onClick={() => setActiveSettingsTab('website')} icon={<Globe size={18} />} label="Site Web (moudapalace.com)" />
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

          {activeSettingsTab === 'website' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 text-[#1A1A1A]">Configuration du site web</h3>
              <p className="text-sm text-gray-500 mb-6">Paramétrez les accès à votre site WordPress (moudapalace.com) et les webhooks d'automatisation (Make.com, Zapier).</p>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Info size={18} /> Comment configurer l'accès WordPress ?
                </h4>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1.5 ml-1">
                  <li>Connectez-vous à l'administration de votre site WordPress (avec votre mot de passe <strong>habituel</strong>).</li>
                  <li>Allez dans le menu <strong>Utilisateurs &gt; Profil</strong> (en haut à droite).</li>
                  <li>Descendez jusqu'à la section <strong>Mots de passe d'application</strong>.</li>
                  <li>Saisissez un nom (ex: "SaaS Mouda Palace") et cliquez sur <strong>Ajouter un nouveau mot de passe</strong>.</li>
                  <li>Copiez le mot de passe généré et collez-le ci-dessous. <em>(Ne l'utilisez pas pour vous connecter à WordPress manuellement)</em>.</li>
                </ol>
                <div className="mt-3 text-xs text-blue-700 bg-blue-100/50 p-2 rounded">
                  <strong>⚠️ Erreur 401 lors de la publication ?</strong> Si vos identifiants sont corrects, votre hébergeur bloque probablement les requêtes API. Ajoutez cette ligne au début de votre fichier <code>.htaccess</code> à la racine de votre site : <br/>
                  <code className="select-all bg-white px-2 py-1 mt-2 inline-block rounded border border-blue-200">SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1</code>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL du site</label>
                  <input 
                    type="url" 
                    value={websiteConfig.url} 
                    onChange={e => setWebsiteConfig({...websiteConfig, url: e.target.value})} 
                    placeholder="https://moudapalace.com" 
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant administrateur</label>
                    <input 
                      type="text" 
                      value={websiteConfig.username} 
                      onChange={e => setWebsiteConfig({...websiteConfig, username: e.target.value})} 
                      placeholder="admin" 
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe d'application</label>
                    <input 
                      type="password" 
                      value={websiteConfig.password} 
                      onChange={e => setWebsiteConfig({...websiteConfig, password: e.target.value})} 
                      placeholder="xxxx xxxx xxxx xxxx" 
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Générez ce mot de passe dans votre profil WordPress.</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Automatisation (Webhook)</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL du Webhook de publication (Make.com)</label>
                    <input 
                      type="url" 
                      value={websiteConfig.webhookUrl} 
                      onChange={e => setWebsiteConfig({...websiteConfig, webhookUrl: e.target.value})} 
                      placeholder="https://hook.eu1.make.com/..." 
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Cette URL est utilisée par le module de rédaction IA pour publier directement sur votre site.</p>
                  </div>
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
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "url('/img1.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-24 bg-[#DDA956] mb-6" style={{
            maskImage: 'url(/mouda-1.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url(/mouda-1.png)',
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
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] to-[#2a2a2a] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "url('/img1.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
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
  const [journalOperatorFilter, setJournalOperatorFilter] = useState('');
  const [journalCurrentPage, setJournalCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isImportTacModalOpen, setIsImportTacModalOpen] = useState(false);
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

  const filteredJournal = fullJournalMovements.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(journalSearch.toLowerCase()) || 
                          tx.user.toLowerCase().includes(journalSearch.toLowerCase()) ||
                          tx.type.toLowerCase().includes(journalSearch.toLowerCase());
    const matchesOperator = journalOperatorFilter === '' || tx.user === journalOperatorFilter;
    return matchesSearch && matchesOperator;
  });

  const uniqueOperators = Array.from(new Set(fullJournalMovements.map(tx => tx.user)));
  const totalJournalPages = Math.ceil(filteredJournal.length / ITEMS_PER_PAGE);
  const paginatedJournal = filteredJournal.slice((journalCurrentPage - 1) * ITEMS_PER_PAGE, journalCurrentPage * ITEMS_PER_PAGE);

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
             onClick={() => setIsImportTacModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200"
          >
            <Upload size={16} /> Importer (Fichier)
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors shadow-sm disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {isSyncing ? 'Synchronisation API' : 'Synchroniser API'}
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

      
      {/* Evolution du Chiffre d'Affaires */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 p-6">
        <div className="mb-6">
          <h3 className="font-serif text-lg font-medium text-gray-900">Évolution du Chiffre d'Affaires (Aujourd'hui)</h3>
          <p className="text-sm text-gray-500">Données en temps réel (MAD)</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { time: '08:00', ca: 0 },
                { time: '10:00', ca: 1200 },
                { time: '12:00', ca: 3500 },
                { time: '14:00', ca: 8900 },
                { time: '16:00', ca: 10500 },
                { time: '18:00', ca: 14500 }
              ]}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `${val} MAD`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value} MAD`, "Chiffre d'affaires"]}
                labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="ca" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
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
                  onChange={(e) => { setJournalSearch(e.target.value); setJournalCurrentPage(1); }}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
              <div className="w-full md:w-64">
                <select 
                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] bg-white text-gray-700"
                  value={journalOperatorFilter}
                  onChange={(e) => { setJournalOperatorFilter(e.target.value); setJournalCurrentPage(1); }}
                >
                  <option value="">Tous les opérateurs</option>
                  {uniqueOperators.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
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
                  {paginatedJournal.length > 0 ? (
                    paginatedJournal.map((tx, idx) => (
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
            
            {/* Pagination UI */}
            {totalJournalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                <span className="text-sm text-gray-500">
                  Affichage de {((journalCurrentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(journalCurrentPage * ITEMS_PER_PAGE, filteredJournal.length)} sur {filteredJournal.length} transactions
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setJournalCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={journalCurrentPage === 1}
                    className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <button 
                    onClick={() => setJournalCurrentPage(prev => Math.min(prev + 1, totalJournalPages))}
                    disabled={journalCurrentPage === totalJournalPages}
                    className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* API Configuration Modal */}
      {/* Import TacSystems Modal */}
      {isImportTacModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-serif font-semibold text-gray-900">
                Importer Journal de Caisse
              </h3>
              <button 
                onClick={() => setIsImportTacModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Importez un export de journal de caisse depuis le backoffice de TacSystems si vous n'êtes pas connecté par API.
                </p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#DDA956] transition-colors bg-gray-50 cursor-pointer">
                  <div className="flex justify-center mb-2 text-gray-400">
                    <Upload size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Cliquez ou glissez un fichier ici</p>
                  <p className="text-xs text-gray-500">Formats supportés: .CSV, .XLS, .XLSX (Export TacSystems)</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setIsImportTacModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    showToast("Importation du journal de caisse démarrée...");
                    setIsImportTacModalOpen(false);
                  }}
                  className="px-4 py-2 bg-[#DDA956] text-[#1A1A1A] rounded-lg text-sm font-medium hover:bg-[#c4954b] transition-colors"
                >
                  Sélectionner un fichier
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
