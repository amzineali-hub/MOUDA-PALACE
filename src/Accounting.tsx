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
  Printer,
  QrCode,
  Pencil,
  Trash2
} from 'lucide-react';
import { useToast } from './context/ToastContext';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useEffect, useMemo } from 'react';

export default function Accounting() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isNewReceiptModalOpen, setIsNewReceiptModalOpen] = useState(false);
  const [isEditReceiptModalOpen, setIsEditReceiptModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<any>(null);
  const [editReceiptAmount, setEditReceiptAmount] = useState("");
  const [editReceiptMethod, setEditReceiptMethod] = useState("");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  
  useEffect(() => {
    const unsubInv = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsubFourn = onSnapshot(query(collection(db, 'fournisseurs')), (snapshot) => {
      setFournisseurs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsubInv(); unsubFourn(); };
  }, []);

  const suppliersList = useMemo(() => {
    const dbSuppliers = inventoryItems.map((item: any) => item.supplier?.trim()).filter(Boolean).filter(s => s !== 'Non renseigné');
    const annuaireFournisseurs = fournisseurs.map(f => (f.name || f.nom)?.trim()).filter(Boolean);
    return Array.from(new Set([...dbSuppliers, ...annuaireFournisseurs])).sort();
  }, [inventoryItems, fournisseurs]);

  const categories = useMemo(() => {
    const defaultCats = ['Marchandise', 'Électricité', 'Marketing', 'Salaires', 'Loyer & Charges', 'Divers', 'Assurances', 'Frais Bancaires', 'Entretien & Réparations'];
    const dbCats = inventoryItems.map((item: any) => item.category?.trim()).filter(Boolean);
    const dbFournisseurCats = fournisseurs.map(f => (f.category || f.categorie)?.trim()).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats, ...dbFournisseurCats])).sort();
  }, [inventoryItems, fournisseurs]);

  
  const [reportType, setReportType] = useState('Bilan Comptable');
  const [reportFormat, setReportFormat] = useState('PDF');
  const [reportPeriod, setReportPeriod] = useState('Mois en cours');

  const handleDownloadReport = (type: string, format: string) => {
    let finalFormat = format;
    if (format.includes('PDF') || format.includes('XML')) {
      showToast(`Format ${format} simulé, téléchargement au format CSV.`);
      finalFormat = 'CSV';
    }
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += `Rapport:;${type}\n`;
    
    if (type === 'Bilan Comptable') {
      csvContent += "\n";
      csvContent += "ACTIF;;PASSIF;\n";
      csvContent += "Rubrique;Montant;Rubrique;Montant\n";
      csvContent += "Actif Immobilisé;895000.00;Financement Permanent;1245400.00\n";
      csvContent += "Actif Circulant;165700.00;Passif Circulant;151500.00\n";
      csvContent += "Trésorerie Actif;336200.00;Trésorerie Passif;0.00\n";
      csvContent += "\n";
      csvContent += "TOTAL ACTIF;1396900.00;TOTAL PASSIF;1396900.00\n";
    } else if (type === 'Livre Journal') {
      csvContent += "\n";
      csvContent += "Date;Compte;Libellé;Débit;Crédit\n";
      csvContent += "01/11/2026;5141;Banque (Solde initial);320400.00;\n";
      csvContent += "02/11/2026;7111;Ventes de marchandises;45200.00;\n";
      csvContent += "02/11/2026;4455;TVA facturée;;9040.00\n";
      csvContent += "03/11/2026;6111;Achats de marchandises;;15000.00\n";
      csvContent += "03/11/2026;3455;TVA récupérable;3000.00;\n";
      csvContent += "04/11/2026;5161;Caisse (Recettes du jour);15800.00;\n";
    } else {
      csvContent += `Mois;Revenus;Depenses\n`;
      monthlyRevenueData.forEach(data => {
        csvContent += `${data.name};${data.revenus};${data.depenses}\n`;
      });
    }
    
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
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    if (activeTab === 'invoices') {
      csvContent += "ID;Client;ICE;Date;Montant;Statut\n";
      invoices.forEach(inv => {
        csvContent += `${inv.id};${inv.client};${inv.ice};${inv.date};${inv.amount.replace(/ /g, '')};${inv.status}\n`;
      });
    } else if (activeTab === 'expenses') {
      csvContent += "ID;Categorie;Beneficiaire;Date;Methode;Montant\n";
      expenses.forEach(exp => {
        csvContent += `${exp.id};${exp.category};${exp.supplier};${exp.date};${exp.method};${exp.amount.replace(/ /g, '')}\n`;
      });
    } else if (activeTab === 'receipts') {
      csvContent += "ID;Date;Methode;Montant\n";
      receipts.forEach(rec => {
        csvContent += `${rec.displayId || 'TKT-' + rec.id.substring(0, 6).toUpperCase()};${rec.createdAt?.toDate ? rec.createdAt.toDate().toLocaleString('fr-FR') : rec.date};${rec.method};${rec.amount}\n`;
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
  const handleDeleteReceipt = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet encaissement ?")) {
      try {
        await deleteDoc(doc(db, "cash_receipts", id));
        showToast("Encaissement supprimé avec succès");
      } catch (error) {
        console.error(error);
        showToast("Erreur lors de la suppression", "error");
      }
    }
  };

  const handleUpdateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReceipt || !editReceiptAmount || !editReceiptMethod) return;
    try {
      await updateDoc(doc(db, "cash_receipts", editingReceipt.id), {
        amount: parseFloat(editReceiptAmount),
        method: editReceiptMethod
      });
      showToast("Encaissement mis à jour");
      setIsEditReceiptModalOpen(false);
      setEditingReceipt(null);
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la mise à jour", "error");
    }
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
        setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }
    }, (error) => {
      console.error("Error fetching invoices", error);
    });
    return () => unsub();
  }, []);

  const [expenses, setExpenses] = useState<any[]>([]);

  const [financialReports, setFinancialReports] = useState<any[]>([
    { id: 'RPT-2026-11', type: 'Bilan Comptable', date: '30 Nov 2026', status: 'Généré', format: 'PDF' },
    { id: 'RPT-2026-T3', type: 'Déclaration TVA (Maroc)', date: '15 Oct 2026', status: 'Soumis', format: 'PDF / XML' },
    { id: 'RPT-2026-10', type: 'CPC (Compte de Produits et Charges)', date: '31 Oct 2026', status: 'Généré', format: 'Excel' },
    { id: 'RPT-2026-09', type: 'Bilan Comptable', date: '30 Sep 2026', status: 'Généré', format: 'PDF' },
  ]);

  const [receipts, setReceipts] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    const unsubReceipts = onSnapshot(query(collection(db, 'cash_receipts'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setReceipts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }
    }, (error) => {
      console.error("Error fetching receipts", error);
    });
    return () => unsubReceipts();
  }, []);

  useEffect(() => {
    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsubReports = onSnapshot(query(collection(db, 'financialReports'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setFinancialReports(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
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
  const COLORS = ['#F4C75B', '#1A1A1A', '#4b5563', '#9ca3af', '#e5e7eb'];

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
            onClick={() => {
              setTimeout(() => window.print(), 100);
            }}
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
            onClick={() => {
              if (activeTab === 'invoices') setIsNewModalOpen(true);
              else if (activeTab === 'expenses') setIsNewExpenseModalOpen(true);
              else if (activeTab === 'receipts') setIsNewReceiptModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#333] transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">
              {activeTab === 'invoices' ? 'Nouvelle Facture' : activeTab === 'expenses' ? 'Nouvelle Dépense' : activeTab === 'receipts' ? 'Nouvel Encaissement' : 'Nouveau'}
            </span>
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
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#F4C75B]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {tab === 'invoices' && 'Factures Clients'}
                {tab === 'receipts' && 'Recettes Caisses'}
                {tab === 'expenses' && 'Dépenses & Achats'}
                {tab === 'reports' && 'Rapports Financiers'}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="accounting-active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F4C75B]"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C75B] focus:ring-1 focus:ring-[#F4C75B] bg-white"
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
                        <button onClick={() => { setSelectedInvoice(invoice); setIsInvoiceModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Voir la facture">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => {
                          let printWindow = window.open('', '', 'width=800,height=900');
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Facture ${invoice.id}</title>
                                  <style>
                                    body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
                                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #F4C75B; padding-bottom: 20px; }
                                    .logo-text { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; }
                                    .sub-text { color: #666; font-size: 14px; margin-top: 5px; }
                                    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
                                    .client-info { text-align: right; }
                                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                    th { border-bottom: 2px solid #eee; padding: 10px; text-align: left; }
                                    td { border-bottom: 1px solid #eee; padding: 10px; }
                                    .totals { width: 50%; float: right; }
                                    .totals table { border: none; }
                                    .totals th, .totals td { padding: 5px 10px; }
                                    .grand-total { font-size: 20px; font-weight: bold; background: #f9f9f9; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <div class="logo-text">MOUDA PALACE</div>
                                    <div class="sub-text">Restaurant Traditionnel Marocain</div>
                                    <div class="sub-text">Fès, Maroc</div>
                                  </div>
                                  <div class="invoice-info">
                                    <div>
                                      <h2>FACTURE</h2>
                                      <p><strong>N°:</strong> ${invoice.id}</p>
                                      <p><strong>Date:</strong> ${invoice.date}</p>
                                      <p><strong>Statut:</strong> ${invoice.status}</p>
                                    </div>
                                    <div class="client-info">
                                      <h3>Client</h3>
                                      <p><strong>${invoice.client}</strong></p>
                                      ${invoice.ice ? `<p>ICE: ${invoice.ice}</p>` : ''}
                                    </div>
                                  </div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Description</th>
                                        <th style="text-align: right;">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>Prestation de services de restauration</td>
                                        <td style="text-align: right;">${invoice.amount}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <div class="totals">
                                    <table>
                                      <tr class="grand-total">
                                        <th style="text-align: left;">NET A PAYER</th>
                                        <td style="text-align: right;">${invoice.amount}</td>
                                      </tr>
                                    </table>
                                  </div>
                                  <div style="clear: both; margin-top: 50px; text-align: center; color: #666; font-size: 12px; border-top: 1px dashed #ccc; padding-top: 20px;">
                                    Merci pour votre confiance.<br/>
                                    Mouda Palace - RC: XXXXX - Patente: XXXXX - IF: XXXXX
                                  </div>
                                  <script>
                                    window.onload = () => { window.print(); };
                                  </script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }
                        }} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Télécharger PDF">
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
                  <th className="px-6 py-4 text-center">Actions</th>
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
                    <td className="px-6 py-4 font-medium text-gray-900 text-right">{Number(receipt.amount || 0).toFixed(2)} MAD</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setSelectedReceipt(receipt); setIsReceiptModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Voir le ticket">
                          <Eye size={16} />
                        <button onClick={() => { setEditingReceipt(receipt); setEditReceiptAmount(receipt.amount.toString()); setEditReceiptMethod(receipt.method); setIsEditReceiptModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100" title="Modifier">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteReceipt(receipt.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
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
                  <th className="px-6 py-4 text-center">Actions</th>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setSelectedExpense(expense); setIsExpenseModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Voir le justificatif">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
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
              <button className="bg-[#F4C75B] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium">Générer la déclaration</button>
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
                <button className="bg-[#F4C75B] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"><Plus size={16}/> Saisie manuelle</button>
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
                    <td className="px-6 py-4 text-right text-[#F4C75B]">17,900.00</td>
                    <td className="px-6 py-4 text-right text-[#F4C75B]">17,900.00</td>
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
                      <Bar dataKey="revenus" name="Revenus (CA)" fill="#F4C75B" radius={[4, 4, 0, 0]} barSize={20} />
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
                          <button onClick={() => showToast && showToast('Action en cours de développement...')}  className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Voir le rapport">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDownloadReport(report.type, report.format)} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Télécharger">
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
                <input name="client" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Nom du client" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ICE du Client (15 chiffres)</label>
                <input name="ice" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 001538629000041" maxLength={15} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
                <input name="amount" required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                <input name="date" required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" />
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
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white">
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
                <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white">
                  <option>Mois en cours</option>
                  <option>Mois précédent</option>
                  <option>Trimestre en cours</option>
                  <option>Année en cours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format d'export</label>
                <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white">
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

      
      {/* New Expense Modal */}
      {isNewExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Nouvelle Dépense</h3>
              <button onClick={() => setIsNewExpenseModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newExpense = {
                category: formData.get('category'),
                supplier: formData.get('supplier'),
                amount: Number(formData.get('amount')) + ' MAD',
                date: formData.get('date'),
                method: formData.get('method'),
                createdAt: serverTimestamp()
              };
              
              try {
                const docRef = await addDoc(collection(db, 'expenses'), newExpense);
                // Also set the generated id back so we don't have empty id if we need it
                await updateDoc(docRef, { id: 'EXP-' + docRef.id.substring(0,6).toUpperCase() });
                showToast("Dépense ajoutée avec succès");
                setIsNewExpenseModalOpen(false);
              } catch (err) {
                console.error("Error adding expense", err);
                showToast("Erreur lors de l'ajout");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <input name="category" list="dl-omzfgo-1" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Marchandise" />
                <datalist id="dl-omzfgo-1">
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaire (Fournisseur)</label>
                <input name="supplier" list="dl-acc-sup" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Nom du bénéficiaire" />
                <datalist id="dl-acc-sup">
                  {suppliersList.map((sup, idx) => (
                    <option key={idx} value={sup} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
                <input name="amount" required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input name="date" required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                <select name="method" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white">
                  <option>Espèces</option>
                  <option>Virement</option>
                  <option>Carte Bancaire</option>
                  <option>Chèque</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Ajouter la Dépense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {isReceiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Printer size={18} className="text-[#F4C75B]" />
                Ticket de Caisse
              </h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white font-mono text-sm">
              <div className="text-center mb-6">
                <h2 className="font-bold text-xl mb-1">MOUDA PALACE</h2>
                <p className="text-gray-500 text-xs">Restaurant Traditionnel Marocain</p>
                <p className="text-gray-500 text-xs mt-2">Fès, Maroc</p>
                <p className="text-gray-500 text-xs mt-1">Tel: +212 5 35 XX XX XX</p>
              </div>
              
              <div className="border-t border-b border-dashed border-gray-300 py-3 mb-4 space-y-1">
                <div className="flex justify-between">
                  <span>Ticket N°:</span>
                  <span className="font-medium">{selectedReceipt.displayId || 'TKT-' + selectedReceipt.id.substring(0, 6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{selectedReceipt.createdAt?.toDate ? selectedReceipt.createdAt.toDate().toLocaleString('fr-FR') : selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serveur:</span>
                  <span>{selectedReceipt.server || 'Caisse Principale'}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dashed border-gray-300 text-left">
                      <th className="py-2 font-normal">Qte</th>
                      <th className="py-2 font-normal">Désignation</th>
                      <th className="py-2 font-normal text-right">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipt.items && selectedReceipt.items.length > 0 ? (
                      selectedReceipt.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="py-1 align-top">{item.quantity || item.qty || 1}x</td>
                          <td className="py-1">{item.name}</td>
                          <td className="py-1 text-right align-top">{((Number(item.price) || 0) * (Number(item.quantity || item.qty) || 1)).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500 italic">Détails non disponibles</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="border-t border-dashed border-gray-300 pt-3 space-y-2 mb-6">
                <div className="flex justify-between text-base font-bold">
                  <span>TOTAL NET</span>
                  <span>{Number(selectedReceipt.amount || 0).toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Paiement:</span>
                  <span className="font-medium uppercase">{selectedReceipt.method}</span>
                </div>
              </div>
              
              <div className="text-center text-xs text-gray-500">
                <p>Merci de votre visite !</p>
                <p className="mt-1">À bientôt au Mouda Palace</p>
                
                <div className="mt-4 flex justify-center">
                  <div className="bg-gray-100 p-2 rounded">
                    <QrCode size={48} className="text-gray-800" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => {
                  let printWindow = window.open('', '', 'width=400,height=800');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Ticket ${selectedReceipt.displayId || 'TKT-' + selectedReceipt.id.substring(0, 6).toUpperCase()}</title>
                          <style>
                            body { font-family: monospace; padding: 20px; color: #000; width: 300px; margin: 0 auto; }
                            .header { text-align: center; margin-bottom: 20px; }
                            .logo-text { font-size: 24px; font-weight: bold; }
                            .sub-text { font-size: 12px; margin-top: 5px; }
                            .info { margin-bottom: 15px; font-size: 12px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; }
                            .info div { display: flex; justify-content: space-between; margin-bottom: 3px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; }
                            th { border-bottom: 1px dashed #000; padding: 5px 0; text-align: left; }
                            td { padding: 5px 0; vertical-align: top; }
                            .totals { border-top: 1px dashed #000; padding-top: 10px; margin-bottom: 20px; }
                            .totals div { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; }
                            .totals .method { font-size: 12px; font-weight: normal; margin-top: 5px; }
                            .footer { text-align: center; font-size: 12px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="logo-text">MOUDA PALACE</div>
                            <div class="sub-text">Restaurant Traditionnel Marocain<br/>Fès, Maroc<br/>Tel: +212 5 35 XX XX XX</div>
                          </div>
                          <div class="info">
                            <div><span>Ticket N°:</span><span>${selectedReceipt.displayId || 'TKT-' + selectedReceipt.id.substring(0, 6).toUpperCase()}</span></div>
                            <div><span>Date:</span><span>${selectedReceipt.createdAt?.toDate ? selectedReceipt.createdAt.toDate().toLocaleString('fr-FR') : selectedReceipt.date}</span></div>
                            <div><span>Serveur:</span><span>${selectedReceipt.server || 'Caisse Principale'}</span></div>
                          </div>
                          <table>
                            <thead>
                              <tr>
                                <th>Qte</th>
                                <th>Désignation</th>
                                <th style="text-align: right;">Prix</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${selectedReceipt.items && selectedReceipt.items.length > 0 ? selectedReceipt.items.map((item) => `
                                <tr>
                                  <td>${item.quantity || item.qty || 1}x</td>
                                  <td>${item.name}</td>
                                  <td style="text-align: right;">${((Number(item.price) || 0) * (Number(item.quantity || item.qty) || 1)).toFixed(2)}</td>
                                </tr>
                              `).join('') : `<tr><td colspan="3" style="text-align: center; font-style: italic;">Détails non disponibles</td></tr>`}
                            </tbody>
                          </table>
                          <div class="totals">
                            <div><span>TOTAL NET</span><span>${Number(selectedReceipt.amount).toFixed(2)} MAD</span></div>
                            <div class="method"><span>Paiement:</span><span>${(selectedReceipt.method || '').toUpperCase()}</span></div>
                          </div>
                          <div class="footer">
                            <p>Merci de votre visite !</p>
                            <p>À bientôt au Mouda Palace</p>
                          </div>
                          <script>
                            window.onload = () => { window.print(); };
                          </script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }
                }}
                className="flex-1 bg-[#F4C75B] text-[#1A1A1A] py-2.5 rounded-lg font-medium hover:bg-[#E5B745] transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-semibold text-gray-900">Détails de la Facture</h3>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Numéro</p>
                  <p className="font-mono text-lg">{selectedInvoice.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">Date</p>
                  <p className="text-gray-900">{selectedInvoice.date}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Informations Client</h4>
                <p className="font-medium text-gray-900">{selectedInvoice.client}</p>
                {selectedInvoice.ice && <p className="text-sm text-gray-500 font-mono mt-1">ICE: {selectedInvoice.ice}</p>}
              </div>
              <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Désignation</th>
                      <th className="py-3 px-4 text-right font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-4 text-gray-900">Prestation de services</td>
                      <td className="py-3 px-4 text-right font-medium">{selectedInvoice.amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <span className="font-medium text-gray-700">Total TTC</span>
                <span className="text-xl font-bold text-[#265C6D]">{selectedInvoice.amount}</span>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  let printWindow = window.open('', '', 'width=800,height=900');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Facture ${selectedInvoice.id}</title>
                          <style>
                            body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
                            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #F4C75B; padding-bottom: 20px; }
                            .logo-text { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; }
                            .sub-text { color: #666; font-size: 14px; margin-top: 5px; }
                            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
                            .client-info { text-align: right; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            th { border-bottom: 2px solid #eee; padding: 10px; text-align: left; }
                            td { border-bottom: 1px solid #eee; padding: 10px; }
                            .totals { width: 50%; float: right; }
                            .totals table { border: none; }
                            .totals th, .totals td { padding: 5px 10px; }
                            .grand-total { font-size: 20px; font-weight: bold; background: #f9f9f9; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="logo-text">MOUDA PALACE</div>
                            <div class="sub-text">Restaurant Traditionnel Marocain</div>
                            <div class="sub-text">Fès, Maroc</div>
                          </div>
                          <div class="invoice-info">
                            <div>
                              <h2>FACTURE</h2>
                              <p><strong>N°:</strong> ${selectedInvoice.id}</p>
                              <p><strong>Date:</strong> ${selectedInvoice.date}</p>
                            </div>
                            <div class="client-info">
                              <h3>Client</h3>
                              <p><strong>${selectedInvoice.client}</strong></p>
                              ${selectedInvoice.ice ? `<p>ICE: ${selectedInvoice.ice}</p>` : ''}
                            </div>
                          </div>
                          <table>
                            <thead>
                              <tr>
                                <th>Description</th>
                                <th style="text-align: right;">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Prestation de services de restauration</td>
                                <td style="text-align: right;">${selectedInvoice.amount}</td>
                              </tr>
                            </tbody>
                          </table>
                          <div class="totals">
                            <table>
                              <tr class="grand-total">
                                <th style="text-align: left;">NET A PAYER</th>
                                <td style="text-align: right;">${selectedInvoice.amount}</td>
                              </tr>
                            </table>
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.onload = () => { printWindow.print(); };
                  }
                }}
                className="flex-1 bg-[#F4C75B] text-[#1A1A1A] py-2 rounded-lg font-medium hover:bg-[#E5B745] transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-[#F4C75B]" />
                Détails de la Dépense
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center mb-6">
                <p className="text-sm font-medium mb-1">Montant Décaissé</p>
                <p className="text-3xl font-bold">{selectedExpense.amount} MAD</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Bénéficiaire</span>
                  <span className="font-medium text-gray-900">{selectedExpense.supplier}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Catégorie</span>
                  <span className="font-medium text-gray-900">{selectedExpense.category}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Date</span>
                  <span className="font-medium text-gray-900">{selectedExpense.date}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Méthode de paiement</span>
                  <span className="font-medium text-gray-900">{selectedExpense.method}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Référence interne</span>
                  <span className="font-mono text-gray-900 text-sm">{selectedExpense.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {isViewReportModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden relative shadow-2xl flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-[#F4C75B]" />
                {selectedReport.type} - {selectedReport.date}
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownloadReport(selectedReport.type, selectedReport.format)}
                  className="px-4 py-2 bg-[#F4C75B] text-[#1A1A1A] text-sm font-medium rounded-lg hover:bg-[#E5B745] transition-colors flex items-center gap-2"
                >
                  <Download size={16} /> Exporter
                </button>
                <button onClick={() => setIsViewReportModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100 ml-2">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto bg-gray-50 flex-1">
              {selectedReport.type === 'Bilan Comptable' ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-3xl mx-auto">
                  <div className="text-center mb-8 pb-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">Bilan Comptable</h2>
                    <p className="text-gray-500 mt-2 font-medium">MOUDA PALACE - FÈS</p>
                    <p className="text-gray-500 mt-1">Arrêté au {selectedReport.date}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* ACTIF */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4">ACTIF (Emplois)</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-[#265C6D] mb-2">ACTIF IMMOBILISÉ</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Immobilisations Incorporelles</span><span>45 000.00</span></div>
                            <div className="flex justify-between"><span>Immobilisations Corporelles</span><span>850 000.00</span></div>
                            <div className="flex justify-between text-gray-500 italic pl-4"><span>- Aménagements divers</span><span>350 000.00</span></div>
                            <div className="flex justify-between text-gray-500 italic pl-4"><span>- Matériel de cuisine</span><span>500 000.00</span></div>
                            <div className="flex justify-between font-medium border-t border-gray-100 pt-1 mt-1">
                              <span>Total Actif Immobilisé</span><span>895 000.00</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-[#265C6D] mb-2">ACTIF CIRCULANT (Hors Trésorerie)</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Stocks (Marchandises)</span><span>120 500.00</span></div>
                            <div className="flex justify-between"><span>Créances Clients</span><span>45 200.00</span></div>
                            <div className="flex justify-between font-medium border-t border-gray-100 pt-1 mt-1">
                              <span>Total Actif Circulant</span><span>165 700.00</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-[#265C6D] mb-2">TRÉSORERIE - ACTIF</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Banques, TG, CCP</span><span>320 400.00</span></div>
                            <div className="flex justify-between"><span>Caisse</span><span>15 800.00</span></div>
                            <div className="flex justify-between font-medium border-t border-gray-100 pt-1 mt-1">
                              <span>Total Trésorerie</span><span>336 200.00</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* PASSIF */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4">PASSIF (Ressources)</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-[#265C6D] mb-2">FINANCEMENT PERMANENT</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Capital Social</span><span>500 000.00</span></div>
                            <div className="flex justify-between"><span>Réserves</span><span>150 000.00</span></div>
                            <div className="flex justify-between"><span>Résultat net de l'exercice</span><span>245 400.00</span></div>
                            <div className="flex justify-between"><span>Dettes de financement (Prêt)</span><span>350 000.00</span></div>
                            <div className="flex justify-between font-medium border-t border-gray-100 pt-1 mt-1">
                              <span>Total Financement Permanent</span><span>1 245 400.00</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-[#265C6D] mb-2">PASSIF CIRCULANT (Hors Trésorerie)</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Dettes Fournisseurs</span><span>85 600.00</span></div>
                            <div className="flex justify-between"><span>Organismes Sociaux (CNSS)</span><span>22 400.00</span></div>
                            <div className="flex justify-between"><span>État (TVA, IS)</span><span>43 500.00</span></div>
                            <div className="flex justify-between font-medium border-t border-gray-100 pt-1 mt-1">
                              <span>Total Passif Circulant</span><span>151 500.00</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-[#265C6D] mb-2">TRÉSORERIE - PASSIF</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Découvert bancaire</span><span>0.00</span></div>
                            <div className="flex justify-between font-medium border-t border-gray-100 pt-1 mt-1">
                              <span>Total Trésorerie Passif</span><span>0.00</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-6 border-t-2 border-gray-900 grid grid-cols-1 md:grid-cols-2 gap-12 text-lg font-bold">
                    <div className="flex justify-between text-[#265C6D]">
                      <span>TOTAL GÉNÉRAL ACTIF</span>
                      <span>1 396 900.00</span>
                    </div>
                    <div className="flex justify-between text-[#265C6D]">
                      <span>TOTAL GÉNÉRAL PASSIF</span>
                      <span>1 396 900.00</span>
                    </div>
                  </div>
                  
                  <div className="mt-16 text-xs text-gray-400 text-center uppercase tracking-wider">
                    - Document à titre indicatif généré électroniquement -
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <FileText size={48} className="mb-4 text-gray-300" />
                  <p>Aperçu du format "{selectedReport.type}" en cours de développement.</p>
                  <p className="text-sm mt-2">Veuillez utiliser le bouton Exporter pour télécharger les données.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Edit Receipt Modal */}
      {isEditReceiptModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-serif text-[#1A1A1A]">Modifier l'encaissement</h2>
              <button 
                onClick={() => setIsEditReceiptModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateReceipt} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editReceiptAmount}
                  onChange={(e) => setEditReceiptAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] bg-white"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                <select 
                  value={editReceiptMethod}
                  onChange={(e) => setEditReceiptMethod(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#F4C75B] bg-white"
                  required
                >
                  <option value="Espèces">Espèces</option>
                  <option value="Carte Bancaire">Carte Bancaire</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Virement">Virement</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditReceiptModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#F4C75B] text-[#1A1A1A] rounded-xl font-bold hover:bg-[#cda25b] transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
