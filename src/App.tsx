import SyncStatusPanel from "./components/SyncStatusPanel";
import MenuGenerator from "./MenuGenerator";
import BarcodeScanner from "./components/BarcodeScanner";
import ConfirmModal from "./components/ConfirmModal";
import Combobox from "./components/Combobox";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode, useMemo, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { calculateStockStatus } from './lib/inventoryUtils';
import { computeRecipeCost } from './lib/recipeCost';
import { resolveItemPrice } from './lib/priceUtils';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineChart, Line } from 'recharts';
import { 
  FileSpreadsheet,
  ChefHat, 
  Users, 
  MessageCircle, 
  Settings, Database, 
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
AlertCircle, Monitor, Calendar, File, Heart , Layers, CalendarClock, Edit, User, Edit3, Activity, LayoutDashboard } from 'lucide-react';
import { isCriticalStock } from './lib/inventory';
import { useAuth, AUTHORIZED_EMAILS } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { signInWithPopup, googleProvider, auth, signOut, db } from './firebase';
import { collection, query, onSnapshot, doc, getDoc, setDoc, addDoc, serverTimestamp, updateDoc, orderBy, deleteDoc, writeBatch } from 'firebase/firestore';
const Accounting = lazy(() => import('./Accounting'));
const BlogWriterAI = lazy(() => import('./BlogWriterAI'));
import SeoAnalyticsContainer from './components/SeoAnalyticsContainer';
import Documentation from "./Documentation";
import GuideEcrans from "./GuideEcrans";
import AchatsFournisseurs from "./AchatsFournisseurs";
import CatalogueProduits from "./CatalogueProduits";
import FichesTechniques from "./FichesTechniques";
import ProductionJournaliere from "./ProductionJournaliere";
import TableauDeBord from "./TableauDeBord";
import GestionTables from "./GestionTables";
import POSTactile from "./POSTactile";
import EcranCuisine from "./EcranCuisine";
import DeviceManagement from "./DeviceManagement";
import DeviceSimulator from "./DeviceSimulator";
import SystemMonitoring from "./SystemMonitoring";
import LivePlanningWidget from "./components/LivePlanningWidget";
const RH = lazy(() => import('./RH'));
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
          className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4C75B] resize-none h-32"
          placeholder="Collez un avis client ici pour l'analyser avec l'IA..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <button 
          onClick={analyzeReview}
          disabled={loading || !review}
          className="flex items-center gap-2 bg-[#265C6D] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#2F6B7F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

const NavCategory = ({ title, icon, isExpanded, onClick, children }: any) => (
  <div className="mb-2">
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
        isExpanded 
          ? 'bg-[#F4C75B] text-[#265C6D] shadow-lg shadow-[#F4C75B]/20' 
          : 'text-[#F4C75B] border border-[#F4C75B]/30 hover:border-[#F4C75B] hover:bg-[#F4C75B]/10'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="tracking-wide">{title}</span>
      </div>
      <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[400px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="flex flex-col space-y-1 pl-4 border-l-2 border-[#F4C75B]/20 ml-6 py-1">
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
        ? 'bg-[#2F6B7F] text-white shadow-sm' 
        : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-[#E8E6E1]'
    }`}
  >
    <span className={`${active ? 'text-[#F4C75B]' : 'text-gray-500'}`}>{icon}</span>
    {label}
  </button>
);

function OrderArticlesField({ stockItemsData }: { stockItemsData: any[] }) {
  const [articles, setArticles] = useState<{name: string, qty: string}[]>([]);
  const [currentArticle, setCurrentArticle] = useState('');
  const [currentQty, setCurrentQty] = useState('');

  const addArticle = () => {
    if (currentArticle && currentQty) {
      setArticles([...articles, { name: currentArticle, qty: currentQty }]);
      setCurrentArticle('');
      setCurrentQty('');
    }
  };

  const removeArticle = (idx: number) => {
    setArticles(articles.filter((_, i) => i !== idx));
  };

  const allItems = Array.from(new Set((stockItemsData || []).map((item: any) => item.name))).sort();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Articles</label>
      
      {articles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
          {articles.map((art, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 text-sm">
              <span className="font-medium">{art.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">{art.qty}</span>
                <button type="button" onClick={() => removeArticle(idx)} className="text-red-500 hover:text-red-700">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <Combobox
            options={allItems}
            value={currentArticle}
            onChange={val => setCurrentArticle(val)}
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#F4C75B]"
            placeholder="Nom de l'article"
          />
        </div>
        <div className="w-24">
          <input 
            type="text"
            value={currentQty}
            onChange={e => setCurrentQty(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#F4C75B]" 
            placeholder="Qté" 
          />
        </div>
        <button 
          type="button" 
          onClick={addArticle}
          disabled={!currentArticle || !currentQty}
          className="px-3 bg-[#265C6D] text-white rounded-lg hover:bg-[#2F6B7F] disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <Plus size={18} />
        </button>
      </div>

      <input 
        type="hidden" 
        name="articles" 
        value={articles.map(a => `${a.name} (${a.qty})`).join('')} 
      />
    </div>
  );
}


const normalizeCategory = (cat: string) => {
  if (!cat) return cat;
  const c = cat.trim();
  if (c === 'Épicerie Sèche' || c === 'Epicerie Sèche' || c === 'Épicerie & Sec' || c === 'Épicerie & sec') return 'Épicerie';
  if (c === 'Fruits' || c === 'Légumes' || c === 'Fruits & Légumes' || c === 'Fruits et légumes' || c === 'Légumes & Fruits') return 'Fruits & Légumes';
  if (c === 'Poissons' || c === 'Poissons & Fruits de mer' || c === 'Poissons et fruits de mer') return 'Poissons & Fruits de mer';
  if (c === 'Viandes' || c === 'Viande') return 'Viandes';
  if (c === 'Produits d\'entretien' || c === 'Produits de maintenance' || c === 'Hygiène & Entretien') return 'Hygiène & Entretien';
  if (c === 'Boulangerie & Pâtisserie' || c === 'Boulangerie & Patisserie' || c === 'Boulangerie et Pâtisserie' || c === 'Boulangerie et Patisserie' || c === 'Pâtisserie' || c === 'Patisserie') return 'Patisseie';
  return c;
};


const getCategoryImageUrl = (category: string) => {
  const images: Record<string, string> = {
    'Fruits & Légumes': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=150&q=80',
    'Poissons & Fruits de mer': 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=150&q=80',
    'Viandes': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=150&q=80',
    'Volailles': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=150&q=80',
    'Épices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=150&q=80',
    'Boissons': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=150&q=80',
    'Produits Laitiers': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=150&q=80',
    'Boulangerie': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80',
    'Patisseie': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80',
    'Herbes': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=150&q=80',
    'Fruits Secs': 'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=150&q=80',
    'Épicerie': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80',
    'Boissons Alcoolisées': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=150&q=80',
    'Sauces': 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=150&q=80',
    'Conserves': 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=150&q=80',
    'Sirops': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=150&q=80',
    "Matériel": 'https://images.unsplash.com/photo-1550159930-40066082a4fc?auto=format&fit=crop&w=150&q=80',
    "Matériel Cuisine": 'https://images.unsplash.com/photo-1550159930-40066082a4fc?auto=format&fit=crop&w=150&q=80',
    "Services": 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=150&q=80',
    "Hygiène & Entretien": 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=150&q=80',
    "Fruits": 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=150&q=80',
    "Légumes": 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=150&q=80',
    "Poissons": 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=150&q=80'
  };
  return images[category] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80';
};


function useAutoSave<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    if (state !== undefined) {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
}

const AutoSaveForm = ({ formId, children, ...props }: any) => {
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem(`autosave_${formId}`);
    if (saved && formRef.current) {
      try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          const el = formRef.current?.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (el) el.value = data[key];
        });
      } catch(e: any) {
        console.error('Error loading autosave:', e);
      }
    }
  }, [formId]);

  const handleChange = () => {
    if (formRef.current) {
      const requiredElements = formRef.current.querySelectorAll('[required]');
      let allValid = true;
      requiredElements.forEach((el) => {
        if ((el as HTMLInputElement).value.trim() === '') {
          allValid = false;
        }
      });
      
      if (allValid) {
        const formData = new FormData(formRef.current);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem(`autosave_${formId}`, JSON.stringify(data));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (props.onSubmit) {
      try {
        await props.onSubmit(e);
        localStorage.removeItem(`autosave_${formId}`);
      } catch(err) {
        console.error(err);
      }
    } else {
       e.preventDefault();
    }
  };

  return (
    <form ref={formRef} onChange={handleChange} {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

function App() {
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
    { type: 'Production', text: 'Fiches Techniques', tab: 'recettes', keywords: ['cuisine', 'préparation', 'ingrédients', 'recette', 'fiche technique', 'marge', 'food cost'] },
    { type: 'Production', text: 'Liste des Produits', tab: 'catalogue_produits', keywords: ['produits', 'origine', 'traçabilité', 'fournisseur', 'achat', 'catalogue'] },
    { type: 'Clientèle', text: 'Réservations', tab: 'reservations', keywords: ['clients', 'table', 'dîner', 'déjeuner', 'réserver'] },
    { type: 'Clientèle', text: 'Menus digitaux', tab: 'menu', keywords: ['carte', 'plats', 'boissons', 'desserts', 'tajine', 'couscous', 'pastilla', 'menu'] },
    { type: 'Clientèle', text: 'Tables', tab: 'tables', keywords: ['plan', 'salle', 'service', 'placement'] },
    { type: 'Clientèle', text: 'Partenaires B2B', tab: 'b2b', keywords: ['agences', 'tourisme', 'riad', 'hôtel', 'crm', 'partenaires'] },
    { type: 'Gestion', text: 'Comptabilité', tab: 'accounting', keywords: ['finances', 'bilan', 'revenus', 'dépenses', 'chiffre d\'affaires', 'compta'] },
    { type: 'Gestion', text: 'Caisse / POS Tactile', tab: 'finance', keywords: ['pos', 'encaissement', 'factures', 'paiement', 'commandes', 'caisse'] },
    { type: 'RH', text: 'RH personnel', tab: 'staff', keywords: ['employés', 'personnel', 'salaires', 'présence', 'équipe', 'rh', 'planning'] },
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
      const result = await signInWithPopup(auth, googleProvider);
      if (AUTHORIZED_EMAILS.includes(result.user.email || '')) {
        showToast("Connexion réussie");
      } else {
        showToast("Accès non autorisé pour cet email.", "error");
      }
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
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-serif text-[#F4C75B]">Chargement...</div>;
  }

  if (appMode === 'selection') {
    return <PortalSelection onSelect={setAppMode} />;
  }

  if (appMode === 'partner') {
    return <PartnerPortal onBack={() => setAppMode('selection')} />;
  }

  if (appMode === 'admin' && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#265C6D] to-[#1A1A1A] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl text-center">
            <h1 className="text-3xl font-serif text-[#265C6D] font-semibold tracking-wide mb-1">MOUDA PALACE</h1>
            <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mb-8">Espace Administration</p>
            <p className="text-gray-500 text-sm mb-8">Connexion requise pour accéder au tableau de bord.</p>
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-[#F4C75B] text-[#265C6D] py-3 px-4 rounded-lg font-medium hover:bg-[#E5B745] transition-colors mb-4"
            >
              <LogIn size={18} />
              <span>Connexion avec Google</span>
            </button>
            <button
              onClick={() => setAppMode('selection')}
              className="w-full text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Retour à l'accueil
            </button>
          </div>
        </motion.div>
      </div>
    );
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
      case 'catalogue_produits':
        return <CatalogueProduits />;
      case 'recettes':
        return <FichesTechniques />;
      case 'production_jour':
        return <ProductionJournaliere />;
      case 'dashboard':
        return <TableauDeBord />;
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
      <div className="print:hidden md:hidden flex items-center justify-between bg-[#265C6D] p-4 text-[#F4C75B] z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <div 
             className="h-10 w-12 bg-[#F4C75B]" 
             style={{
              maskImage: 'url(/mouda-1-1-1.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: 'url(/mouda-1-1-1.png)',
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
      
      <aside className={`print:hidden ${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex shrink-0 w-full md:w-80 bg-[#265C6D] text-[#E8E6E1] p-6 flex-col border-r border-[#2F6B7F] fixed md:sticky inset-0 md:inset-auto md:top-0 h-screen z-[100] md:z-40 overflow-y-auto`}>
        
        {/* Mobile Sidebar Header */}
        <div className="md:hidden flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
                className="h-10 w-12 bg-[#F4C75B]"
                style={{
                maskImage: 'url(/mouda-1-1-1.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: 'url(/mouda-1-1-1.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center'
              }}
            />
            <span className="font-serif font-normal tracking-[0.1em] uppercase text-base text-white">Mouda Palace</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#E8E6E1] p-1">
            <X size={28} />
          </button>
        </div>

        <div className="mb-12 hidden md:flex flex-col items-center text-center">
          <div 
            className="h-24 w-32 mb-4 bg-[#F4C75B]" 
            style={{
              maskImage: 'url(/mouda-1-1-1.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: 'url(/mouda-1-1-1.png)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center'
            }}
            title="Mouda Palace Logo"
          />
          <h1 className="text-xl font-serif text-[#F4C75B] font-normal tracking-[0.15em] uppercase">
            Mouda Palace
          </h1>
          <a href="https://moudapalace.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-400 mt-2 block uppercase tracking-widest hover:text-[#F4C75B] transition-colors">
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
              className="w-full bg-[#222] text-[#E8E6E1] placeholder-gray-500 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#F4C75B] border border-[#2F6B7F]"
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#222] border border-[#2F6B7F] rounded-lg shadow-xl overflow-hidden z-50">
              {filteredSearch.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto">
                  {filteredSearch.map((item, idx) => (
                    <li key={idx} className="px-4 py-3 hover:bg-[#2F6B7F] cursor-pointer transition-colors border-b border-[#2F6B7F] last:border-0" onClick={() => { setSearchQuery(''); handleTabChange(item.tab); setIsMobileMenuOpen(false); }}>
                      <div className="text-xs text-[#F4C75B] font-medium mb-1 uppercase tracking-wider">{item.type}</div>
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

        <div className="flex-1 overflow-y-auto pr-2 pb-8 scrollbar-thin scrollbar-thumb-[#2F6B7F] scrollbar-track-transparent">
          <div className="mb-4 text-[#F4C75B] font-serif text-lg tracking-wider font-semibold border-b border-[#2F6B7F] pb-2">
            Tableau de Bord
          </div>
          
          <button
            onClick={() => handleTabChange('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 ${
              activeTab === 'overview'
                ? 'bg-[#F4C75B] text-[#265C6D] shadow-lg shadow-[#F4C75B]/20'
                : 'text-[#F4C75B] border border-[#F4C75B]/30 hover:border-[#F4C75B] hover:bg-[#F4C75B]/10'
            }`}
          >
            <TrendingUp size={18} />
            <span>Vue d'ensemble</span>
          </button>

          <button
            onClick={() => handleTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium mb-4 ${
              activeTab === 'dashboard'
                ? 'bg-[#F4C75B] text-[#265C6D] shadow-lg shadow-[#F4C75B]/20'
                : 'text-[#F4C75B] border border-[#F4C75B]/30 hover:border-[#F4C75B] hover:bg-[#F4C75B]/10'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Tableau de Bord Exécutif</span>
          </button>




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


          <button
            onClick={() => handleTabChange('menu')}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold mb-6 border-2 shadow-sm ${
              activeTab === 'menu'
                ? 'bg-[#F4C75B] text-[#265C6D] border-[#F4C75B] shadow-[#F4C75B]/30'
                : 'text-[#F4C75B] border-[#F4C75B]/50 hover:border-[#F4C75B] hover:bg-[#F4C75B]/10'
            }`}
          >
            <div className="flex items-center gap-3">
               <Printer size={18} />
               <span>Génération du Menu</span>
            </div>
            <Sparkles size={16} className="text-[#F4C75B] opacity-70" />
          </button>

          <NavCategory 
            title="Production" 
            icon={<ChefHat size={18} />} 
            isExpanded={expandedCategory === 'production'} 
            onClick={() => setExpandedCategory(expandedCategory === 'production' ? null : 'production')}
          >
            <SubNavItem icon={<Package size={16} />} label="État des Stocks" active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} />
            <SubNavItem icon={<ShoppingCart size={16} />} label="Achats fournisseurs" active={activeTab === 'achats'} onClick={() => handleTabChange('achats')} />
            <SubNavItem icon={<UtensilsCrossed size={16} />} label="Fiches Techniques" active={activeTab === 'recettes'} onClick={() => handleTabChange('recettes')} />
            <SubNavItem icon={<Activity size={16} />} label="Ordres de Fabrication" active={activeTab === 'production_jour'} onClick={() => handleTabChange('production_jour')} />
            <SubNavItem icon={<Truck size={16} />} label="Liste des Produits" active={activeTab === 'catalogue_produits'} onClick={() => handleTabChange('catalogue_produits')} />
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

        <div className="mt-auto pt-4 border-t border-[#2F6B7F]">
          <div className="flex items-center justify-between gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F4C75B] flex items-center justify-center text-[#265C6D] font-medium overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt={user.displayName || 'User'} /> : (user.displayName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium truncate max-w-[120px]">{user.displayName || user.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500 capitalize">{role || 'User'}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2F6B7F]">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button onClick={handleLogin} className="w-full flex items-center justify-center gap-2 bg-[#F4C75B] text-[#265C6D] py-2 px-4 rounded-lg font-medium text-sm hover:bg-[#E5B745] transition-colors">
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
            <Suspense fallback={<div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4"><div className="w-8 h-8 border-4 border-[#F4C75B] border-t-transparent rounded-full animate-spin"></div><p>Chargement du module...</p></div>}>
              {renderContent()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

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
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#265C6D] text-white p-3 rounded-full shadow-lg hover:bg-black transition-colors z-50 print:hidden flex items-center gap-2 px-6"
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
  const [averageMargin, setAverageMargin] = useState(0);
  const [fichesTechniques, setFichesTechniques] = useState<any[]>([]);
  const [stockItemsData, setStockItemsData] = useState<any[]>([]);
  const [reservationsData, setReservationsData] = useState<any[]>([]);

  useEffect(() => {
    const unsubFiches = onSnapshot(collection(db, 'fiches_techniques'), (snapshot) => {
      setFichesTechniques(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsubStock = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      setStockItemsData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsubRes = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      setReservationsData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsubFiches(); unsubStock(); unsubRes(); };
  }, []);

  useEffect(() => {
    let totalMargin = 0;
    let count = 0;

    fichesTechniques.forEach(recipe => {
      const pv = Number(recipe.prixVente);
      if (pv > 0) {
        const { totalCost } = computeRecipeCost(recipe, stockItemsData);
        const margin = ((pv - totalCost) / pv) * 100;
        totalMargin += margin;
        count++;
      }
    });

    setAverageMargin(count > 0 ? totalMargin / count : 0);
  }, [fichesTechniques, stockItemsData]);

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    reservationsData.forEach((r: any) => {
      const src = r.source || 'Autre';
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reservationsData]);

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Marge Bénéficiaire Moyenne</p>
            <h3 className="text-2xl font-bold text-gray-900">{(Number(averageMargin) || 0).toFixed(1)}%</h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp size={12} className="mr-1" /> Basé sur les fiches techniques
            </p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
      {/* Répartition des Sources (BarChart) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
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
              <Bar dataKey="value" fill="#265C6D" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      </div>
    </div>
  );
}

function Overview({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { showToast } = useToast();
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

  const expiringItems = inventoryItems.filter(i => {
    if (!i.expirationDate) return false;
    const expDate = new Date(i.expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const expiredItems = inventoryItems.filter(i => {
    if (!i.expirationDate) return false;
    const expDate = new Date(i.expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expDate < today;
  });
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [reservationsData, setReservationsData] = useState<any[]>([]);
  const [cashReceipts, setCashReceipts] = useState<any[]>([]);
  const [partnersData, setPartnersData] = useState<any[]>([]);

  useEffect(() => {
    const unsubRes = onSnapshot(collection(db, 'reservations'), (snap) => setReservationsData(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubCash = onSnapshot(collection(db, 'cash_receipts'), (snap) => setCashReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubPartners = onSnapshot(collection(db, 'partners'), (snap) => setPartnersData(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubRes(); unsubCash(); unsubPartners(); };
  }, []);

  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (dateRange === 'week') {
      start = new Date(now); start.setDate(now.getDate() - 7);
    } else if (dateRange === 'month') {
      start = new Date(now); start.setDate(now.getDate() - 30);
    } else if (dateRange === 'year') {
      start = new Date(now); start.setDate(now.getDate() - 365);
    } else if (dateRange === 'custom') {
      start = new Date(customStartDate);
      end = new Date(customEndDate); end.setHours(23, 59, 59, 999);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    return { rangeStart: start, rangeEnd: end };
  }, [dateRange, customStartDate, customEndDate]);

  const parseDocDate = (d: any) => d?.toDate ? d.toDate() : new Date(d || 0);
  const inRange = (d: Date) => d >= rangeStart && d <= rangeEnd;

  const receiptsInRange = cashReceipts.filter(r => inRange(parseDocDate(r.createdAt || r.date)));
  const revenueInRange = receiptsInRange.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const aovInRange = receiptsInRange.length > 0 ? revenueInRange / receiptsInRange.length : 0;
  const reservationsInRange = reservationsData.filter(r => inRange(parseDocDate(r.createdAt)));
  const uniqueClients = new Set(reservationsData.map((r: any) => r.phone || r.name).filter(Boolean)).size;
  const totalCommissionsDue = partnersData.reduce((sum: number, p: any) => {
    const rev = typeof p.revenue === 'number' ? p.revenue : parseFloat((p.revenue || '0').toString().replace(/[^0-9.-]+/g, '')) || 0;
    return sum + (rev * (p.commission || 0) / 100);
  }, 0);

  const sourceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    reservationsData.forEach((r: any) => {
      const src = r.source || 'Autre';
      counts[src] = (counts[src] || 0) + 1;
    });
    const total = reservationsData.length || 1;
    return Object.entries(counts)
      .map(([source, count]) => ({ source, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.pct - a.pct);
  }, [reservationsData]);

  const metrics = {
    aov: aovInRange > 0 ? aovInRange.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' MAD' : '—',
    reservations: reservationsInRange.length.toString(),
    revenue: revenueInRange.toLocaleString('fr-FR') + ' MAD',
    pos: 'Actif',
    crm: uniqueClients.toString(),
    commissions: totalCommissionsDue.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' MAD'
  };

  const handleExportExcel = () => {
    try {
      const metricsData = [
        ["Catégorie", "Métrique", "Valeur"],
        ["Période sélectionnée", "Réservations", metrics.reservations],
        ["Période sélectionnée", "Panier Moyen", metrics.aov],
        ["Période sélectionnée", "Chiffre d'Affaires (encaissé)", metrics.revenue],
        ["Performances CRM & B2B", "Clients Uniques (CRM)", metrics.crm],
        ["Performances CRM & B2B", "Agences Partenaires", partnersData.length.toString()],
        ["Performances CRM & B2B", "Commissions Dues", metrics.commissions],
        ...sourceBreakdown.map(s => ["Sources de Réservation", s.source, `${s.pct}%`])
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
    <div className="group relative min-h-screen">
      {/* Background Hero */}
      <div 
        className="absolute top-0 left-0 w-full h-[42rem] z-0 print:hidden overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[3000ms] ease-out group-hover:scale-105"
          style={{ backgroundImage: "url('/img1-1.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FDFBF7] pointer-events-none"></div>
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
                    className="border border-gray-200 rounded-md py-1 px-2 text-sm text-gray-700 outline-none focus:border-[#F4C75B] bg-white"
                  />
                  <span className="text-gray-500 text-sm">-</span>
                  <input 
                    type="date" 
                    value={customEndDate} 
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border border-gray-200 rounded-md py-1 px-2 text-sm text-gray-700 outline-none focus:border-[#F4C75B] bg-white"
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
        
        {(expiringItems.length > 0 || expiredItems.length > 0) && (
          <div className="mb-8 p-6 bg-white rounded-2xl border-l-4 border-orange-500 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-full flex-shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Alerte Péremption</h3>
              <p className="text-gray-600">
                {expiredItems.length > 0 && <span className="text-red-600 font-medium mr-2">{expiredItems.length} produit(s) expiré(s).</span>}
                {expiringItems.length > 0 && <span className="text-orange-600 font-medium">{expiringItems.length} produit(s) expirent dans les 7 prochains jours.</span>}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                {expiringItems.concat(expiredItems).map(item => item.name).join(', ')}
              </div>
            </div>
            <div className="sm:ml-auto">
              <button 
                onClick={() => setActiveTab('inventory')}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors whitespace-nowrap"
              >
                Voir l'inventaire
              </button>
            </div>
          </div>
        )}
        <LivePlanningWidget />

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Average Order Value"
            value={metrics.aov}
            subtitle="Panier moyen (encaissements)"
            icon={<CreditCard className="text-[#F4C75B]" size={24} />}
            delay={0.2}
          />
          <DashboardCard
            title="Réservations"
            value={metrics.reservations}
            subtitle={sourceBreakdown[0] ? `Principale source : ${sourceBreakdown[0].source}` : 'Aucune réservation sur la période'}
            icon={<CalendarCheck className="text-[#F4C75B]" size={24} />}
            delay={0.3}
          />
          <DashboardCard
            title="Chiffre d'Affaires"
            value={metrics.revenue}
            subtitle="Encaissements caisse (période)"
            icon={<Banknote className="text-[#F4C75B]" size={24} />}
            delay={0.4}
          />
        </div>

        {/* Operations Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Point de Vente (POS)"
            value={metrics.pos}
            subtitle="Synchronisation des tables en temps réel"
            icon={<Store className="text-[#F4C75B]" size={24} />}
            delay={0.3}
          />
          <DashboardCard
            title="Clients Actifs (CRM)"
            value={metrics.crm}
            subtitle="Base Firestore synchronisée en temps réel"
            icon={<Users className="text-[#F4C75B]" size={24} />}
            delay={0.4}
          />
          <DashboardCard
            title="Commissions Riads"
            value={metrics.commissions}
            subtitle="Total dû aux partenaires B2B"
            icon={<MapPin className="text-[#F4C75B]" size={24} />}
            delay={0.5}
          />
        </div>

        <PerformanceAnalysis />


        {/* Quick Operations Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.8 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <button 
            onClick={() => {
              setActiveTab('reservations');
              showToast('Ouverture du module Réservation...');
            }}
            className="bg-[#265C6D] hover:bg-[#222] text-white p-4 rounded-xl shadow-md border border-[#2F6B7F] flex items-center gap-4 transition-all"
          >
            <div className="p-3 bg-[#F4C75B]/20 text-[#F4C75B] rounded-lg">
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
            className="bg-[#265C6D] hover:bg-[#222] text-white p-4 rounded-xl shadow-md border border-[#2F6B7F] flex items-center gap-4 transition-all"
          >
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
              <ChefHat size={20} />
            </div>
            <div className="text-left">
              <span className="block font-medium">Entrée Stock</span>
              <span className="text-xs text-gray-400">Scanner fournisseur</span>
            </div>
          </button>

        </motion.div>

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
            status="Non configuré"
            desc="Aucun webhook WhatsApp actif pour le moment. Configurez l'intégration dans Configuration > Intégrations & IA."
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
                <TrendingUp className="text-[#F4C75B]" size={24} />
                Résumé des Métriques
              </h3>
              <button onClick={() => setIsSummaryModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto print:block flex-1">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Période sélectionnée</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Réservations</div>
                      <div className="text-2xl font-serif font-medium text-gray-900">{metrics.reservations}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">Panier Moyen</div>
                      <div className="text-2xl font-serif font-medium text-gray-900">{metrics.aov}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                      <div className="text-sm text-gray-500 mb-1">Chiffre d'Affaires (encaissé)</div>
                      <div className="text-2xl font-serif font-medium text-gray-900">{metrics.revenue}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Performances CRM & B2B</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                      <span className="text-gray-700">Clients Uniques (CRM)</span>
                      <span className="font-medium">{metrics.crm}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                      <span className="text-gray-700">Agences Partenaires</span>
                      <span className="font-medium">{partnersData.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                      <span className="text-gray-700">Commissions Dues</span>
                      <span className="font-medium">{metrics.commissions}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Sources de Réservation</h4>
                  {sourceBreakdown.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucune réservation enregistrée pour le moment.</p>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      {sourceBreakdown.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{s.source}</span>
                          <span className="font-medium">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                className="px-6 py-2 bg-[#F4C75B] text-[#265C6D] font-medium rounded-lg hover:bg-[#E5B745] transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download size={18} /> Imprimer / Exporter PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
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

  const [reservations, setReservations] = useState<any[]>([
    { id: 'RES-1029', name: 'Sophie Martin', date: 'Aujourd\'hui, 19:30', pax: 4, source: 'TripAdvisor', status: 'Confirmé', phone: '+33 6 12 34 56 78', tag: 'VIP', table: 'T3' },
    { id: 'RES-1030', name: 'Jean Dupont', date: 'Aujourd\'hui, 20:00', pax: 2, source: 'WhatsApp Bot', status: 'Confirmé', phone: '+212 6 00 00 00 00', tag: 'Nouveau', table: 'T1' },
    { id: 'RES-1031', name: 'Famille Dubois', date: 'Aujourd\'hui, 20:30', pax: 6, source: 'Site Web', status: 'En attente', phone: '+33 6 98 76 54 32', tag: 'Allergies', table: null },
  ]);

  useEffect(() => {
    const unsubReservations = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const fbReservations = snapshot.docs
        .map(doc => ({ ...doc.data(), fbId: doc.id }))
        .sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setReservations(fbReservations);
    }, (error) => {
      console.error("Error fetching reservations", error);
    });
    return () => unsubReservations();
  }, []);

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
    localStorage.setItem('mouda_tables', JSON.stringify(tables));
  }, [tables]);

  const [waitlist, setWaitlist] = useState<any[]>([]);

  useEffect(() => {
    const unsubWaitlist = onSnapshot(collection(db, 'waitlist'), (snapshot) => {
      const fbWaitlist = snapshot.docs
        .map(doc => ({ ...doc.data(), fbId: doc.id }))
        .sort((a: any, b: any) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
      setWaitlist(fbWaitlist);
    }, (error) => {
      console.error("Error fetching waitlist", error);
    });
    return () => unsubWaitlist();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      const fbTables = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        
        // Arrange tables in a clean grid if coordinates are missing
        const cols = 5;
        const spacingX = 200;
        const spacingY = 160;
        const startX = 40;
        const startY = 80;
        
        const gridX = startX + (index % cols) * spacingX;
        const gridY = startY + Math.floor(index / cols) * spacingY;

        return {
          ...data,
          fbId: doc.id,
          id: data.id,
          capacity: data.capacity || 2,
          status: data.status === 'libre' ? 'available' : (data.status === 'reservee' ? 'reserved' : 'occupied'),
          type: data.shape === 'rond' ? 'round' : (data.shape === 'rectangle' ? 'rectangle' : 'square'),
          x: gridX,
          y: gridY,
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
    const assignedReservations: any[] = [];
    let updatedReservations = reservations.map(res => {
      if (!res.table && res.status !== 'Annulé') {
        const suitableTable = updatedTables.find(t => t.capacity >= res.pax && (t.status === 'available' || t.status === 'libre'));
        if (suitableTable) {
          suitableTable.status = 'reserved';
          const updatedRes = { ...res, table: suitableTable.id };
          assignedReservations.push(updatedRes);
          return updatedRes;
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
      for (const res of assignedReservations) {
        if (res.fbId) {
          await updateDoc(doc(db, 'reservations', res.fbId), { table: res.table });
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

  const reservationsByDay = useMemo(() => {
    const counts: Record<number, number> = {};
    reservations.forEach((r: any) => {
      const datePart = (r.date || '').split(',')[0]?.trim();
      const d = new Date(datePart);
      if (!isNaN(d.getTime()) && d.getMonth() === calendarDate.getMonth() && d.getFullYear() === calendarDate.getFullYear()) {
        counts[d.getDate()] = (counts[d.getDate()] || 0) + 1;
      }
    });
    return counts;
  }, [reservations, calendarDate]);

  const handlePrevMonth = () => setCalendarDate(new Date(currentYear, calendarDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCalendarDate(new Date(currentYear, calendarDate.getMonth() + 1, 1));
  const handleToday = () => setCalendarDate(new Date());

  const today = new Date();
  const isCurrentMonth = today.getMonth() === calendarDate.getMonth() && today.getFullYear() === currentYear;


  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#265C6D] font-semibold mb-2">Réservations (CRM)</h2>
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
            className="flex items-center gap-2 px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nouvelle Réservation
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="bg-gradient-to-r from-[#265C6D] to-[#2F6B7F] flex overflow-x-auto hide-scrollbar p-2 gap-2">
          {['upcoming', 'floorplan', 'waitlist', 'history', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab ? 'bg-[#F4C75B]/20 text-[#F4C75B]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              {tab === 'upcoming' && `À venir (${reservations.filter((r: any) => r.status !== 'Annulé').length})`}
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
            reservations.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                Aucune réservation pour le moment.
              </div>
            ) : (
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
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${res.tag === 'VIP' ? 'bg-[#F4C75B]/20 text-[#F4C75B]' : res.tag === 'Allergies' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {res.tag}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><Clock size={14} /> {res.date}</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {res.pax} pax</span>
                        {res.table && (
                          <span className="flex items-center gap-1 text-[#F4C75B] font-medium bg-[#F4C75B]/10 px-2 py-0.5 rounded-md">
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
                          onClick={async () => {
                            try {
                              if (res.fbId) {
                                await updateDoc(doc(db, 'reservations', res.fbId), { status: 'Confirmé' });
                              } else {
                                setReservations(reservations.map((r: any) => r.id === res.id ? { ...r, status: 'Confirmé' } : r));
                              }
                              showToast(`Réservation ${res.id} confirmée`);
                            } catch (err) {
                              console.error(err);
                              showToast("Erreur lors de la synchronisation au serveur", "error");
                            }
                          }}
                          className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              if (res.fbId) {
                                await updateDoc(doc(db, 'reservations', res.fbId), { status: 'Annulé' });
                              } else {
                                setReservations(reservations.map((r: any) => r.id === res.id ? { ...r, status: 'Annulé' } : r));
                              }
                              showToast(`Réservation ${res.id} refusée`);
                            } catch (err) {
                              console.error(err);
                              showToast("Erreur lors de la synchronisation au serveur", "error");
                            }
                          }}
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
            )
          )}

          {activeTab === 'floorplan' && (
             <div className="p-8 bg-[#FDFBF7]">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div>
                   <h3 className="text-xl font-serif font-medium text-gray-900 mb-1">Plan de Salle Interactif</h3>
                   <p className="text-sm text-gray-500">Gérez les tables et les affectations en temps réel.</p>
                 </div>
                 <button onClick={autoAssignTables} className="px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors shadow-sm flex items-center gap-2">
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
                       className={`absolute flex flex-col items-center justify-center font-bold text-sm shadow-sm transition-all cursor-pointer hover:ring-2 hover:ring-[#F4C75B]/80
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
                   {waitlist.map(item => {
                     const waitedMinutes = item.createdAt?.toMillis ? Math.max(0, Math.round((Date.now() - item.createdAt.toMillis()) / 60000)) : 0;
                     return (
                     <div key={item.fbId} className="flex flex-col p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-4">
                         <div>
                           <span className="font-semibold text-gray-900 block text-lg">{item.name}</span>
                           <span className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Users size={14} /> {item.pax} personnes</span>
                         </div>
                         <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-medium border border-amber-100 flex items-center gap-1">
                           <Clock size={12} /> {waitedMinutes} min
                         </span>
                       </div>
                       <button
                         onClick={async () => {
                           try {
                             await deleteDoc(doc(db, 'waitlist', item.fbId));
                             showToast(`Table attribuée à ${item.name}`);
                           } catch (err) {
                             console.error(err);
                             showToast("Erreur lors de la synchronisation au serveur", "error");
                           }
                         }}
                         className="w-full mt-auto py-2.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors rounded-xl text-sm font-medium flex justify-center items-center gap-2"
                       >
                         <CheckCircle size={16} /> Attribuer une table
                       </button>
                     </div>
                   );})}
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
               <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2"><Star size={18} className="text-[#F4C75B]" /> Avis Clients</h4>
               <div className="text-center text-gray-500 py-12 border border-dashed border-gray-200 bg-white rounded-2xl">
                 Aucune intégration d'avis clients connectée pour le moment. Utilisez le module "Analyse d'Avis (IA)" du Tableau de Bord pour analyser un avis collé manuellement.
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
                  const reservationCount = isValidDay ? (reservationsByDay[day] || 0) : 0;
                  const hasReservation = reservationCount > 0;

                  return (
                    <div key={i} className={`min-h-[100px] p-2 border-r border-b border-gray-100 ${!isValidDay ? 'bg-gray-50/50' : 'bg-white'}`}>
                      {isValidDay && (
                        <>
                          <div className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isTodayHighlight ? 'bg-[#F4C75B] text-white' : 'text-gray-700'}`}>
                            {day}
                          </div>
                          {hasReservation && (
                            <div
                              onClick={() => showToast(`${reservationCount} réservation${reservationCount > 1 ? 's' : ''} pour le ${day} ${currentMonthName}`)}
                              className="bg-blue-50 border border-blue-100 text-blue-700 text-xs p-1.5 rounded-md truncate cursor-pointer hover:bg-blue-100 transition-colors"
                            >
                              {reservationCount} Réservation{reservationCount > 1 ? 's' : ''}
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
            <AutoSaveForm formId="add_reservation" className="space-y-4" onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
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
                showToast("Réservation ajoutée avec succès");
              } catch (err) {
                console.error(err);
                showToast("Erreur", "error");
              }
              setIsNewResOpen(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input name="nom" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: M. Dubois" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input name="date" required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input name="time" required type="time" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personnes (Pax)</label>
                  <input name="pax" required type="number" defaultValue={2} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" required type="tel" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="+212..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source / Canal</label>
                <select name="source" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                  <option>Téléphone</option>
                  <option>Passage (Walk-in)</option>
                  <option>WhatsApp / Instagram</option>
                  <option>Site Web</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Tags spéciaux (ajoutez "VIP" pour tag VIP)</label>
                <textarea name="notes" rows={2} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] resize-none" placeholder="Allergies, anniversaire, VIP..."></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#265C6D] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#2F6B7F] transition-colors"
              >
                Confirmer la réservation
              </button>
            </AutoSaveForm>
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
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input 
                  type="text" 
                  value={newWaitlistName}
                  onChange={(e) => setNewWaitlistName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B]/50 focus:border-[#F4C75B] outline-none transition-all"
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
                onClick={async () => {
                  if(newWaitlistName) {
                    try {
                      await addDoc(collection(db, 'waitlist'), {
                        name: newWaitlistName,
                        pax: newWaitlistPax,
                        status: 'waiting',
                        createdAt: serverTimestamp()
                      });
                      showToast(`${newWaitlistName} ajouté à la liste d'attente`);
                      setNewWaitlistName('');
                      setNewWaitlistPax(2);
                      setIsAddWaitlistOpen(false);
                    } catch (err) {
                      console.error(err);
                      showToast("Erreur lors de l'ajout à la liste d'attente", "error");
                    }
                  } else {
                    showToast('Veuillez entrer un nom');
                  }
                }}
                className="w-full bg-[#F4C75B] text-[#265C6D] py-3 rounded-xl font-medium mt-4 hover:bg-[#E5B745] transition-colors"
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B]/50 focus:border-[#F4C75B] outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Suggestion basée sur {selectedActionRes.pax} pax x 200 MAD</p>
              </div>
              <button 
                onClick={() => {
                  showToast(`Lien de paiement envoyé par SMS à ${selectedActionRes.phone}`);
                  setIsPaymentOpen(false);
                }}
                className="w-full bg-[#265C6D] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#2F6B7F] transition-colors flex items-center justify-center gap-2"
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
                  onClick={async () => {
                    if (selectedActionRes.fbId) {
                      try {
                        await updateDoc(doc(db, 'reservations', selectedActionRes.fbId), { status: 'No-show' });
                      } catch (err) {
                        console.error(err);
                        showToast("Erreur lors de la synchronisation au serveur", "error");
                      }
                    } else {
                      setReservations(reservations.map(r => r.id === selectedActionRes.id ? { ...r, status: 'No-show' } : r));
                    }
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

  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  const [partners, setPartners] = useState<any[]>([
    { id: 'P-001', name: 'Riad Al Andalous', type: 'Riad', commission: 5, revenue: '12 500 MAD', active: true, clients: 45 },
    { id: 'P-002', name: 'Atlas Voyages', type: 'Agence', commission: 5, revenue: '34 200 MAD', active: true, clients: 120 },
    { id: 'P-003', name: 'LocaCar Marrakech', type: 'Location Auto', commission: 5, revenue: '4 800 MAD', active: true, clients: 15 },
    { id: 'P-004', name: 'Hôtel La Medina', type: 'Hôtel', commission: 5, revenue: '8 900 MAD', active: false, clients: 32 }
  ]);

  useEffect(() => {
    const unsubPartners = onSnapshot(collection(db, 'partners'), (snapshot) => {
      setPartners(snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id })));
    }, (error) => {
      console.error("Error fetching partners", error);
    });
    return () => unsubPartners();
  }, []);

  const handleDeletePartner = (id: string) => {
    setPartnerToDelete(id);
  };
  const confirmDeletePartner = async () => {
    if (partnerToDelete) {
      try {
        await deleteDoc(doc(db, 'partners', partnerToDelete));
        showToast("Partenaire supprimé avec succès");
      } catch (err) {
        console.error(err);
        showToast("Erreur lors de la suppression", "error");
      }
      setPartnerToDelete(null);
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

  const parseRevenue = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[^0-9.-]+/g, '')) || 0;
  };
  const totalClients = partners.reduce((sum: number, p: any) => sum + (p.clients || 0), 0);
  const totalRevenue = partners.reduce((sum: number, p: any) => sum + parseRevenue(p.revenue), 0);
  const totalCommissionsDue = partners.reduce((sum: number, p: any) => sum + (parseRevenue(p.revenue) * (p.commission || 0) / 100), 0);
  const formatK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : n.toLocaleString('fr-FR');

  return (
    <div className="p-8 md:p-12 relative z-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#265C6D] font-semibold mb-2">Portail B2B & Partenaires</h2>
          <p className="text-gray-500">Gérez vos partenariats avec les Riads, Agences et loueurs, et suivez vos commissions.</p>
        </div>
        <button 
          onClick={() => setIsAddPartnerModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors shadow-sm"
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
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-500">Chiffre d'Affaires B2B</h4>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={18} /></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatK(totalRevenue)} <span className="text-sm font-normal text-gray-500">MAD</span></h3>
          <p className="text-xs text-gray-500 mt-2 font-medium">Cumulé sur tous les partenaires</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-500">Clients Apportés</h4>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={18} /></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalClients}</h3>
          <p className="text-xs text-gray-500 mt-2 font-medium">Depuis le début de l'année</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-500">Commissions Dues</h4>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Banknote size={18} /></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatK(totalCommissionsDue)} <span className="text-sm font-normal text-gray-500">MAD</span></h3>
          <p className="text-xs text-amber-600 mt-2 font-medium">À régler ce mois-ci</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="bg-gradient-to-r from-[#265C6D] to-[#2F6B7F] flex overflow-x-auto hide-scrollbar p-2 gap-2">
          {['partners', 'commissions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab ? 'bg-[#F4C75B]/20 text-[#F4C75B]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
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
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${partner.active ? 'bg-[#F4C75B]/10 text-[#F4C75B]' : 'bg-gray-100 text-gray-400'}`}>
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
                            className="p-2 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-amber-50"
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
                            onClick={() => handleDeletePartner(partner.fbId)}  
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
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-medium text-gray-900">Historique des Versements</h3>
                <p className="text-sm text-gray-500 mt-1">Commissions actuellement dues par partenaire, calculées à partir du CA généré et du taux de commission.</p>
              </div>
              {partners.length === 0 ? (
                <div className="text-center text-gray-500 py-12">Aucun partenaire pour le moment.</div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Partenaire</th>
                      <th className="px-6 py-4 text-right">CA Généré</th>
                      <th className="px-6 py-4 text-right">Taux</th>
                      <th className="px-6 py-4 text-right">Commission Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {partners.map((p: any) => (
                      <tr key={p.fbId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                        <td className="px-6 py-4 text-right text-gray-600">{p.revenue}</td>
                        <td className="px-6 py-4 text-right text-gray-600">{p.commission}%</td>
                        <td className="px-6 py-4 text-right font-medium text-[#F4C75B]">{(parseRevenue(p.revenue) * (p.commission || 0) / 100).toFixed(2)} MAD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
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
              <h4 className="text-lg font-medium text-[#265C6D]">{selectedPartner.name}</h4>
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
                              h1 { font-size: 3rem; margin-bottom: 0.5rem; color: #265C6D; }
                              p.subtitle { font-size: 1.5rem; color: #666; margin-bottom: 3rem; }
                              .qr-wrapper { display: inline-block; padding: 2rem; border: 4px solid #265C6D; border-radius: 2rem; margin-bottom: 3rem; }
                              .qr-placeholder { width: 400px; height: 400px; background-image: url('https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://moudapalace.com/reserve/${selectedPartner.id}'); background-size: cover; background-position: center; }
                              .controls { margin-top: 2rem; }
                              button { padding: 15px 30px; font-size: 1.2rem; cursor: pointer; background: #F4C75B; color: #265C6D; border: none; border-radius: 8px; font-weight: bold; margin: 0 10px; }
                              button.secondary { background: #265C6D; color: #fff; }
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
                  className="flex-1 bg-[#265C6D] text-[#F4C75B] py-2.5 rounded-lg font-medium hover:bg-[#2F6B7F] transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Ouvrir HD / Imprimer
                </button>
              </div>
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
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" 
                  placeholder="Ex: Riad Dar Salam" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de partenaire</label>
                  <select 
                    value={newPartnerType} 
                    onChange={(e) => setNewPartnerType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]"
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
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" 
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
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" 
                    placeholder="contact@riad.com" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code d'accès (Secret)</label>
                  <input 
                    type="text" 
                    value={newPartnerAccessCode}
                    onChange={(e) => setNewPartnerAccessCode(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" 
                    placeholder="Ex: RIAD2026" 
                  />
                </div>
              </div>
              <button
                onClick={async () => {
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
                    email: newPartnerEmail,
                    createdAt: serverTimestamp()
                  };

                  try {
                    const newPartnerRef = await addDoc(collection(db, 'partners'), newPartner);
                    showToast("Partenaire ajouté. QR Code généré et prêt à l'emploi.");
                    setIsAddPartnerModalOpen(false);
                    setSelectedPartner({ ...newPartner, fbId: newPartnerRef.id });
                    setIsQRModalOpen(true);

                    setNewPartnerName('');
                    setNewPartnerType('Riad');
                    setNewPartnerCommission(5);
                    setNewPartnerEmail('');
                    setNewPartnerAccessCode('');
                  } catch (err) {
                    console.error(err);
                    showToast("Erreur lors de l'ajout du partenaire", "error");
                  }
                }}
                className="w-full bg-[#265C6D] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#2F6B7F] transition-colors"
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
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" 
                  placeholder="Ex: Riad Dar Salam" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de partenaire</label>
                  <select 
                    value={newPartnerType} 
                    onChange={(e) => setNewPartnerType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]"
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
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" 
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
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" 
                    placeholder="contact@riad.com" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code d'accès (Secret)</label>
                  <input 
                    type="text" 
                    value={newPartnerAccessCode}
                    onChange={(e) => setNewPartnerAccessCode(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" 
                    placeholder="Ex: RIAD2026" 
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!newPartnerAccessCode) {
                    showToast("Veuillez définir un code d'accès pour ce partenaire.", "error");
                    return;
                  }

                  const updates = {
                    name: newPartnerName,
                    type: newPartnerType,
                    commission: newPartnerCommission,
                    accessCode: newPartnerAccessCode,
                    email: newPartnerEmail
                  };

                  try {
                    await updateDoc(doc(db, 'partners', selectedPartner.fbId), updates);
                    showToast("Partenaire modifié avec succès.");
                    setIsEditPartnerModalOpen(false);

                    setNewPartnerName('');
                    setNewPartnerType('Riad');
                    setNewPartnerCommission(5);
                    setNewPartnerEmail('');
                    setNewPartnerAccessCode('');
                  } catch (err) {
                    console.error(err);
                    showToast("Erreur lors de la modification", "error");
                  }
                }}
                className="w-full bg-[#265C6D] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#2F6B7F] transition-colors"
              >
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!partnerToDelete}
        title="Supprimer le partenaire"
        message="Êtes-vous sûr de vouloir supprimer ce partenaire ?"
        onConfirm={confirmDeletePartner}
        onCancel={() => setPartnerToDelete(null)}
      />
    </div>
  );
}



function Inventory() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('stocks');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      
      let importedCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by semicolon or comma
        const separator = line.includes(';') ? ';' : ',';
        const cols = line.split(separator);
        
        if (cols.length >= 3) {
          try {
            const name = cols[0]?.trim();
            const category = cols[1]?.trim() || 'Épicerie';
            const supplier = cols[2]?.trim() || 'Non renseigné';
            const quantity = Number(cols[3]?.trim()) || 0;
            const unit = cols[4]?.trim() || 'kg';
            const minStock = Number(cols[5]?.trim()) || 5;
            const expirationDate = cols[6]?.trim() || null;

            if (name) {
              await addDoc(collection(db, 'inventoryItems'), {
                name,
                category,
                supplier,
                quantity,
                unit,
                minStock,
                expirationDate,
                createdAt: serverTimestamp()
              });
              importedCount++;
            }
          } catch (err) {
            console.error('Import error row', i, err);
            errorCount++;
          }
        }
      }
      
      showToast(`Import terminé : ${importedCount} produits ajoutés. (${errorCount} erreurs)`, importedCount > 0 ? 'success' : 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

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
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [isProdTaskModalOpen, setIsProdTaskModalOpen] = useState(false);
  const [editingProdTask, setEditingProdTask] = useState<any>(null);
  const [prodTaskForm, setProdTaskForm] = useAutoSave('form_prodTaskForm', { item: '', qty: '', priority: 'Moyenne', progress: 0, status: 'À faire' });
  const [recipes, setRecipes] = useState<any[]>([]);
  const [fichesTechniques, setFichesTechniques] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  const [semiFinished, setSemiFinished] = useState<any[]>([]);
  const [isSemiFinishedModalOpen, setIsSemiFinishedModalOpen] = useState(false);
  const [semiFinishedForm, setSemiFinishedForm] = useState<any>({ name: '', unit: 'kg', cost: '', quantity: 0 });
  const [isSemiFinishedAdjustModalOpen, setIsSemiFinishedAdjustModalOpen] = useState(false);
  const [semiFinishedAdjustData, setSemiFinishedAdjustData] = useState<any>({id: '', name: '', quantity: 0, adjustment: ''});
  const [isSemiFinishedDeleteModalOpen, setIsSemiFinishedDeleteModalOpen] = useState(false);
  const [semiFinishedDeleteData, setSemiFinishedDeleteData] = useState<any>({id: '', name: ''});
  const [isInventoryDeleteModalOpen, setIsInventoryDeleteModalOpen] = useState(false);
  const [inventoryDeleteData, setInventoryDeleteData] = useState<any>({id: '', name: ''});


  useEffect(() => {
    const unsubFiches = onSnapshot(collection(db, 'fiches_techniques'), (snapshot) => {
      setFichesTechniques(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsubMenu = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsub = onSnapshot(collection(db, 'recipes'), (snapshot) => {
      setRecipes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsub(); unsubFiches(); unsubMenu(); };
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'semi_finished'), (snapshot) => {
      setSemiFinished(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'fournisseurs'), (snapshot) => {
      setFournisseurs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

  const [staffNames, setStaffNames] = useState<string[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'staff'), (snapshot) => {
      setStaffNames(snapshot.docs.map(doc => doc.data().name).filter(Boolean).sort());
    });
    return () => unsub();
  }, []);

  const [txType, setTxType] = useState<'in' | 'out'>('in');
  const [newRecipeForm, setNewRecipeForm] = useAutoSave('form_newRecipeForm', { name: '', category: 'Entrée', portions: 1 });
  const [newRecipeIngredients, setNewRecipeIngredients] = useAutoSave<any[]>('form_newRecipeIngredients', []);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [ingredientQty, setIngredientQty] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('kg');
  const [searchQuery, setSearchQuery] = useState('');
  const [expirationFilter, setExpirationFilter] = useState("Tous");
  const [stockAlertFilter, setStockAlertFilter] = useState(false);
  const [advancedAlertFilter, setAdvancedAlertFilter] = useState(false);
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
  const [wasteRecords, setWasteRecords] = useState<any[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [wasteToDelete, setWasteToDelete] = useState<string | null>(null);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [editingWaste, setEditingWaste] = useState<any>(null);
  const [wasteForm, setWasteForm] = useAutoSave('form_wasteForm', { item: '', qty: '', unit: '', reason: '', cost: '', user: '', date: new Date().toISOString().split('T')[0] });
  const [txForm, setTxForm] = useAutoSave('form_txForm', { type: 'in', item: '', amount: '', unit: 'kg', reason: 'Achat', user: 'Admin', unitPrice: '', supplier: '', destination: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'wasteRecords'), orderBy('createdAt', 'desc')), (snapshot) => {
      setWasteRecords(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

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
    const defaultCats = ['Épices', 'Épicerie', 'Viandes', 'Volailles', 'Fruits Secs', 'Herbes', 'Fruits & Légumes', 'Poissons & Fruits de mer', 'Boulangerie', 'Patisseie', 'Produits Laitiers', 'Boissons', 'Boissons Alcoolisées', 'Sauces', 'Conserves', 'Sirops', "Matériel", "Services", "Hygiène & Entretien"];
    const dbCats = stockItemsData.map(item => normalizeCategory(item.category)).filter(Boolean);
    const dbFournisseurCats = fournisseurs.map(f => normalizeCategory(f.category || f.categorie)).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats, ...dbFournisseurCats]))
      .filter(c => c !== 'Épicerie & Sec' && c !== 'Épicerie & sec' && c !== 'Viandes & Volailles' && c !== 'Boissons & Vins' && c !== 'Épicerie Sèche' && c !== 'Epicerie Sèche')
      .sort();
  }, [stockItemsData, fournisseurs]);

  const suppliersList = useMemo(() => {
    const dbSuppliers = stockItemsData.map(item => item.supplier?.trim()).filter(Boolean).filter(s => s !== 'Non renseigné');
    const annuaireFournisseurs = fournisseurs.map(f => (f.name || f.nom)?.trim()).filter(Boolean);
    return Array.from(new Set([...dbSuppliers, ...annuaireFournisseurs])).sort();
  }, [stockItemsData, fournisseurs]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'inventoryItems'), orderBy('createdAt', 'desc')), (snapshot) => {
      setStockItemsData(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => {
      console.error("Error fetching inventoryItems", error);
    });
    return () => unsub();
  }, []);

  const stockItems = stockItemsData.map(item => ({ ...item, category: normalizeCategory(item.category), status: calculateStockStatus(item.quantity, item.minStock) }));
  
  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    
    const matchesAlert = stockAlertFilter ? item.quantity <= item.minStock : true;
    
    let matchesExpiration = true;
    if (expirationFilter === 'Expirés' || expirationFilter === 'En attente' || expirationFilter === 'Proche/Expiré') {
      if (!item.expirationDate) {
        matchesExpiration = false;
      } else {
        const expDate = new Date(item.expirationDate);
        const today = new Date();
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (expirationFilter === 'Expirés') {
          matchesExpiration = diffDays <= 0;
        } else if (expirationFilter === 'En attente') {
          matchesExpiration = diffDays > 0 && diffDays <= 7;
        } else if (expirationFilter === 'Proche/Expiré') {
          matchesExpiration = diffDays <= 7;
        }
      }
    }

    let matchesAdvancedAlert = true;
    if (advancedAlertFilter) {
      if (item.quantity > item.minStock || !item.expirationDate) {
         matchesAdvancedAlert = false;
      } else {
         const expDate = new Date(item.expirationDate);
         const today = new Date();
         const diffTime = expDate.getTime() - today.getTime();
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         if (diffDays >= 15) {
             matchesAdvancedAlert = false;
         }
      }
    }

    return matchesSearch && matchesCategory && matchesExpiration && matchesAlert && matchesAdvancedAlert;
  }).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txFilterType, setTxFilterType] = useState('all');

  const filteredTransactions = recentTransactions.filter(tx => {
    const matchesSearch = (tx.item || '').toLowerCase().includes(txSearchQuery.toLowerCase()) || (tx.id || '').toLowerCase().includes(txSearchQuery.toLowerCase());
    const matchesType = txFilterType === 'all' || tx.type === txFilterType;
    return matchesSearch && matchesType;
  });

  const handleExportPDF = () => {
    let printWindow = window.open('', '', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>État de l'Inventaire - Mouda Palace</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #F4C75B; padding-bottom: 20px; }
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
          <h2 className="text-3xl font-serif text-[#265C6D] font-semibold mb-2">Production Cuisine & Stocks</h2>
          <p className="text-gray-500">Fiches techniques, food cost, production journalière et inventaires automatiques.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              const staleThresholdMs = 30 * 24 * 60 * 60 * 1000;
              const now = Date.now();
              const staleItems = stockItemsData.filter((item: any) => {
                const ts = item.updatedAt?.toMillis?.() ?? item.createdAt?.toMillis?.();
                if (!ts) return true;
                return (now - ts) > staleThresholdMs;
              });
              if (staleItems.length === 0) {
                showToast("Tous les produits ont été recomptés au cours des 30 derniers jours.");
              } else {
                showToast(`${staleItems.length} produit(s) n'ont pas été recomptés depuis plus de 30 jours.`, "error");
              }
            }}
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
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            title="Format CSV: Nom;Catégorie;Fournisseur;Quantité;Unité;Seuil;Expiration"
          >
            <Download size={16} className="rotate-180" />
            Importer CSV
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Ajouter un produit
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          onClick={() => {
            setActiveTab('stocks');
            setExpirationFilter('Tous');
            setStockAlertFilter(false);
            setAdvancedAlertFilter(false);
            setSelectedCategory('Tous');
            setSearchQuery('');
          }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#F4C75B] hover:shadow-lg transition-all group"
        >
          <div className="p-4 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-[#F4C75B]/10 group-hover:text-[#265C6D] transition-colors">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Références</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{stockItemsData.length}</h4>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          onClick={() => {
            setActiveTab('stocks');
            setStockAlertFilter(true);
            setExpirationFilter('Tous');
            setSelectedCategory('Tous');
            setSearchQuery('');
          }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-red-300 hover:shadow-lg transition-all group"
        >
          <div className="p-4 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alertes Stock Bas</p>
            <h4 className="text-2xl font-bold text-red-600 mt-1">
              {stockItemsData.filter(i => i.quantity <= i.minStock).length}
            </h4>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('suppliers')}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-green-300 hover:shadow-lg transition-all group"
        >
          <div className="p-4 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-100 transition-colors">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Fournisseurs Actifs</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{fournisseurs.length}</h4>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          onClick={() => {
            setActiveTab('stocks');
            setExpirationFilter('Proche/Expiré');
            setStockAlertFilter(false);
            setAdvancedAlertFilter(false);
            setSelectedCategory('Tous');
            setSearchQuery('');
          }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-orange-300 hover:shadow-lg transition-all group"
        >
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
            <CalendarClock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Péremption Proche/Expiré</p>
            <h4 className="text-2xl font-bold text-orange-600 mt-1">
              {stockItemsData.filter(i => {
                if (!i.expirationDate) return false;
                const expDate = new Date(i.expirationDate);
                const today = new Date();
                const diffTime = expDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length}
            </h4>
          </div>
        </motion.div>
      </motion.div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="bg-gradient-to-r from-[#265C6D] to-[#2F6B7F] flex overflow-x-auto hide-scrollbar p-2 gap-2">
          {['stocks', 'production_orders', 'production', 'semi_finished', 'transactions', 'waste', 'price_history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${activeTab === tab ? 'bg-[#F4C75B]/20 text-[#F4C75B]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              {tab === 'stocks' && 'Inventaires Actuels'}
              {tab === 'production_orders' && 'Ordre de fabrication'}
              
              {tab === 'semi_finished' && 'Plats Semi-finis'}
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
            <>
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
                />
              </div>
              <div className="w-full sm:w-64">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
                >
                  <option value="Tous">Toutes les catégories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-64">
                
              <div className="w-full sm:w-auto">
                <button
                  onClick={() => {
                    setStockAlertFilter(!stockAlertFilter);
                    if (!stockAlertFilter) setAdvancedAlertFilter(false);
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors flex items-center justify-center gap-2 ${stockAlertFilter ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <AlertTriangle size={16} />
                  <span>{stockAlertFilter ? 'Alertes actives' : 'Stock bas'}</span>
                </button>
              </div>
              <div className="w-full sm:w-auto">
                <button
                  onClick={() => {
                    setAdvancedAlertFilter(!advancedAlertFilter);
                    if (!advancedAlertFilter) {
                       setStockAlertFilter(false);
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors flex items-center justify-center gap-2 ${advancedAlertFilter ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  title="Stock bas & DLC < 15j"
                >
                  <AlertTriangle size={16} />
                  <span>Priorité Achats</span>
                </button>
              </div>
              <select 
                  value={expirationFilter}
                  onChange={(e) => setExpirationFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
                >
                  <option value="Tous">Toutes les péremptions</option>
                  <option value="En attente">En attente d'expiration (&lt; 7j)</option>
                  <option value="Expirés">Expirés</option>
                  <option value="Proche/Expiré">Proche / Expirés (≤ 7j)</option>
                </select>
              </div>
              <div className="w-full sm:w-auto">
                <button 
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg hover:bg-[#E5B745] transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Printer size={16} />
                  Exporter PDF
                </button>
              </div>
            </div>
            
            <div className="mb-6 flex flex-wrap gap-3 pb-2">
              <button
                onClick={() => setSelectedCategory('Tous')}
                className={`pr-4 pl-1.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${selectedCategory === 'Tous' ? 'bg-[#265C6D] text-white border-transparent shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${selectedCategory === 'Tous' ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <Layers size={14} className={selectedCategory === 'Tous' ? 'text-white' : 'text-gray-500'} />
                </div>
                Tous
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`pr-4 pl-1.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${selectedCategory === cat ? 'bg-[#265C6D] text-white border-transparent shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm'}`}
                >
                  <img src={getCategoryImageUrl(cat)} alt={cat} className="w-7 h-7 rounded-full object-cover shadow-sm flex-shrink-0 bg-gray-100" referrerPolicy="no-referrer" />
                  {cat}
                </button>
              ))}
            </div>
            </>
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
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('price')}>
                      <div className="flex items-center gap-1">Prix U. {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('quantity')}>
                      <div className="flex items-center gap-1">Quantité {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('expirationDate')}>
                      <div className="flex items-center gap-1">Expiration {sortConfig.key === 'expirationDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
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
                          <img src={getCategoryImageUrl(item.category)} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 bg-gray-50 flex-shrink-0" referrerPolicy="no-referrer" />
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 text-gray-500">{item.supplier}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                        {resolveItemPrice(item) ? `${resolveItemPrice(item).toFixed(2)} DH` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`font-semibold ${item.status === 'critical' ? 'text-red-600' : item.status === 'alert' ? 'text-amber-600' : 'text-gray-900'}`}>
                            {item.quantity} {item.unit}
                          </span>
                          <span className="text-xs text-gray-400">Min: {item.minStock} {item.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          if (!item.expirationDate) return <span className="text-gray-400 text-xs">-</span>;
                          const expDate = new Date(item.expirationDate);
                          const today = new Date();
                          const diffTime = expDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          let textColor = "text-gray-600";
                          let bgColor = "bg-gray-50";
                          if (diffDays <= 0) {
                            textColor = "text-red-700";
                            bgColor = "bg-red-50";
                          } else if (diffDays <= 7) {
                            textColor = "text-orange-700";
                            bgColor = "bg-orange-50";
                          } else {
                            textColor = "text-green-700";
                            bgColor = "bg-green-50";
                          }
                          return (
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${textColor} ${bgColor}`}>
                              {new Intl.DateTimeFormat('fr-FR').format(expDate)}
                              {diffDays <= 7 && diffDays > 0 && <span className="ml-1 opacity-80">({diffDays} j)</span>}
                              {diffDays <= 0 && <span className="ml-1 opacity-80 font-bold">(Expiré)</span>}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-4">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
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
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
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
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedProduct(item);
                              setIsSettingsModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                            title="Historique & Paramètres"
                          >
                            <Settings size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setInventoryDeleteData({ id: item.id, name: item.name });
                              setIsInventoryDeleteModalOpen(true);
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

          {activeTab === 'production_orders' && (
            <div className="h-[800px] flex-1 overflow-y-auto bg-gray-50">
              <ProductionJournaliere />
            </div>
          )}
          {activeTab === 'semi_finished' && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Plats Semi-finis</h3>
                <button 
                  onClick={() => {
                    setSemiFinishedForm({ name: '', unit: 'kg', cost: '', quantity: 0 });
                    setIsSemiFinishedModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Nouveau Plat
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Nom du plat</th>
                      <th className="px-6 py-4 text-center">Quantité en stock</th>
                      <th className="px-6 py-4 text-center">Unité</th>
                      <th className="px-6 py-4 text-right">Coût Unitaire (MAD)</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {semiFinished.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Aucun plat semi-fini enregistré.
                        </td>
                      </tr>
                    ) : (
                      semiFinished.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-center font-medium">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs ${item.quantity <= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-500">{item.unit}</td>
                          <td className="px-6 py-4 text-right text-gray-900">{resolveItemPrice(item).toFixed(2)} MAD</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSemiFinishedAdjustData({ id: item.id, name: item.name, quantity: item.quantity, adjustment: '', type: 'in', reason: 'Ajustement', destination: 'Cuisine' });
                                  setIsSemiFinishedAdjustModalOpen(true);
                                }}
                                className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                title="Alimenter (Ajuster Stock)"
                              >
                                <Plus size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSemiFinishedForm(item);
                                  setIsSemiFinishedModalOpen(true);
                                }}
                                className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                title="Éditer la fiche"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSemiFinishedDeleteData({ id: item.id, name: item.name });
                                  setIsSemiFinishedDeleteModalOpen(true);
                                }}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Plan de Production Journalier</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      if (fichesTechniques.length === 0) {
                        showToast("Aucune fiche technique disponible pour générer un plan de production.", "error");
                        return;
                      }
                      const tasksToCreate = fichesTechniques.slice(0, 5).map((f: any) => ({
                        item: f.nom,
                        qty: `${f.portions || 1} portion(s)`,
                        progress: 0,
                        status: "À faire",
                        priority: "Moyenne",
                        createdAt: serverTimestamp()
                      }));
                      for (const t of tasksToCreate) {
                        await addDoc(collection(db, 'productionTasks'), t);
                      }
                      showToast(`${tasksToCreate.length} tâche(s) de production générée(s) à partir de vos fiches techniques.`);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <ClipboardList size={16} /> Auto-générer
                  </button>
                  <button 
                    onClick={() => {
                      setEditingProdTask(null);
                      setProdTaskForm({ item: '', qty: '', priority: 'Moyenne', progress: 0, status: 'À faire' });
                      setIsProdTaskModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} /> Nouvelle Tâche
                  </button>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-4">Plats semi finis</th>
                      <th className="px-6 py-4">Quantité Requise</th>
                      <th className="px-6 py-4">Priorité</th>
                      <th className="px-6 py-4">Progression</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productionTasks.map((task, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 group">
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
                            className={`border rounded-lg text-sm p-1.5 focus:outline-none focus:ring-1 focus:ring-[#F4C75B] ${
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
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => {
                              setEditingProdTask(task);
                              setProdTaskForm({
                                item: task.item || '',
                                qty: task.qty || '',
                                priority: task.priority || 'Moyenne',
                                progress: task.progress || 0,
                                status: task.status || 'À faire'
                              });
                              setIsProdTaskModalOpen(true);
                            }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="Modifier">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => setTaskToDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Supprimer">
                              <Trash2 size={16} />
                            </button>
                          </div>
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
                <button 
                  onClick={() => {
                    setEditingWaste(null);
                    setWasteForm({ item: '', qty: '', unit: 'kg', reason: '', cost: '', user: 'Chef', date: new Date().toISOString().split('T')[0] });
                    setIsWasteModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Nouvelle Déclaration
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-5 border border-red-100 bg-red-50/30 rounded-xl">
                  <p className="text-sm text-red-600 font-medium mb-1">Coût total des pertes (Ce mois)</p>
                  <p className="text-2xl font-bold text-red-700">
                    {wasteRecords.reduce((sum, w) => sum + (Number(w.cost) || 0), 0).toFixed(2)} MAD
                  </p>
                </div>
                <div className="p-5 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500 font-medium mb-1">Total déclarations</p>
                  <p className="text-lg font-bold text-gray-900">{wasteRecords.length}</p>
                </div>
                <div className="p-5 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500 font-medium mb-1">Ratio de perte estimé</p>
                  <p className="text-lg font-bold text-gray-900">2.4% <span className="text-sm font-normal text-green-600 ml-1">↓ 0.5%</span></p>
                </div>
              </div>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {wasteRecords.length > 0 ? wasteRecords.map((waste) => (
                  <div key={waste.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center bg-white hover:bg-gray-50 gap-2 group">
                    <div>
                      <h4 className="font-medium text-gray-900">{waste.item} <span className="text-gray-500 font-normal">({waste.qty} {waste.unit})</span></h4>
                      <p className="text-sm text-gray-500 mt-1">Cause : {waste.reason} • {waste.date}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-left sm:text-right">
                      <div>
                        <p className="font-medium text-red-600">-{waste.cost} MAD</p>
                        <p className="text-xs text-gray-400 mt-1">{waste.user}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {
                          setEditingWaste(waste);
                          setWasteForm({
                            item: waste.item || '',
                            qty: waste.qty || '',
                            unit: waste.unit || 'kg',
                            reason: waste.reason || '',
                            cost: waste.cost || '',
                            user: waste.user || '',
                            date: waste.date || ''
                          });
                          setIsWasteModalOpen(true);
                        }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="Modifier">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setWasteToDelete(waste.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-500">Aucune déclaration de perte enregistrée.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="p-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-6 pb-0 gap-4">
                <h3 className="text-lg font-medium text-gray-900">Historique des Mouvements</h3>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Rechercher un article ou réf..." 
                      value={txSearchQuery}
                      onChange={(e) => setTxSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] text-sm"
                    />
                  </div>
                  <select 
                    value={txFilterType}
                    onChange={(e) => setTxFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] text-sm bg-white"
                  >
                    <option value="all">Tous les mouvements</option>
                    <option value="in">Entrées seulement</option>
                    <option value="out">Sorties seulement</option>
                  </select>
                  <button 
                    onClick={() => {
                      setTxForm({ type: 'in', item: '', amount: '', unit: 'kg', reason: 'Achat', user: 'Admin', unitPrice: '', supplier: '', destination: '', date: new Date().toISOString().split('T')[0] });
                      setIsTxModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={16} /> Nouveau
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Aucun mouvement trouvé.</div>
                ) : filteredTransactions.map(tx => (
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
                      <p className="text-sm text-gray-600 mb-2">
                        {tx.reason}
                        {tx.type === 'in' && tx.supplier && <span className="ml-2 text-gray-500">• Frs: {tx.supplier}</span>}
                        {tx.type === 'out' && tx.destination && <span className="ml-2 text-gray-500">• Dest: {tx.destination}</span>}
                      </p>
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
                  <button onClick={() => setIsNewSupplierModalOpen(true)}  className="px-4 py-2 bg-[#F4C75B] text-[#265C6D] rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors flex items-center gap-2">
                    <Plus size={16} /> Nouveau Fournisseur
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Pending Orders Summary / List */}
                <div className="lg:col-span-1 border border-gray-200 rounded-xl bg-gray-50/50 p-5">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart size={18} className="text-[#F4C75B]" /> Commandes en cours
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fournisseurs.length > 0 ? fournisseurs.map((supplier, idx) => {
                      const suppName = supplier.name || supplier.nom;
                      const suppCat = supplier.category || supplier.categorie;
                      const suppPhone = supplier.phone || supplier.telephone;
                      
                      return (
                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedSupplier(supplier); setIsEditSupplierModalOpen(true); }} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-white hover:text-blue-600 shadow-sm border border-gray-100 transition-all">
                              <Edit size={14} />
                            </button>
                          </div>
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-[#265C6D]">{suppName ? suppName.charAt(0).toUpperCase() : '?'}</span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 text-lg leading-tight mb-1 pr-6">{suppName}</h5>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin size={12} /> {supplier.city || 'Non spécifié'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <span className="inline-flex items-center gap-1 bg-[#265C6D]/5 text-[#265C6D] px-2.5 py-1 rounded-md text-xs font-medium border border-[#265C6D]/10">
                              <Layers size={12} /> {suppCat || 'Général'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                <User size={12} />
                              </div>
                              <span className="text-gray-700">{supplier.contact || 'Non spécifié'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <Phone size={12} />
                              </div>
                              <a href={`tel:${suppPhone}`} className="text-gray-600 hover:text-blue-600 transition-colors">{suppPhone || 'N/A'}</a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                <Mail size={12} />
                              </div>
                              <a href={`mailto:${supplier.email}`} className="text-gray-600 hover:text-amber-600 truncate transition-colors">{supplier.email || 'N/A'}</a>
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="col-span-1 sm:col-span-2 bg-white border border-gray-200 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-gray-500">
                        <Users size={32} className="mb-3 text-gray-300" />
                        <p className="text-sm">Aucun fournisseur enregistré.</p>
                      </div>
                    )}
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
                            {resolveItemPrice(tx) ? `${resolveItemPrice(tx).toFixed(2)} MAD` : <span className="text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-[#F4C75B]">
                            {resolveItemPrice(tx) ? `${(resolveItemPrice(tx) * Number(tx.amount || tx.quantity || 0)).toFixed(2)} MAD` : <span className="text-gray-400 italic">-</span>}
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
                    className="w-full bg-[#265C6D] text-white py-3 rounded-xl font-medium hover:bg-[#2F6B7F] transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} className="text-[#F4C75B]" />
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
                  <input type="number" defaultValue={5} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                  <span className="text-gray-500 text-sm">kg</span>
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration suggérée (Optionnel)</label>
                <input id="auto-exp-date" type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
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
                      expirationDate: (document.getElementById("auto-exp-date") as HTMLInputElement)?.value || null,
                      barcode: scannedBarcode || "SCANNED-" + Date.now(),
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
                className="w-full bg-[#F4C75B] text-[#265C6D] py-3 rounded-xl font-medium mt-4 hover:bg-[#E5B745] transition-colors flex items-center justify-center gap-2"
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
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                  <input
                    type="text"
                    value={newRecipeForm.name}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:border-[#F4C75B]"
                    placeholder="Ex: Tajine de Poulet"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <input
                    list="dl-recipe-cats"
                    value={newRecipeForm.category}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, category: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:border-[#F4C75B]"
                    placeholder="Ex: Plats Principaux"
                  />
                  <datalist id="dl-recipe-cats">
                    <option value="Entrées" />
                    <option value="Plats Principaux" />
                    <option value="Desserts" />
                    <option value="Boissons" />
                  </datalist>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portions (Rendement)</label>
                  <select
                    value={newRecipeForm.portions || 1}
                    onChange={(e) => setNewRecipeForm({...newRecipeForm, portions: Number(e.target.value)})}
                    className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:border-[#F4C75B]"
                  >
                    {[1, 2, 4, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 100].map(p => (
                      <option key={p} value={p}>{p} {p > 1 ? 'portions' : 'portion'}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Ingrédients depuis l'inventaire</h4>
                </div>
                <div className="flex flex-wrap gap-2 mb-4 relative items-start">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      list="dl-ingredients"
                      value={selectedIngredient}
                      onChange={(e) => setSelectedIngredient(e.target.value)}
                      placeholder="Nom de l'ingrédient (existant ou nouveau)..."
                      className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B] bg-white"
                    />
                    <datalist id="dl-ingredients">
                      {stockItemsData.map(item => (
                        <option key={item.id} value={item.name}>{item.category} - {item.unit}</option>
                      ))}
                    </datalist>
                  </div>
                  <div className="w-28">
                    <input 
                      type="number" 
                      value={ingredientQty}
                      onChange={(e) => setIngredientQty(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                      placeholder="Qté" 
                    />
                  </div>
                  <div className="w-32">
                    <select
                      value={ingredientUnit}
                      onChange={(e) => setIngredientUnit(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:border-[#F4C75B]"
                    >
                      <option value="kg">Kg</option>
                      <option value="g">G</option>
                      <option value="L">L</option>
                      <option value="cl">cl</option>
                      <option value="ml">ml</option>
                      <option value="pièce">pièce</option>
                      <option value="portion">portion</option>
                      <option value="bouteille">bouteille</option>
                      <option value="boîte">boîte</option>
                      <option value="paquet">paquet</option>
                      <option value="botte">botte</option>
                      <option value="c.à.s">c.à.s</option>
                      <option value="c.à.c">c.à.c</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => {
                      if (!selectedIngredient || !ingredientQty) {
                        showToast("Veuillez sélectionner un ingrédient et une quantité", "error");
                        return;
                      }
                      const item = stockItemsData.find(i => i.name === selectedIngredient);
                      if (item) {
                        setNewRecipeIngredients([...newRecipeIngredients, {
                          id: item.id,
                          name: item.name,
                          unit: item.unit, // Use inventory unit
                          quantity: Number(ingredientQty),
                          costPerUnit: item.price || 0
                        }]);
                      } else {
                        // Allow adding a custom ingredient that is not in inventory
                        setNewRecipeIngredients([...newRecipeIngredients, {
                          id: `custom-${Date.now()}`,
                          name: selectedIngredient,
                          unit: ingredientUnit,
                          quantity: Number(ingredientQty),
                          costPerUnit: 0 // Cannot determine cost for non-inventory item
                        }]);
                      }
                      setSelectedIngredient('');
                      setIngredientQty('');
                      setIngredientUnit('kg');
                    }}
                    className="px-4 py-2 bg-[#F4C75B] text-[#265C6D] font-medium rounded-lg hover:bg-[#E5B745]"
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
                onClick={async () => {
                  if (!newRecipeForm.name) {
                    showToast("Veuillez entrer le nom du plat", "error");
                    return;
                  }
                  if (newRecipeIngredients.length === 0) {
                    showToast("Veuillez ajouter au moins un ingrédient", "error");
                    return;
                  }
                  
                  try {
                    const cost = newRecipeIngredients.reduce((sum, ing) => sum + (ing.quantity * ing.costPerUnit), 0);
                    // Standard margin logic: Price = Cost / 0.25 (targeting 75% margin)
                    const recommendedPrice = cost * 4;
                    const margin = 75; // simplified
                    
                    await addDoc(collection(db, 'recipes'), {
                      name: newRecipeForm.name,
                      category: newRecipeForm.category,
                      portions: newRecipeForm.portions || 1,
                      ingredients: newRecipeIngredients,
                      cost: cost,
                      price: recommendedPrice,
                      margin: margin,
                      createdAt: new Date().toISOString()
                    });
                    
                    showToast("Fiche technique créée avec succès");
                    setNewRecipeForm({ name: '', category: 'Entrée', portions: 1 });
                    setNewRecipeIngredients([]);
                    setIsNewRecipeModalOpen(false);
                  } catch (e) {
                    showToast("Erreur lors de la création", "error");
                    console.error(e);
                  }
                }}
                className="w-full bg-[#265C6D] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#2F6B7F] transition-colors"
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
            <AutoSaveForm formId="add_product" className="space-y-4" onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = normalizeCategory(formData.get('category') as string);
              const unit = formData.get('unit') as string;
              const quantity = Number(formData.get('quantity') || 0);
              const unitPrice = Number(formData.get('unitPrice') || 0);
              const expirationDate = formData.get('expirationDate') as string;
              
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
                price: unitPrice,
                averageCost: unitPrice,
                minStock: 10,
                expirationDate: expirationDate || null,
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                <Combobox
                  name="name"
                  required
                  options={[
                    "Agneau", "Amandes", "Beurre", "Cannelle", "Carottes", "Citron confit", "Coriandre", "Courgettes", "Cumin",
                    "Curcuma", "Dattes", "Farine", "Gingembre", "Huile d'olive", "Huile de tournesol", "Lait", "Miel pur", "Noix",
                    "Oeufs", "Oignons", "Olives", "Persil", "Poivre noir", "Pommes de terre", "Poulet", "Safran", "Sel", "Semoule",
                    "Sucre", "Tomates", "Viande de boeuf", "Viande hachée",
                    ...stockItemsData.map((item: any) => item.name)
                  ]}
                  onValueChange={val => {
                    const matched = stockItemsData.find((item: any) => item.name === val);
                    const priceInput = document.getElementById('add-product-price') as HTMLInputElement | null;
                    const knownPrice = resolveItemPrice(matched);
                    if (matched && priceInput && !priceInput.value && knownPrice) {
                      priceInput.value = String(knownPrice);
                    }
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]"
                  placeholder="Ex: Miel pur"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <Combobox name="category" options={categories} required placeholder="Sélectionner ou taper..." className="w-full border border-gray-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select name="unit" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    <option value="kg">Kg</option>
                    <option value="g">G</option>
                    <option value="L">L</option>
                    <option value="cl">Cl</option>
                    <option value="ml">Ml</option>
                    <option value="pièce">Pièce</option>
                    <option value="boîte">Boîte</option>
                    <option value="bouteille">Bouteille</option>
                    <option value="sachet">Sachet</option>
                    <option value="carton">Carton</option>
                    <option value="botte">Botte</option>
                    <option value="cannette">Cannette</option>
                    <option value="bidon">Bidon</option>
                    <option value="plateau">Plateau</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Initiale</label>
                  <input name="quantity" required type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix Unitaire (MAD)</label>
                  <input id="add-product-price" name="unitPrice" type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 15.50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration (Optionnel)</label>
                <input name="expirationDate" type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#265C6D] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#2F6B7F] transition-colors"
              >
                Ajouter à l'inventaire
              </button>
            </AutoSaveForm>
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
                <input id="tx-qty" type="number" min="0" step="0.1" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {txType === 'out' ? 'Destinataire' : 'Raison / Commentaire'}
                </label>
                {txType === 'out' ? (
                  <select id="tx-reason" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white">
                    <option value="">Sélectionner une destination</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Bar">Bar</option>
                    <option value="Entretien">Entretien</option>
                    <option value="Ménage">Ménage</option>
                  </select>
                ) : (
                  <input id="tx-reason" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Achat du jour" />
                )}
              </div>
              {fichesTechniques.some(r => (r.nom || '').toLowerCase() === selectedProduct.name.toLowerCase()) && (
                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <input type="checkbox" id="tx-sync-recipe" defaultChecked={txType === 'out'} className="w-4 h-4 text-[#265C6D] bg-white border-gray-300 rounded focus:ring-[#265C6D]" />
                  <label htmlFor="tx-sync-recipe" className="text-sm font-medium text-blue-900">
                    Déduire les ingrédients (Fiche technique)
                  </label>
                </div>
              )}
              {txType === 'in' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                    <Combobox id="tx-supplier" options={suppliersList} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Marché Central" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix U. (MAD)</label>
                    <input id="tx-price" type="number" step="any" min="0" defaultValue={selectedProduct?.price || selectedProduct?.averageCost || ''} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="0.00" />
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

                    const updateData: any = {
                      quantity: newQuantity,
                      updatedAt: serverTimestamp()
                    };

                    const priceInput = document.getElementById('tx-price') as HTMLInputElement;
                    if (txType === 'in' && priceInput && priceInput.value) {
                       const inQty = qty;
                       const inPrice = parseFloat(priceInput.value);
                       const currentQty = parseFloat(selectedProduct.quantity || 0);
                       const currentPrice = parseFloat(selectedProduct.averageCost || selectedProduct.price || 0);
                       
                       let newAverageCost = inPrice;
                       if (newQuantity > 0) {
                          newAverageCost = ((currentQty * currentPrice) + (inQty * inPrice)) / newQuantity;
                       }
                       updateData.averageCost = newAverageCost;
                       updateData.price = inPrice;
                    }
                    
                    await updateDoc(doc(db, 'inventoryItems', selectedProduct.id), updateData);
                    
                    const syncCheckbox = document.getElementById('tx-sync-recipe') as HTMLInputElement;
                    const shouldSync = syncCheckbox?.checked;
                    if (shouldSync) {
                         const recipe = fichesTechniques.find(r => (r.nom || '').toLowerCase() === selectedProduct.name.toLowerCase());
                         if (recipe && recipe.ingredients) {
                             const recipePortions = parseFloat(recipe.portions) || 1;
                             for (const ing of recipe.ingredients) {
                                 let neededQty = (parseFloat(ing.quantite) || 0) * (qty / recipePortions);
                                 const ingUnit = (ing.unite || '').toLowerCase();
                                 
                                 const matchedInv = stockItemsData.find(i => i.name.toLowerCase() === ing.nom.toLowerCase());
                                 if (matchedInv && matchedInv.id) {
                                     const invUnit = (matchedInv.unit || '').toLowerCase();
                                     if (ingUnit === 'g' && invUnit === 'kg') neededQty /= 1000;
                                     else if (ingUnit === 'kg' && invUnit === 'g') neededQty *= 1000;
                                     else if (ingUnit === 'ml' && (invUnit === 'l' || invUnit === 'litre')) neededQty /= 1000;
                                     else if ((ingUnit === 'l' || ingUnit === 'litre') && invUnit === 'ml') neededQty *= 1000;
                                     
                                     const newInvQty = Math.max(0, parseFloat(matchedInv.quantity || 0) - neededQty);
                                     await updateDoc(doc(db, 'inventoryItems', matchedInv.id), { quantity: newInvQty });
                                 }
                             }
                         }
                    }

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
              <Combobox id="edit-name" options={stockItemsData.map((item: any) => item.name)} defaultValue={selectedProduct.name} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] font-medium text-gray-900" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <Combobox id="edit-cat" options={categories} defaultValue={selectedProduct.category} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select id="edit-unit" defaultValue={selectedProduct.unit} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    <option value="kg">Kg</option>
                    <option value="g">G</option>
                    <option value="L">L</option>
                    <option value="cl">Cl</option>
                    <option value="ml">Ml</option>
                    <option value="pièce">Pièce</option>
                    <option value="boîte">Boîte</option>
                    <option value="bouteille">Bouteille</option>
                    <option value="sachet">Sachet</option>
                    <option value="carton">Carton</option>
                    <option value="botte">Botte</option>
                    <option value="cannette">Cannette</option>
                    <option value="bidon">Bidon</option>
                    <option value="plateau">Plateau</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                  <div className="flex items-center gap-2">
                    <input id="edit-qty" type="number" step="0.01" defaultValue={selectedProduct.quantity} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte</label>
                  <div className="flex items-center gap-2">
                    <input id="edit-min" type="number" defaultValue={selectedProduct.minStock} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur Préféré</label>
                  <Combobox id="edit-sup" options={suppliersList} defaultValue={selectedProduct.supplier} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (DH)</label>
                  <input id="edit-price" type="number" step="any" defaultValue={selectedProduct.price || selectedProduct.averageCost || ''} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                <input id="edit-exp" type="date" defaultValue={selectedProduct.expirationDate || ''} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <button 
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newName = (document.getElementById('edit-name') as HTMLInputElement)?.value;
                  const newCat = (document.getElementById('edit-cat') as HTMLInputElement)?.value;
                  const newUnit = (document.getElementById('edit-unit') as HTMLSelectElement)?.value;
                  const newQty = Number((document.getElementById('edit-qty') as HTMLInputElement)?.value);
                  const newMin = Number((document.getElementById('edit-min') as HTMLInputElement)?.value);
                  const newSup = (document.getElementById('edit-sup') as HTMLInputElement)?.value;
                  const newExp = (document.getElementById('edit-exp') as HTMLInputElement)?.value;
                  const priceStr = (document.getElementById('edit-price') as HTMLInputElement)?.value;
                  const newPrice = priceStr ? Number(priceStr) : (selectedProduct.price || 0);
                  
                  if (selectedProduct.id) {
                    try {
                      await updateDoc(doc(db, "inventoryItems", selectedProduct.id), {
                        name: newName || selectedProduct.name,
                        category: newCat,
                        unit: newUnit,
                        quantity: newQty,
                        minStock: newMin,
                        supplier: newSup,
                        price: newPrice,
                        averageCost: newPrice,
                        expirationDate: newExp || null,
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
                className="w-full bg-[#265C6D] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#2F6B7F] transition-colors"
              >
                Sauvegarder
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSettingsModalOpen(false);
                  setInventoryDeleteData({ id: selectedProduct.id, name: selectedProduct.name });
                  setIsInventoryDeleteModalOpen(true);
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
      {/* Inventory Delete Modal */}
      {isInventoryDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-red-700">Supprimer l'article</h3>
              </div>
              <button onClick={() => setIsInventoryDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Êtes-vous sûr de vouloir supprimer <strong>{inventoryDeleteData.name}</strong> ?</p>
              <p className="text-sm text-red-500 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsInventoryDeleteModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'inventoryItems', inventoryDeleteData.id));
                    showToast('Produit supprimé avec succès');
                    setIsInventoryDeleteModalOpen(false);
                  } catch(e) {
                    showToast('Erreur lors de la suppression', 'error');
                  }
                }}
                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
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
            <AutoSaveForm formId="add_order" className="space-y-4" onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
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
                <Combobox name="supplier" options={suppliersList} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Ferme Atlas" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison prévue</label>
                <input name="deliveryDate" type="date" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <OrderArticlesField stockItemsData={stockItemsData} />
              <button 
                type="submit"
                className="w-full bg-[#F4C75B] text-[#265C6D] py-3 rounded-xl font-medium mt-4 hover:bg-[#E5B745] transition-colors"
              >
                Valider la Commande
              </button>
            </AutoSaveForm>
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
            <AutoSaveForm formId="add_supplier" className="space-y-4" onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = normalizeCategory(formData.get('category') as string);
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
                <input name="name" type="text" required placeholder="Ex: Grossiste Bio Plus" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <Combobox name="category" options={categories} required placeholder="Ex: Fruits & Légumes" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input name="city" type="text" required placeholder="Ex: Fès" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personne à contacter</label>
                <input name="contact" type="text" required placeholder="Ex: Ahmed" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" type="text" required placeholder="Ex: +212..." className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" placeholder="Ex: contact@bioplus.ma" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#F4C75B] text-[#265C6D] py-3 rounded-xl font-medium mt-4 hover:bg-[#E5B745] transition-colors"
              >
                Ajouter le Fournisseur
              </button>
            </AutoSaveForm>
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
            <AutoSaveForm formId="edit_supplier" className="space-y-4" onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const category = normalizeCategory(formData.get('category') as string);
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
                <input name="name" type="text" required defaultValue={selectedSupplier.name || selectedSupplier.nom} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <Combobox
                    name="category"
                    required
                    options={['Fruits & Légumes', 'Viandes', 'Volailles', 'Poissons & Fruits de mer', 'Patisseie', 'Produits Laitiers & Œufs', 'Épicerie Sèche', 'Emballages & Consommables', 'Hygiène & Entretien', 'Équipement & Matériel', 'Services']}
                    defaultValue={selectedSupplier.category || selectedSupplier.categorie}
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input name="city" type="text" required defaultValue={selectedSupplier.city} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personne à contacter</label>
                <input name="contact" type="text" required defaultValue={selectedSupplier.contact} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" type="text" required defaultValue={selectedSupplier.phone || selectedSupplier.telephone} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" defaultValue={selectedSupplier.email} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-[#F4C75B] text-[#265C6D] py-3 rounded-xl font-medium hover:bg-[#E5B745] transition-colors"
                >
                  Mettre à jour
                </button>
                <button
                  type="button"
                  onClick={() => setSupplierToDelete(selectedSupplier.id)}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </AutoSaveForm>
          </div>
        </div>
      )}


      {/* Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold text-gray-900">Nouveau Mouvement</h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                <button 
                  onClick={() => setTxForm({...txForm, type: 'in', reason: 'Achat'})} 
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${txForm.type === 'in' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
                >
                  Entrée (+)
                </button>
                <button 
                  onClick={() => setTxForm({...txForm, type: 'out', reason: 'Consommation'})} 
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${txForm.type === 'out' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500'}`}
                >
                  Sortie (-)
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
                <Combobox
                  options={stockItemsData.map(item => item.name)}
                  value={txForm.item}
                  onChange={val => {
                    const matchedItem = stockItemsData.find(i => i.name === val);
                    if (matchedItem && txForm.type === 'in') {
                      setTxForm({...txForm, item: val, unit: matchedItem.unit || 'kg', unitPrice: matchedItem.price || matchedItem.averageCost || ''});
                    } else if (matchedItem) {
                      setTxForm({...txForm, item: val, unit: matchedItem.unit || 'kg'});
                    } else {
                      setTxForm({...txForm, item: val});
                    }
                  }}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                  placeholder="Rechercher un produit..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                  <input 
                    type="number" 
                    value={txForm.amount}
                    onChange={e => setTxForm({...txForm, amount: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                    placeholder="Ex: 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select 
                    value={txForm.unit}
                    onChange={e => setTxForm({...txForm, unit: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                  >
                    <option value="kg">Kg</option>
                    <option value="g">G</option>
                    <option value="L">L</option>
                    <option value="cl">cl</option>
                    <option value="pièce(s)">pièce(s)</option>
                    <option value="bouteille(s)">bouteille(s)</option>
                    <option value="boîte(s)">boîte(s)</option>
                  </select>
                </div>
              </div>

              {txForm.type === 'in' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix Unitaire (MAD)</label>
                    <input 
                      type="number" 
                      value={txForm.unitPrice}
                      onChange={e => setTxForm({...txForm, unitPrice: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                      placeholder="Ex: 45"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                    <Combobox
                      options={fournisseurs.map(f => f.name || f.nom)}
                      value={txForm.supplier}
                      onChange={val => setTxForm({...txForm, supplier: val})}
                      className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                      placeholder="Ex: Marché Central"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <select 
                  value={txForm.reason}
                  onChange={e => setTxForm({...txForm, reason: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                >
                  {txForm.type === 'in' ? (
                    <>
                      <option value="Achat">Achat / Réception</option>
                      <option value="Retour Client">Retour Client</option>
                      <option value="Ajustement d'inventaire">Ajustement d'inventaire (+)</option>
                    </>
                  ) : (
                    <>
                      <option value="Consommation">Consommation / Production</option>
                      <option value="Perte">Perte / Gaspillage</option>
                      <option value="Ajustement d'inventaire">Ajustement d'inventaire (-)</option>
                    </>
                  )}
                </select>
              </div>

              {fichesTechniques.some(r => (r.nom || '').toLowerCase() === txForm.item.toLowerCase()) && (
                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <input type="checkbox" id="global-tx-sync-recipe" defaultChecked={txForm.type === 'out'} className="w-4 h-4 text-[#265C6D] bg-white border-gray-300 rounded focus:ring-[#265C6D]" />
                  <label htmlFor="global-tx-sync-recipe" className="text-sm font-medium text-blue-900">
                    Déduire les ingrédients (Fiche technique)
                  </label>
                </div>
              )}
              {txForm.type === 'out' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination de sortie</label>
                  <Combobox
                    options={['Cuisine Principale', 'Bar', 'Événement', 'Patisseie']}
                    value={txForm.destination || ''}
                    onChange={val => setTxForm({...txForm, destination: val})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                    placeholder="Ex: Cuisine, Bar, Événement..."
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={txForm.date}
                    onChange={e => setTxForm({...txForm, date: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opérateur</label>
                  <Combobox
                    options={staffNames}
                    value={txForm.user}
                    onChange={val => setTxForm({...txForm, user: val})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                  />
                </div>
              </div>
              
              <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => setIsTxModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={async () => {
                    if (!txForm.item || !txForm.amount) {
                      showToast("Veuillez remplir l'article et la quantité", "error");
                      return;
                    }
                    try {
                      // Add transaction
                      await addDoc(collection(db, 'inventoryTransactions'), {
                        ...txForm,
                        createdAt: serverTimestamp()
                      });
                      
                      // Also update the stock quantity in inventoryItems if found
                      const itemToUpdate = stockItemsData.find(item => item.name.toLowerCase() === txForm.item.toLowerCase());
                      if (itemToUpdate && itemToUpdate.id) {
                        const amount = parseFloat(txForm.amount);
                        const newQuantity = txForm.type === 'in' ? 
                          (parseFloat(itemToUpdate.quantity || 0) + amount) : 
                          (parseFloat(itemToUpdate.quantity || 0) - amount);
                        
                        const updateData: any = {
                          quantity: newQuantity,
                          updatedAt: serverTimestamp()
                        };

                        if (txForm.type === 'in' && txForm.unitPrice) {
                           const currentQty = parseFloat(itemToUpdate.quantity || 0);
                           const currentPrice = parseFloat(itemToUpdate.averageCost || itemToUpdate.price || 0);
                           const inQty = amount;
                           const inPrice = parseFloat(txForm.unitPrice);
                           
                           let newAverageCost = inPrice;
                           if (newQuantity > 0) {
                              newAverageCost = ((currentQty * currentPrice) + (inQty * inPrice)) / newQuantity;
                           }
                           updateData.averageCost = newAverageCost;
                           updateData.price = inPrice; // Also update the last purchase price
                        }
                        
                        await updateDoc(doc(db, 'inventoryItems', itemToUpdate.id), updateData);
                        
                        const shouldSync = (document.getElementById('global-tx-sync-recipe') as HTMLInputElement)?.checked;
                        if (shouldSync) {
                           const recipe = fichesTechniques.find(r => (r.nom || '').toLowerCase() === txForm.item.toLowerCase());
                           if (recipe && recipe.ingredients) {
                               const recipePortions = parseFloat(recipe.portions) || 1;
                               for (const ing of recipe.ingredients) {
                                   let neededQty = (parseFloat(ing.quantite) || 0) * (amount / recipePortions);
                                   const ingUnit = (ing.unite || '').toLowerCase();
                                   
                                   const matchedInv = stockItemsData.find(i => i.name.toLowerCase() === ing.nom.toLowerCase());
                                   if (matchedInv && matchedInv.id) {
                                       const invUnit = (matchedInv.unit || '').toLowerCase();
                                       if (ingUnit === 'g' && invUnit === 'kg') neededQty /= 1000;
                                       else if (ingUnit === 'kg' && invUnit === 'g') neededQty *= 1000;
                                       else if (ingUnit === 'ml' && (invUnit === 'l' || invUnit === 'litre')) neededQty /= 1000;
                                       else if ((ingUnit === 'l' || ingUnit === 'litre') && invUnit === 'ml') neededQty *= 1000;
                                       
                                       const newInvQty = Math.max(0, parseFloat(matchedInv.quantity || 0) - neededQty);
                                       await updateDoc(doc(db, 'inventoryItems', matchedInv.id), { quantity: newInvQty });
                                   }
                               }
                           }
                        }
                      }

                      showToast("Mouvement enregistré avec succès");
                      setIsTxModalOpen(false);
                    } catch (e) {
                      showToast("Erreur lors de la sauvegarde", "error");
                      console.error(e);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-[#265C6D] text-white rounded-lg font-medium hover:bg-[#2F6B7F] transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waste Declaration Modal */}
      {isWasteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold text-gray-900">
                {editingWaste ? "Modifier la déclaration" : "Nouvelle Déclaration de Perte"}
              </h3>
              <button onClick={() => setIsWasteModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
                <Combobox
                  options={stockItemsData.map(item => item.name)}
                  value={wasteForm.item}
                  onChange={val => setWasteForm({...wasteForm, item: val})}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                  placeholder="Rechercher un produit..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                  <input 
                    type="number" 
                    value={wasteForm.qty}
                    onChange={e => setWasteForm({...wasteForm, qty: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                    placeholder="Ex: 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select 
                    value={wasteForm.unit}
                    onChange={e => setWasteForm({...wasteForm, unit: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                  >
                    <option value="kg">Kg</option>
                    <option value="g">G</option>
                    <option value="L">L</option>
                    <option value="cl">cl</option>
                    <option value="pièce(s)">pièce(s)</option>
                    <option value="bouteille(s)">bouteille(s)</option>
                    <option value="boîte(s)">boîte(s)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coût estimé (MAD)</label>
                <input 
                  type="number" 
                  value={wasteForm.cost}
                  onChange={e => setWasteForm({...wasteForm, cost: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                  placeholder="Ex: 50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cause du gaspillage</label>
                <select 
                  value={wasteForm.reason}
                  onChange={e => setWasteForm({...wasteForm, reason: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                >
                  <option value="">Sélectionner une cause...</option>
                  <option value="Date d'expiration dépassée">Date d'expiration dépassée</option>
                  <option value="Produit abîmé/oxydé">Produit abîmé/oxydé</option>
                  <option value="Erreur de préparation">Erreur de préparation</option>
                  <option value="Retour client">Retour client</option>
                  <option value="Problème de stockage/froid">Problème de stockage/froid</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={wasteForm.date}
                    onChange={e => setWasteForm({...wasteForm, date: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                  <Combobox
                    options={staffNames}
                    value={wasteForm.user}
                    onChange={val => setWasteForm({...wasteForm, user: val})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                    placeholder="Ex: Chef Hassan"
                  />
                </div>
              </div>
              
              <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => setIsWasteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={async () => {
                    if (!wasteForm.item || !wasteForm.qty || !wasteForm.reason) {
                      showToast("Veuillez remplir l'article, la quantité et la cause", "error");
                      return;
                    }
                    try {
                      if (editingWaste) {
                        await updateDoc(doc(db, 'wasteRecords', editingWaste.id), {
                          ...wasteForm,
                          updatedAt: serverTimestamp()
                        });
                        showToast("Déclaration modifiée avec succès");
                      } else {
                        await addDoc(collection(db, 'wasteRecords'), {
                          ...wasteForm,
                          createdAt: serverTimestamp()
                        });
                        showToast("Déclaration ajoutée avec succès");
                      }
                      setIsWasteModalOpen(false);
                    } catch (e) {
                      showToast("Erreur lors de la sauvegarde", "error");
                      console.error(e);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-[#265C6D] text-white rounded-lg font-medium hover:bg-[#2F6B7F] transition-colors"
                >
                  {editingWaste ? 'Mettre à jour' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production Task Modal */}
      
      
      {isSemiFinishedAdjustModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-serif font-semibold text-gray-900">Ajuster Stock</h3>
              <button onClick={() => setIsSemiFinishedAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">Produit: <span className="font-medium text-gray-900">{semiFinishedAdjustData.name}</span></p>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="adjType"
                    value="in"
                    checked={semiFinishedAdjustData.type === 'in'}
                    onChange={(e) => setSemiFinishedAdjustData({...semiFinishedAdjustData, type: e.target.value})}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-green-700">Entrée (+)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="adjType"
                    value="out"
                    checked={semiFinishedAdjustData.type === 'out'}
                    onChange={(e) => setSemiFinishedAdjustData({...semiFinishedAdjustData, type: e.target.value})}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-red-700">Sortie (-)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité {semiFinishedAdjustData.type === 'in' ? 'à ajouter' : 'à retirer'}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={semiFinishedAdjustData.adjustment}
                  onChange={(e) => setSemiFinishedAdjustData({...semiFinishedAdjustData, adjustment: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  autoFocus
                />
              </div>
              
              {semiFinishedAdjustData.type === 'out' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Point de vente (Destination)</label>
                  <select
                    value={semiFinishedAdjustData.destination || 'Cuisine'}
                    onChange={(e) => setSemiFinishedAdjustData({...semiFinishedAdjustData, destination: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B] bg-white mb-4"
                  >
                    <option value="Cuisine">Cuisine</option>
                    <option value="Bar">Bar</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif de l'ajustement</label>
                <select
                  value={semiFinishedAdjustData.reason}
                  onChange={(e) => setSemiFinishedAdjustData({...semiFinishedAdjustData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B] bg-white"
                >
                  {semiFinishedAdjustData.type === 'in' ? (
                    <>
                      <option value="Production">Production (Cuisine)</option>
                      <option value="Production (Bar)">Production (Bar)</option>
                      <option value="Ajustement d'inventaire">Ajustement d'inventaire</option>
                      <option value="Erreur de saisie">Correction / Erreur de saisie</option>
                      <option value="Autre">Autre</option>
                    </>
                  ) : (
                    <>
                      <option value="Sortie vers point de vente">Sortie vers point de vente</option>
                      <option value="Consommation interne">Consommation interne</option>
                      <option value="Perte">Perte / Avarié</option>
                      <option value="Casse">Casse / Dégât</option>
                      <option value="Ajustement d'inventaire">Ajustement d'inventaire</option>
                      <option value="Erreur de saisie">Correction / Erreur de saisie</option>
                      <option value="Autre">Autre</option>
                    </>
                  )}
                </select>
              </div>
            </div>
              {fichesTechniques.some(r => (r.nom || '').toLowerCase() === semiFinishedAdjustData.name.toLowerCase()) && (
                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                  <input type="checkbox" id="sf-tx-sync-recipe" defaultChecked={semiFinishedAdjustData.type === 'in'} className="w-4 h-4 text-[#265C6D] bg-white border-gray-300 rounded focus:ring-[#265C6D]" />
                  <label htmlFor="sf-tx-sync-recipe" className="text-sm font-medium text-blue-900">
                    Déduire les ingrédients (Fiche technique)
                  </label>
                </div>
              )}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsSemiFinishedAdjustModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button
                onClick={async () => {
                  const qty = Number(semiFinishedAdjustData.adjustment);
                  if (!isNaN(qty) && qty > 0) {
                    try {
                      const adjustmentAmount = semiFinishedAdjustData.type === 'in' ? qty : -qty;
                      const newQty = Number(semiFinishedAdjustData.quantity || 0) + adjustmentAmount;
                      
                      // Check for negative stock
                      if (newQty < 0) {
                        showToast("Le stock ne peut pas être négatif.", "error");
                        return;
                      }

                      await updateDoc(doc(db, 'semi_finished', semiFinishedAdjustData.id), { quantity: newQty });
                      
                      const shouldSync = (document.getElementById('sf-tx-sync-recipe') as HTMLInputElement)?.checked;
                      if (shouldSync) {
                         const recipe = fichesTechniques.find(r => (r.nom || '').toLowerCase() === semiFinishedAdjustData.name.toLowerCase());
                         if (recipe && recipe.ingredients) {
                             const recipePortions = parseFloat(recipe.portions) || 1;
                             for (const ing of recipe.ingredients) {
                                 let neededQty = (parseFloat(ing.quantite) || 0) * (qty / recipePortions);
                                 const ingUnit = (ing.unite || '').toLowerCase();
                                 
                                 const matchedInv = stockItemsData.find(i => i.name.toLowerCase() === ing.nom.toLowerCase());
                                 if (matchedInv && matchedInv.id) {
                                     const invUnit = (matchedInv.unit || '').toLowerCase();
                                     if (ingUnit === 'g' && invUnit === 'kg') neededQty /= 1000;
                                     else if (ingUnit === 'kg' && invUnit === 'g') neededQty *= 1000;
                                     else if (ingUnit === 'ml' && (invUnit === 'l' || invUnit === 'litre')) neededQty /= 1000;
                                     else if ((ingUnit === 'l' || ingUnit === 'litre') && invUnit === 'ml') neededQty *= 1000;
                                     
                                     const newInvQty = Math.max(0, parseFloat(matchedInv.quantity || 0) - neededQty);
                                     await updateDoc(doc(db, 'inventoryItems', matchedInv.id), { quantity: newInvQty });
                                 }
                             }
                         }
                      }
                      
                      // Also add to transactions history
                      const txData: any = {
                        itemId: semiFinishedAdjustData.id,
                        itemName: semiFinishedAdjustData.name,
                        type: semiFinishedAdjustData.type,
                        quantity: qty,
                        reason: semiFinishedAdjustData.reason,
                        date: new Date().toLocaleDateString('fr-FR'),
                        user: 'Admin', // In real app, user from auth
                        amount: qty,
                        unit: 'unit', // Or get from semiFinishedAdjustData if available
                        item: semiFinishedAdjustData.name,
                        createdAt: serverTimestamp()
                      };
                      
                      if (semiFinishedAdjustData.type === 'out' && semiFinishedAdjustData.destination) {
                        txData.destination = semiFinishedAdjustData.destination;
                        txData.reason = txData.reason === 'Ajustement' ? 'Sortie vers point de vente' : txData.reason;
                      }

                      await addDoc(collection(db, 'inventoryTransactions'), txData);

                      showToast(`Stock de ${semiFinishedAdjustData.name} mis à jour avec succès.`);
                      setIsSemiFinishedAdjustModalOpen(false);
                    } catch(e) {
                      showToast('Erreur lors de la mise à jour', 'error');
                      console.error(e);
                    }
                  } else {
                     showToast("Veuillez entrer une quantité valide (> 0)", "error");
                  }
                }}
                className={`px-6 py-2.5 text-white font-medium rounded-xl transition-colors ${semiFinishedAdjustData.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Confirmer ${semiFinishedAdjustData.type === 'in' ? "l'entrée" : "la sortie"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isSemiFinishedDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-serif font-semibold text-gray-900">Supprimer le produit</h3>
              <button onClick={() => setIsSemiFinishedDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Voulez-vous vraiment supprimer le produit <strong>{semiFinishedDeleteData.name}</strong> ?</p>
              <p className="text-sm text-red-500 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsSemiFinishedDeleteModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'semi_finished', semiFinishedDeleteData.id));
                    showToast('Produit supprimé avec succès');
                    setIsSemiFinishedDeleteModalOpen(false);
                  } catch(e) {
                    showToast('Erreur lors de la suppression', 'error');
                  }
                }}
                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}


      {isSemiFinishedModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-serif font-semibold text-gray-900">
                {semiFinishedForm.id ? 'Éditer le Plat' : 'Nouveau Plat Semi-fini'}
              </h3>
              <button onClick={() => setIsSemiFinishedModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du plat</label>
                <Combobox
                  options={[
                    "Pâte à pizza", "Sauce tomate", "Pâte brisée", "Pâte feuilletée",
                    "Fond de veau", "Bouillon de volaille", "Crème pâtissière", "Sauce béchamel",
                    ...recipes.map(r => r.name), ...fichesTechniques.map(f => f.nom || f.name), ...menuItems.map(m => m.name)
                  ]}
                  value={semiFinishedForm.name}
                  onChange={val => setSemiFinishedForm({...semiFinishedForm, name: val})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  placeholder="Ex: Tajine, Pâte à pizza, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select
                    value={semiFinishedForm.unit}
                    onChange={(e) => setSemiFinishedForm({...semiFinishedForm, unit: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  >
                    <option value="kg">Kg</option>
                    <option value="g">G</option>
                    <option value="L">L</option>
                    <option value="cl">cl</option>
                    <option value="ml">ml</option>
                    <option value="pièce">pièce</option>
                    <option value="portion">portion</option>
                    <option value="bouteille">bouteille</option>
                    <option value="boîte">boîte</option>
                    <option value="carton">carton</option>
                    <option value="botte">botte</option>
                    <option value="sachet">sachet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coût unitaire (MAD)</label>
                  <input
                    type="number"
                    step="any"
                    value={semiFinishedForm.cost}
                    onChange={(e) => setSemiFinishedForm({...semiFinishedForm, cost: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{semiFinishedForm.id ? 'Quantité en stock' : 'Stock initial'}</label>
                <input
                  type="number"
                  value={semiFinishedForm.quantity}
                  onChange={(e) => setSemiFinishedForm({...semiFinishedForm, quantity: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsSemiFinishedModalOpen(false)}
                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    const data: any = {
                      name: semiFinishedForm.name,
                      unit: semiFinishedForm.unit,
                      cost: Number(semiFinishedForm.cost) || 0,
                      quantity: Number(semiFinishedForm.quantity) || 0,
                      updatedAt: serverTimestamp()
                    };
                    if (semiFinishedForm.id) {
                      await updateDoc(doc(db, 'semi_finished', semiFinishedForm.id), data);
                      showToast('Produit mis à jour');
                    } else {
                      data.createdAt = serverTimestamp();
                      await addDoc(collection(db, 'semi_finished'), data);
                      showToast('Produit créé');
                    }
                    setIsSemiFinishedModalOpen(false);
                  } catch(e: any) {
                    console.error('Error saving:', e);
                    showToast('Erreur: ' + e.message, 'error');
                  }
                }}
                className="px-6 py-2.5 bg-[#265C6D] text-white font-medium rounded-xl hover:bg-[#1f4a58] transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}


      {isProdTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold text-gray-900">
                {editingProdTask ? "Modifier la tâche" : "Nouvelle Tâche de Production"}
              </h3>
              <button onClick={() => setIsProdTaskModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plats semi finis</label>
                <select 
                  value={prodTaskForm.item}
                  onChange={e => setProdTaskForm({...prodTaskForm, item: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                >
                  <option value="">Sélectionner un plat</option>
                  {Array.from(new Set([
                    ...recipes.map(r => r.name),
                    ...fichesTechniques.map(f => f.nom || f.name),
                    ...semiFinished.map(s => s.name)
                  ])).filter(Boolean).map((name: any, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité requise</label>
                <input 
                  type="text" 
                  value={prodTaskForm.qty}
                  onChange={e => setProdTaskForm({...prodTaskForm, qty: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]" 
                  placeholder="Ex: 10 pièces"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select 
                    value={prodTaskForm.priority}
                    onChange={e => setProdTaskForm({...prodTaskForm, priority: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                  >
                    <option value="Basse">Basse</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select 
                    value={prodTaskForm.status}
                    onChange={e => setProdTaskForm({...prodTaskForm, status: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#F4C75B]"
                  >
                    <option value="À faire">À faire</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progression: {prodTaskForm.progress}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={prodTaskForm.progress}
                  onChange={e => setProdTaskForm({...prodTaskForm, progress: parseInt(e.target.value)})}
                  className="w-full accent-[#F4C75B]"
                />
              </div>
              
              <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => setIsProdTaskModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={async () => {
                    if (!prodTaskForm.item) {
                      showToast("Veuillez entrer le nom de l'article", "error");
                      return;
                    }
                    try {
                      if (editingProdTask) {
                        await updateDoc(doc(db, 'productionTasks', editingProdTask.id), {
                          ...prodTaskForm,
                          updatedAt: serverTimestamp()
                        });
                        showToast("Tâche modifiée avec succès");
                      } else {
                        await addDoc(collection(db, 'productionTasks'), {
                          ...prodTaskForm,
                          createdAt: serverTimestamp()
                        });
                        showToast("Tâche ajoutée avec succès");
                      }
                      setIsProdTaskModalOpen(false);
                    } catch (e) {
                      showToast("Erreur lors de la sauvegarde", "error");
                      console.error(e);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-[#265C6D] text-white rounded-lg font-medium hover:bg-[#2F6B7F] transition-colors"
                >
                  {editingProdTask ? 'Mettre à jour' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Supprimer la tâche"
        message="Êtes-vous sûr de vouloir supprimer cette tâche de production ?"
        onConfirm={async () => {
          try {
            await deleteDoc(doc(db, 'productionTasks', taskToDelete as string));
            showToast("Tâche supprimée");
          } catch (e) {
            console.error(e);
            showToast("Erreur lors de la suppression", "error");
          }
          setTaskToDelete(null);
        }}
        onCancel={() => setTaskToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!wasteToDelete}
        title="Supprimer l'entrée"
        message="Êtes-vous sûr de vouloir supprimer cette entrée de perte/gaspillage ?"
        onConfirm={async () => {
          try {
            await deleteDoc(doc(db, 'wasteRecords', wasteToDelete as string));
            showToast("Entrée supprimée");
          } catch (e) {
            console.error(e);
            showToast("Erreur lors de la suppression", "error");
          }
          setWasteToDelete(null);
        }}
        onCancel={() => setWasteToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!supplierToDelete}
        title="Supprimer le fournisseur"
        message="Êtes-vous sûr de vouloir supprimer ce fournisseur ?"
        onConfirm={async () => {
          try {
            await deleteDoc(doc(db, 'fournisseurs', supplierToDelete as string));
            showToast("Fournisseur supprimé");
          } catch (e) {
            console.error(e);
            showToast("Erreur lors de la suppression", "error");
          }
          setIsEditSupplierModalOpen(false);
          setSupplierToDelete(null);
        }}
        onCancel={() => setSupplierToDelete(null)}
      />
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
  const [generalConfig, setGeneralConfig] = useState({
    name: 'Mouda Palace',
    category: 'Restaurant Gastronomique',
    address: 'Fès, Maroc',
    email: 'contact@moudapalace.com',
    phone: '+212 524 00 00 00',
    currency: 'MAD (Dirham)',
    timezone: 'UTC+1 (Casablanca)'
  });
  const [notificationsConfig, setNotificationsConfig] = useState({
    newReservations: true,
    negativeReviews: true,
    weeklyReports: false
  });
  const [billingConfig, setBillingConfig] = useState({
    visaEnabled: true,
    mastercardEnabled: true,
    cmiEnabled: true,
    stripePublicKey: '',
    stripeSecretKey: ''
  });
  const [integrationsConfig, setIntegrationsConfig] = useState({
    whatsappToken: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    const loadSettingsConfig = async () => {
      try {
        const docRef = doc(db, 'settings', 'website');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWebsiteConfig(prev => ({ ...prev, ...docSnap.data() }));
        }
        const genRef = doc(db, 'settings', 'general');
        const genSnap = await getDoc(genRef);
        if (genSnap.exists()) {
          setGeneralConfig(prev => ({ ...prev, ...genSnap.data() }));
        }
        const notifRef = doc(db, 'settings', 'notifications');
        const notifSnap = await getDoc(notifRef);
        if (notifSnap.exists()) {
          setNotificationsConfig(prev => ({ ...prev, ...notifSnap.data() }));
        }
        const billingRef = doc(db, 'settings', 'billing');
        const billingSnap = await getDoc(billingRef);
        if (billingSnap.exists()) {
          setBillingConfig(prev => ({ ...prev, ...billingSnap.data() }));
        }
        const integrationsRef = doc(db, 'settings', 'integrations');
        const integrationsSnap = await getDoc(integrationsRef);
        if (integrationsSnap.exists()) {
          setIntegrationsConfig(prev => ({ ...prev, ...integrationsSnap.data() }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration:", error);
      }
    };
    loadSettingsConfig();
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
      } else if (activeSettingsTab === 'general') {
        const docRef = doc(db, 'settings', 'general');
        await setDoc(docRef, generalConfig, { merge: true });
      } else if (activeSettingsTab === 'notifications') {
        const docRef = doc(db, 'settings', 'notifications');
        await setDoc(docRef, notificationsConfig, { merge: true });
      } else if (activeSettingsTab === 'billing') {
        const docRef = doc(db, 'settings', 'billing');
        await setDoc(docRef, billingConfig, { merge: true });
      } else if (activeSettingsTab === 'integrations') {
        const docRef = doc(db, 'settings', 'integrations');
        await setDoc(docRef, integrationsConfig, { merge: true });
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
          <h2 className="text-3xl font-serif text-[#265C6D] font-semibold mb-2">Configuration</h2>
          <p className="text-gray-500">Paramètres généraux de l'établissement.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-[#265C6D] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#2F6B7F] transition-colors disabled:opacity-50">
          <Save size={18} />
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex flex-col gap-2">
          <SettingsTab active={activeSettingsTab === 'general'} onClick={() => setActiveSettingsTab('general')} icon={<Building size={18} />} label="Général" />
          <SettingsTab active={activeSettingsTab === 'integrations'} onClick={() => setActiveSettingsTab('integrations')} icon={<Globe size={18} />} label="Intégrations & IA" />
          <SettingsTab active={activeSettingsTab === 'sync'} onClick={() => setActiveSettingsTab('sync')} icon={<Database size={18} />} label="Synchronisation Firestore" />
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
                  <h3 className="text-xl font-serif font-medium text-[#265C6D] mb-0 border-0 pb-0">Informations de l'Établissement</h3>
                  <a href="/DOCUMENTATION.pdf" target="_blank" download className="flex items-center gap-2 px-4 py-2 bg-[#F4C75B] text-white rounded-lg text-sm font-medium hover:bg-[#E5B745] transition-colors shadow-sm">
                    <Download size={16} />
                    Documentation (PDF)
                  </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'établissement</label>
                    <input type="text" value={generalConfig.name} onChange={(e) => setGeneralConfig({...generalConfig, name: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select value={generalConfig.category} onChange={(e) => setGeneralConfig({...generalConfig, category: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors bg-white">
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
                    <input type="text" value={generalConfig.address} onChange={(e) => setGeneralConfig({...generalConfig, address: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                    <input type="email" value={generalConfig.email} onChange={(e) => setGeneralConfig({...generalConfig, email: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="text" value={generalConfig.phone} onChange={(e) => setGeneralConfig({...generalConfig, phone: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors" />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 mb-6 text-[#265C6D]">Localisation & Devise</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Devise principale</label>
                    <select className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors bg-white">
                      <option>MAD (Dirham)</option>
                      <option>EUR (€)</option>
                      <option>USD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
                    <select className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors bg-white">
                      <option>UTC+1 (Casablanca)</option>
                      <option>UTC+0 (Londres)</option>
                      <option>UTC+2 (Paris)</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSettingsTab === 'sync' && (
            <SyncStatusPanel />
          )}

          {activeSettingsTab === 'integrations' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 text-[#265C6D]">Clés API et Intégrations</h3>
              
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
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${integrationsConfig.whatsappToken ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                      {integrationsConfig.whatsappToken ? 'Configuré' : 'Configuration requise'}
                    </span>
                  </div>
                  <input type="text" value={integrationsConfig.whatsappToken} onChange={(e) => setIntegrationsConfig({...integrationsConfig, whatsappToken: e.target.value})} placeholder="Collez votre jeton d'accès WhatsApp ici..." className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors bg-white" />
                </div>
              </div>
            </motion.div>
          )}

          {activeSettingsTab === 'website' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 text-[#265C6D]">Configuration du site web</h3>
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
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors" 
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
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe d'application</label>
                    <input 
                      type="password" 
                      value={websiteConfig.password} 
                      onChange={e => setWebsiteConfig({...websiteConfig, password: e.target.value})} 
                      placeholder="xxxx xxxx xxxx xxxx" 
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors" 
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
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Cette URL est utilisée par le module de rédaction IA pour publier directement sur votre site.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSettingsTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 text-[#265C6D]">Préférences de Notification</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900">Nouvelles réservations</h4>
                    <p className="text-sm text-gray-500">Recevoir un email pour chaque nouvelle réservation.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificationsConfig.newReservations} onChange={(e) => setNotificationsConfig({...notificationsConfig, newReservations: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4C75B]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900">Avis clients négatifs</h4>
                    <p className="text-sm text-gray-500">Alerte immédiate par SMS en cas d'avis inférieur à 3 étoiles.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificationsConfig.negativeReviews} onChange={(e) => setNotificationsConfig({...notificationsConfig, negativeReviews: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4C75B]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-900">Rapports d'activité</h4>
                    <p className="text-sm text-gray-500">Recevoir le résumé hebdomadaire par email.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificationsConfig.weeklyReports} onChange={(e) => setNotificationsConfig({...notificationsConfig, weeklyReports: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4C75B]"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {activeSettingsTab === 'billing' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 mb-6 text-[#265C6D]">Méthodes de paiement acceptées</h3>
                
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
                      <input type="checkbox" checked={billingConfig.visaEnabled} onChange={(e) => setBillingConfig({...billingConfig, visaEnabled: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4C75B]"></div>
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
                      <input type="checkbox" checked={billingConfig.mastercardEnabled} onChange={(e) => setBillingConfig({...billingConfig, mastercardEnabled: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4C75B]"></div>
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
                      <input type="checkbox" checked={billingConfig.cmiEnabled} onChange={(e) => setBillingConfig({...billingConfig, cmiEnabled: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4C75B]"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 mb-6 text-[#265C6D]">Intégration Stripe</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clé publique (Publishable key)</label>
                    <input type="text" value={billingConfig.stripePublicKey} onChange={(e) => setBillingConfig({...billingConfig, stripePublicKey: e.target.value})} placeholder="pk_live_..." className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clé secrète (Secret key)</label>
                    <input type="password" value={billingConfig.stripeSecretKey} onChange={(e) => setBillingConfig({...billingConfig, stripeSecretKey: e.target.value})} placeholder="sk_live_..." className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-colors" />
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
          ? 'bg-white text-[#F4C75B] shadow-sm border border-gray-100' 
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
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-sm mb-3 ${active ? 'bg-[#F4C75B] text-[#265C6D] font-medium shadow-[0_0_15px_rgba(244,199,91,0.3)]' : 'text-[#F4C75B] border border-[#F4C75B]/30 hover:bg-[#F4C75B]/10'}`}
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
      <div className="text-3xl font-serif font-semibold text-[#265C6D] mb-1">
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-auto">
        {subtitle}
      </div>
    </motion.div>
  );
}

function IntegrationRow({ name, status, desc }: { name: string, status: string, desc: string }) {
  const isConnected = status === 'Connecté';
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-medium text-gray-900">{name}</h4>
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider border ${isConnected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
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
    <div className="min-h-screen bg-gradient-to-br from-[#265C6D] to-[#2a2a2a] flex items-center justify-center p-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none transition-transform duration-[3000ms] ease-out group-hover:scale-110" style={{ backgroundImage: "url('/img1-3.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-24 bg-[#F4C75B] mb-6" style={{
            maskImage: 'url(/mouda-1-1-1.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url(/mouda-1-1-1.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center'
          }} />
          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-wide mb-4">MOUDA PALACE</h1>
          <p className="text-[#F4C75B] tracking-[0.2em] uppercase text-sm font-medium">Système de Gestion Centralisé</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => onSelect('admin')}
            className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-[#F4C75B]/50 transition-all text-left flex flex-col items-center text-center gap-6"
          >
            <div className="p-4 bg-[#F4C75B]/20 text-[#F4C75B] rounded-2xl group-hover:scale-110 transition-transform">
              <Settings size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-white mb-2">Accès Administration</h3>
              <p className="text-gray-400 text-sm">Tableau de bord, gestion des réservations, stocks et configuration.</p>
            </div>
          </button>

          <button 
            onClick={() => onSelect('partner')}
            className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-[#F4C75B]/50 transition-all text-left flex flex-col items-center text-center gap-6"
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
      <div className="min-h-screen bg-gradient-to-br from-[#265C6D] to-[#2a2a2a] flex items-center justify-center p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none transition-transform duration-[3000ms] ease-out group-hover:scale-110" style={{ backgroundImage: "url('/img1-3.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Briefcase size={32} />
            </div>
            <h2 className="text-2xl font-serif text-[#265C6D] font-semibold mb-2">Espace Partenaire</h2>
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] transition-all text-center text-lg tracking-[0.2em]"
                  placeholder="••••••••"
                />
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>
              <button 
                type="submit"
                className="w-full bg-[#265C6D] text-white py-3.5 rounded-xl font-medium hover:bg-[#2F6B7F] transition-colors mb-4"
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
            <h2 className="text-3xl font-serif text-[#265C6D] font-semibold mb-2">Espace Partenaire</h2>
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

export default App;
