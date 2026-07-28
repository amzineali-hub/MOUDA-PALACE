import { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  X,
  Printer
} from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useEffect } from 'react';

export default function Accounting() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const [reportType, setReportType] = useState('Bilan Comptable');
  const [reportFormat, setReportFormat] = useState('PDF');
  const [reportPeriod, setReportPeriod] = useState('Mois en cours');

  const handleDownloadReport = (type: string, format: string) => {
    let finalFormat = format;
    if (format.includes('PDF') || format.includes('XML')) {
      showToast(`Format ${format} simulé, téléchargement au format CSV.`);
      finalFormat = 'CSV';
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Rapport:,${type}\n`;
    csvContent += `Mois,Revenus,Depenses\n`;
    monthlyRevenueData.forEach(data => {
      csvContent += `${data.name},${data.revenus},${data.depenses}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rapport_${type.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Rapport ${type} téléchargé`);
  };

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === 'invoices') {
      csvContent += "ID,Client,ICE,Date,Montant,Statut\n";
      invoices.forEach(inv => {
        csvContent += `${inv.id},${inv.client},${inv.ice},${inv.date},${inv.amount.replace(/ /g, '')},${inv.status}\n`;
      });
    } else if (activeTab === 'expenses') {
      csvContent += "ID,Categorie,Beneficiaire,Date,Methode,Montant\n";
      expenses.forEach(exp => {
        csvContent += `${exp.id},${exp.category},${exp.supplier},${exp.date},${exp.method},${exp.amount.replace(/ /g, '')}\n`;
      });
    } else if (activeTab === 'receipts') {
      csvContent += "ID,Date,Methode,Montant\n";
      receipts.forEach(rec => {
        csvContent += `${rec.id},${rec.date},${rec.method},${rec.amount}\n`;
      });
    } else {
      showToast("Rien à exporter pour cette section");
      return;
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("Exportation réussie");
  };

  const [invoices, setInvoices] = useState<any[]>([
    { id: 'FAC-2026-001', client: 'Riad Al Andalous', ice: '001538629000041', date: '12 Nov 2026', amount: '1 250 MAD', status: 'Payée' },
    { id: 'FAC-2026-002', client: 'Atlas Voyages', ice: '002148574000034', date: '14 Nov 2026', amount: '4 500 MAD', status: 'En attente' },
    { id: 'FAC-2026-003', client: 'LocaCar Marrakech', ice: '001937482000021', date: '15 Nov 2026', amount: '850 MAD', status: 'Payée' },
    { id: 'FAC-2026-004', client: 'Hôtel La Medina', ice: '002594837000067', date: '18 Nov 2026', amount: '3 200 MAD', status: 'Retard' }
  ]);
  
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'invoices'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (error) => {
      console.error("Error fetching invoices", error);
    });
    return () => unsub();
  }, []);

  const [expenses, setExpenses] = useState<any[]>([
    { id: 'EXP-001', category: 'Marchandise', supplier: 'Marché Central', date: '19 Nov 2026', amount: '2 300 MAD', method: 'Espèces' },
    { id: 'EXP-002', category: 'Électricité', supplier: 'ONEE', date: '18 Nov 2026', amount: '1 850 MAD', method: 'Virement' },
    { id: 'EXP-003', category: 'Marketing', supplier: 'Facebook Ads', date: '15 Nov 2026', amount: '500 MAD', method: 'Carte Bancaire' },
  ]);

  const [financialReports, setFinancialReports] = useState<any[]>([
    { id: 'RPT-2026-11', type: 'Bilan Comptable', date: '30 Nov 2026', status: 'Généré', format: 'PDF' },
    { id: 'RPT-2026-T3', type: 'Déclaration TVA (Maroc)', date: '15 Oct 2026', status: 'Soumis', format: 'PDF / XML' },
    { id: 'RPT-2026-10', type: 'CPC (Compte de Produits et Charges)', date: '31 Oct 2026', status: 'Généré', format: 'Excel' },
    { id: 'RPT-2026-09', type: 'Bilan Comptable', date: '30 Sep 2026', status: 'Généré', format: 'PDF' },
  ]);

  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    const unsubReceipts = onSnapshot(query(collection(db, 'cash_receipts'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setReceipts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (error) => {
      console.error("Error fetching receipts", error);
    });
    return () => unsubReceipts();
  }, []);

  useEffect(() => {
    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });
    const unsubReports = onSnapshot(query(collection(db, 'financialReports'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setFinancialReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    });
    return () => {
      unsubExpenses();
      unsubReports();
    };
  }, []);

  const monthlyRevenueData = [
    { name: 'Juin', revenus: 85000, depenses: 32000 },
    { name: 'Juil', revenus: 110000, depenses: 45000 },
    { name: 'Août', revenus: 135000, depenses: 51000 },
    { name: 'Sept', revenus: 95000, depenses: 38000 },
    { name: 'Oct', revenus: 105000, depenses: 40000 },
    { name: 'Nov', revenus: 124500, depenses: 42800 },
  ];

  const expensesByCategoryData = [
    { name: 'Marchandise', value: 45000 },
    { name: 'Salaires', value: 35000 },
    { name: 'Loyer & Charges', value: 15000 },
    { name: 'Marketing', value: 5000 },
    { name: 'Divers', value: 2500 },
  ];
  const COLORS = ['#DDA956', '#1A1A1A', '#4b5563', '#9ca3af', '#e5e7eb'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payée': return 'bg-green-50 text-green-700 border-green-200';
      case 'En attente': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Retard': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">Facturation & Comptabilité</h2>
          <p className="text-gray-500">Gérez vos factures, suivez vos dépenses et analysez vos finances.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { try { if (window !== window.top) { showToast("L'impression est bloquée dans cet aperçu. Cliquez sur l'icône 'Ouvrir dans un nouvel onglet' (flèche en haut à droite).", "error"); } else { window.print(); } } catch(e) { showToast("Erreur d'impression", "error"); } }}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            title="Exporter en PDF (Impression)"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#333] transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nouvelle Facture</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Chiffre d'Affaires (Mois)</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-serif text-gray-900 mb-1">124 500 MAD</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp size={14} /> +12% vs mois dernier
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Dépenses (Mois)</h3>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-3xl font-serif text-gray-900 mb-1">42 800 MAD</p>
          <p className="text-sm text-red-600 flex items-center gap-1">
            <TrendingUp size={14} /> +5% vs mois dernier
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Factures en attente</h3>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-3xl font-serif text-gray-900 mb-1">7 700 MAD</p>
          <p className="text-sm text-gray-500">2 factures impayées</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] p-2">
          <nav className="flex overflow-x-auto hide-scrollbar gap-2">
            {['invoices', 'receipts', 'expenses', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#DDA956]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {tab === 'invoices' && 'Factures Clients'}
                {tab === 'receipts' && 'Recettes Caisses'}
                {tab === 'expenses' && 'Dépenses & Achats'}
                {tab === 'reports' && 'Rapports Financiers'}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="accounting-active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DDA956]"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder={activeTab === 'invoices' ? "Rechercher une facture..." : activeTab === 'receipts' ? "Rechercher un encaissement..." : "Rechercher une dépense..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] bg-white"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={() => showToast && showToast('Action en cours de développement...')}  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter size={18} />
              <span className="text-sm font-medium">Filtrer</span>
            </button>
          </div>
        </div>

        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">N° Facture</th>
                  <th className="px-6 py-4">Client / Partenaire</th>
                  <th className="px-6 py-4">ICE</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Montant</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900">{invoice.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{invoice.client}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{invoice.ice}</td>
                    <td className="px-6 py-4 text-gray-500">{invoice.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 text-right">{invoice.amount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => showToast && showToast('Action en cours de développement...')}  className="p-1.5 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-gray-100" title="Voir la facture">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => showToast && showToast('Action en cours de développement...')}  className="p-1.5 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-gray-100" title="Télécharger PDF">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">ID Encaiss.</th>
                  <th className="px-6 py-4">Date & Heure</th>
                  <th className="px-6 py-4">Méthode</th>
                  <th className="px-6 py-4 text-right">Montant</th>
                  <th className="px-6 py-4 text-center">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receipts.map((receipt, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900">{receipt.displayId || 'TKT-' + receipt.id.substring(0, 6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {receipt.createdAt?.toDate ? receipt.createdAt.toDate().toLocaleString('fr-FR') : receipt.date}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{receipt.method}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 text-right">{receipt.amount.toFixed(2)} MAD</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => showToast(`${receipt.items?.length || 0} articles dans ce ticket`)} className="p-1.5 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-gray-100" title="Voir le ticket">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {receipts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Aucune recette caisse trouvée. Les encaissements du POS apparaîtront ici.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">N° Dépense</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Bénéficiaire</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Méthode</th>
                  <th className="px-6 py-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((expense, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900">{expense.id}</td>
                    <td className="px-6 py-4 text-gray-900">{expense.category}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{expense.supplier}</td>
                    <td className="px-6 py-4 text-gray-500">{expense.date}</td>
                    <td className="px-6 py-4 text-gray-500">{expense.method}</td>
                    <td className="px-6 py-4 font-medium text-red-600 text-right">-{expense.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        
        {/* Déclaration TVA */}
        {activeTab === 'tva' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Déclaration TVA (Période en cours)</h2>
              <button className="bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium">Générer la déclaration</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-2">TVA Collectée (Ventes)</p>
                <p className="text-2xl font-bold text-gray-900">45 230.50 MAD</p>
                <p className="text-xs text-green-600 mt-2">+12% vs mois précédent</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-2">TVA Déductible (Achats)</p>
                <p className="text-2xl font-bold text-gray-900">18 450.00 MAD</p>
                <p className="text-xs text-red-600 mt-2">+5% vs mois précédent</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <p className="text-sm text-indigo-700 font-medium mb-2">TVA à décaisser (Due)</p>
                <p className="text-2xl font-bold text-indigo-900">26 780.50 MAD</p>
                <p className="text-xs text-indigo-600 mt-2">À payer avant le 20 du mois</p>
              </div>
            </div>
            
            <h3 className="font-medium text-gray-900 mb-4">Détails des opérations taxables</h3>
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Période</th>
                    <th className="px-6 py-4 text-right">CA HT</th>
                    <th className="px-6 py-4 text-right">TVA 20%</th>
                    <th className="px-6 py-4 text-right">TVA 10%</th>
                    <th className="px-6 py-4 text-right">TVA Déductible</th>
                    <th className="px-6 py-4 text-right">TVA Nette</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">Juin 2026</td>
                    <td className="px-6 py-4 text-right">226 152.00 MAD</td>
                    <td className="px-6 py-4 text-right">45 230.40 MAD</td>
                    <td className="px-6 py-4 text-right">0.00 MAD</td>
                    <td className="px-6 py-4 text-right">18 450.00 MAD</td>
                    <td className="px-6 py-4 text-right font-medium text-indigo-700">26 780.40 MAD</td>
                    <td className="px-6 py-4 text-center"><span className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">À déclarer</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">Mai 2026</td>
                    <td className="px-6 py-4 text-right">198 400.00 MAD</td>
                    <td className="px-6 py-4 text-right">39 680.00 MAD</td>
                    <td className="px-6 py-4 text-right">0.00 MAD</td>
                    <td className="px-6 py-4 text-right">15 200.00 MAD</td>
                    <td className="px-6 py-4 text-right font-medium text-indigo-700">24 480.00 MAD</td>
                    <td className="px-6 py-4 text-center"><span className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">Payée</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Journal Comptable */}
        {activeTab === 'journal' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Journal des Écritures</h2>
              <div className="flex gap-2">
                <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"><Download size={16}/> Exporter</button>
                <button className="bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"><Plus size={16}/> Saisie manuelle</button>
              </div>
            </div>
            
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">N° Pièce</th>
                    <th className="px-6 py-4">Compte</th>
                    <th className="px-6 py-4">Libellé</th>
                    <th className="px-6 py-4 text-right">Débit</th>
                    <th className="px-6 py-4 text-right">Crédit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">12/07/2026</td>
                    <td className="px-6 py-4 font-medium">ACH-245</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">6111 - Achats march.</span></td>
                    <td className="px-6 py-4">Facture Boucherie Centrale</td>
                    <td className="px-6 py-4 text-right text-gray-900">4,500.00</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-gray-50/30">
                    <td className="px-6 py-4 text-gray-500">12/07/2026</td>
                    <td className="px-6 py-4 font-medium">ACH-245</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">3455 - TVA Réc. chg</span></td>
                    <td className="px-6 py-4">TVA s/ Fact Boucherie Centrale</td>
                    <td className="px-6 py-4 text-right text-gray-900">900.00</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-gray-50/30">
                    <td className="px-6 py-4 text-gray-500">12/07/2026</td>
                    <td className="px-6 py-4 font-medium">ACH-245</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">4411 - Fournisseurs</span></td>
                    <td className="px-6 py-4">Facture Boucherie Centrale</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                    <td className="px-6 py-4 text-right font-medium">5,400.00</td>
                  </tr>
                  
                  <tr className="hover:bg-gray-50 transition-colors border-t-2 border-gray-200">
                    <td className="px-6 py-4 text-gray-500">15/07/2026</td>
                    <td className="px-6 py-4 font-medium">VTE-992</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">5141 - Banques</span></td>
                    <td className="px-6 py-4">Ventes du 15/07 POS</td>
                    <td className="px-6 py-4 text-right font-medium">12,500.00</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-gray-50/30">
                    <td className="px-6 py-4 text-gray-500">15/07/2026</td>
                    <td className="px-6 py-4 font-medium">VTE-992</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">7111 - Ventes march.</span></td>
                    <td className="px-6 py-4">Ventes du 15/07 POS</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                    <td className="px-6 py-4 text-right text-gray-900">10,416.67</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-gray-50/30">
                    <td className="px-6 py-4 text-gray-500">15/07/2026</td>
                    <td className="px-6 py-4 font-medium">VTE-992</td>
                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">4455 - TVA Fact.</span></td>
                    <td className="px-6 py-4">TVA s/ Ventes du 15/07 POS</td>
                    <td className="px-6 py-4 text-right text-gray-400">-</td>
                    <td className="px-6 py-4 text-right text-gray-900">2,083.33</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-medium">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right">Total Période</td>
                    <td className="px-6 py-4 text-right text-[#DDA956]">17,900.00</td>
                    <td className="px-6 py-4 text-right text-[#DDA956]">17,900.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-gray-900 font-medium mb-6">Évolution mensuelle du chiffre d'affaires</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `${val / 1000}k`} />
                      <Tooltip 
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="revenus" name="Revenus (CA)" fill="#DDA956" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="depenses" name="Dépenses" fill="#1A1A1A" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-gray-900 font-medium mb-6">Répartition des dépenses par catégorie</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expensesByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-2">
              <h3 className="text-gray-900 font-medium mb-4 sm:mb-0">Rapports Récents</h3>
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#333] transition-colors inline-flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Nouveau Rapport
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-y border-gray-100">
                  <tr>
                    <th className="px-6 py-4">ID Rapport</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Date de génération</th>
                    <th className="px-6 py-4">Format</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {financialReports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-500 text-xs">{report.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{report.type}</td>
                      <td className="px-6 py-4 text-gray-500">{report.date}</td>
                      <td className="px-6 py-4 text-gray-500">{report.format}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${report.status === 'Généré' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => showToast && showToast('Action en cours de développement...')}  className="p-1.5 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-gray-100" title="Voir le rapport">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDownloadReport(report.type, report.format)} className="p-1.5 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-gray-100" title="Télécharger">
                            <Download size={16} />
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
      </div>

      {/* New Invoice Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouvelle Facture</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newInvoice = {
                client: formData.get('client'),
                ice: formData.get('ice'),
                amount: Number(formData.get('amount')) + ' MAD',
                date: formData.get('date'),
                status: 'En attente',
                createdAt: serverTimestamp()
              };
              
              // Optimistic update
              setInvoices([{ id: 'FAC-NOUVEAU', ...newInvoice }, ...invoices]);
              setIsNewModalOpen(false);
              showToast("Facture créée avec succès");
              
              try {
                await addDoc(collection(db, 'invoices'), newInvoice);
              } catch (err) {
                console.error("Error creating invoice", err);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client / Partenaire</label>
                <input name="client" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Nom du client" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ICE du Client (15 chiffres)</label>
                <input name="ice" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 001538629000041" maxLength={15} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
                <input name="amount" required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                <input name="date" required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Créer la facture
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Générer un Rapport</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option>Bilan Comptable</option>
                  <option>CPC (Compte de Produits et Charges)</option>
                  <option>Déclaration TVA (Maroc)</option>
                  <option>Livre Journal</option>
                  <option>Grand Livre</option>
                  <option>Balance des Comptes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
                <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option>Mois en cours</option>
                  <option>Mois précédent</option>
                  <option>Trimestre en cours</option>
                  <option>Année en cours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format d'export</label>
                <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option>PDF</option>
                  <option>Excel / CSV</option>
                  <option>XML</option>
                </select>
              </div>
              <button 
                onClick={async () => {
                  handleDownloadReport(reportType, reportFormat);
                  const newReport = {
                    id: 'RPT-' + Date.now().toString().slice(-4),
                    type: reportType,
                    date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: 'Généré',
                    format: reportFormat,
                    createdAt: serverTimestamp()
                  };
                  setFinancialReports([newReport, ...financialReports]);
                  setIsReportModalOpen(false);
                  
                  try {
                    await addDoc(collection(db, 'financialReports'), newReport);
                  } catch (err) {
                    console.error("Error creating report", err);
                  }
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Générer et télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
