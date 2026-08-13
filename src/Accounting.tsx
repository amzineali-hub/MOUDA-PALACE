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
import Combobox from './components/Combobox';
import { logActivity } from './lib/activityLog';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useEffect, useMemo } from 'react';
import { TVA_RATES, computeTTC } from './lib/tva';


const parseAmount = (val: any) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[^0-9.-]+/g, '')) || 0;
};

export default function Accounting() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [invoiceHT, setInvoiceHT] = useState('');
  const [invoiceTva, setInvoiceTva] = useState<number>(20);
  const [expenseHT, setExpenseHT] = useState('');
  const [expenseTva, setExpenseTva] = useState<number>(20);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isNewReceiptModalOpen, setIsNewReceiptModalOpen] = useState(false);
  const [isEditReceiptModalOpen, setIsEditReceiptModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<any>(null);
  const [editReceiptAmount, setEditReceiptAmount] = useState("");
  const [editReceiptMethod, setEditReceiptMethod] = useState("");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isEditInvoiceModalOpen, setIsEditInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
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
    if (type === 'Bilan Comptable' || type === 'Livre Journal') {
      showToast(`${type} : fonctionnalité pas encore disponible (nécessite un plan comptable complet), aucun fichier généré.`, "error");
      return;
    }

    let finalFormat = format;
    if (format.includes('PDF') || format.includes('XML')) {
      showToast(`Format ${format} simulé, téléchargement au format CSV.`);
      finalFormat = 'CSV';
    }
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += `Rapport:;${type}\n`;
    csvContent += `Mois;Revenus;Depenses\n`;
    monthlyRevenueData.forEach((data: any) => {
      csvContent += `${data.name};${data.revenus};${data.depenses}\n`;
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
  
  const handleDeleteExpense = async (expense: any) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette dépense ?")) {
      try {
        if (expense.isOrder) {
           await deleteDoc(doc(db, "commandes", expense.id));
        } else {
           await deleteDoc(doc(db, "expenses", expense.id));
        }
        logActivity({ action: 'delete', entity: 'expense', entityId: expense.id, summary: `Suppression dépense ${expense.category || ''} - ${expense.amount || ''}`.trim(), before: expense });
        showToast("Dépense supprimée avec succès");
      } catch (error) {
        console.error(error);
        showToast("Erreur lors de la suppression", "error");
      }
    }
  };

  const handleDeleteInvoice = async (invoice: any) => {
    if (window.confirm(`Voulez-vous vraiment supprimer la facture ${invoice.id} ?`)) {
      try {
        await deleteDoc(doc(db, "invoices", invoice.id));
        logActivity({ action: 'delete', entity: 'invoice', entityId: invoice.id, summary: `Suppression facture ${invoice.id} - ${invoice.client || ''} - ${invoice.amount || ''}`, before: invoice });
        showToast("Facture supprimée avec succès");
      } catch (error) {
        console.error(error);
        showToast("Erreur lors de la suppression", "error");
      }
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet encaissement ?")) {
      try {
        const receipt = receipts.find((r: any) => r.id === id);
        await deleteDoc(doc(db, "cash_receipts", id));
        logActivity({ action: 'delete', entity: 'cash_receipt', entityId: id, summary: `Suppression encaissement ${receipt?.amount || ''}`.trim(), before: receipt });
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
      logActivity({ action: 'update', entity: 'cash_receipt', entityId: editingReceipt.id, summary: `Modification encaissement (${editingReceipt.amount} → ${editReceiptAmount})`, before: editingReceipt });
      showToast("Encaissement mis à jour");
      setIsEditReceiptModalOpen(false);
      setEditingReceipt(null);
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la mise à jour", "error");
    }
  };


  const [invoices, setInvoices] = useState<any[]>([]);
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      if (!snapshot.empty) {
        setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      }
    }, (error) => {
      console.error("Error fetching invoices", error);
    });
    return () => unsub();
  }, []);

  const [manualExpenses, setManualExpenses] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);

  const expenses = useMemo(() => {
    const isDelivered = (c: any) => {
      const st = c.status || c.statut;
      return st === 'Livrée' || st === 'Validée';
    };
    const all = [
      ...manualExpenses,
      ...commandes.filter(isDelivered).map(c => ({
        id: c.id,
        category: c.categorie || c.category || 'Achat Marchandises',
        supplier: c.fournisseur,
        amount: c.montant ?? c.totalActual ?? c.totalAmount ?? 0,
        date: c.date || new Date(c.createdAt?.toMillis?.() || Date.now()).toLocaleDateString('fr-FR'),
        method: c.method || 'Virement',
        createdAt: c.createdAt,
        description: c.articles,
        isOrder: true
      }))
    ];
    return all.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  }, [manualExpenses, commandes]);

  const [financialReports, setFinancialReports] = useState<any[]>([]);

  const [receipts, setReceipts] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    const unsubReceipts = onSnapshot(collection(db, 'cash_receipts'), (snapshot) => {
      if (!snapshot.empty) {
        setReceipts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      }
    }, (error) => {
      console.error("Error fetching receipts", error);
    });
    return () => unsubReceipts();
  }, []);

  useEffect(() => {
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      setManualExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    });
    const unsubCommandes = onSnapshot(collection(db, 'commandes'), (snapshot) => {
      setCommandes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    });
    const unsubReports = onSnapshot(collection(db, 'financialReports'), (snapshot) => {
      if (!snapshot.empty) {
        setFinancialReports(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      }
    });
    return () => {
      unsubExpenses();
      unsubCommandes();
      unsubReports();
    };
  }, []);


  const monthlyRevenueData = useMemo(() => {
    const data: Record<string, { name: string, revenus: number, depenses: number, sortKey: number }> = {};
    const months = ['Janv', 'Fév', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mName = months[past.getMonth()];
      data[`${past.getFullYear()}-${past.getMonth()}`] = { name: mName, revenus: 0, depenses: 0, sortKey: past.getTime() };
    }

    receipts.forEach((r: any) => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.date || Date.now());
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (data[key]) {
        data[key].revenus += parseAmount(r.amount) || 0;
      }
    });

    expenses.forEach((e: any) => {
      const date = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.date || Date.now());
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (data[key]) {
        data[key].depenses += parseAmount(e.amount) || 0;
      }
    });

    return Object.values(data).sort((a,b) => a.sortKey - b.sortKey);
  }, [receipts, expenses]);

  const expensesByCategoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const cat = e.category || 'Divers';
      categories[cat] = (categories[cat] || 0) + (parseAmount(e.amount) || 0);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [expenses]);
  
  const COLORS = ['#F4C75B', '#1A1A1A', '#4b5563', '#9ca3af', '#e5e7eb', '#8b5cf6', '#ef4444', '#10b981'];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthRevenue = receipts.reduce((sum, r) => {
    const d = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.date || Date.now());
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) return sum + (parseAmount(r.amount) || 0);
    return sum;
  }, 0);
  const lastMonthRevenue = receipts.reduce((sum, r) => {
    const d = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.date || Date.now());
    if (d.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1) && d.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear)) return sum + (parseAmount(r.amount) || 0);
    return sum;
  }, 0);
  const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 100;

  const currentMonthExpenses = expenses.reduce((sum, e) => {
    const d = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.date || Date.now());
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) return sum + (parseAmount(e.amount) || 0);
    return sum;
  }, 0);
  const lastMonthExpenses = expenses.reduce((sum, e) => {
    const d = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.date || Date.now());
    if (d.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1) && d.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear)) return sum + (parseAmount(e.amount) || 0);
    return sum;
  }, 0);
  const expensesGrowth = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 100;


  const currentMonthProfit = currentMonthRevenue - currentMonthExpenses;
  const lastMonthProfit = lastMonthRevenue - lastMonthExpenses;
  const profitGrowth = lastMonthProfit !== 0 ? ((currentMonthProfit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100 : (currentMonthProfit > 0 ? 100 : 0);

  const tvaMonthlyData = useMemo(() => {
    const monthsFr = ['Janv', 'Fév', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const data: Record<string, { name: string, caHT: number, tva20: number, tva10: number, tvaDeductible: number, isCurrent: boolean, sortKey: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data[`${past.getFullYear()}-${past.getMonth()}`] = {
        name: `${monthsFr[past.getMonth()]} ${past.getFullYear()}`,
        caHT: 0, tva20: 0, tva10: 0, tvaDeductible: 0,
        isCurrent: i === 0,
        sortKey: past.getTime()
      };
    }
    invoices.forEach((inv: any) => {
      if (inv.tva === undefined || inv.montantHT === undefined) return;
      const d = inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.date || Date.now());
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!data[key]) return;
      const ht = parseAmount(inv.montantHT);
      data[key].caHT += ht;
      if (Number(inv.tva) === 20) data[key].tva20 += ht * 0.2;
      else if (Number(inv.tva) === 10) data[key].tva10 += ht * 0.1;
    });
    expenses.forEach((exp: any) => {
      if (exp.tva === undefined || exp.montantHT === undefined) return;
      const d = exp.createdAt?.toDate ? exp.createdAt.toDate() : new Date(exp.date || Date.now());
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!data[key]) return;
      data[key].tvaDeductible += parseAmount(exp.montantHT) * Number(exp.tva) / 100;
    });
    return Object.values(data).sort((a, b) => a.sortKey - b.sortKey);
  }, [invoices, expenses]);

  const currentTvaPeriod = tvaMonthlyData[tvaMonthlyData.length - 1];
  const tvaCollectee = currentTvaPeriod.tva20 + currentTvaPeriod.tva10;
  const tvaDeductibleTotal = currentTvaPeriod.tvaDeductible;
  const tvaADecaisser = tvaCollectee - tvaDeductibleTotal;

  const pendingInvoicesTotal = invoices.filter(i => i.status === 'En attente' || i.status === 'Retard').reduce((sum, i) => sum + (parseAmount(i.amount) || 0), 0);
  const pendingInvoicesCount = invoices.filter(i => i.status === 'En attente' || i.status === 'Retard').length;


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payée': return 'bg-green-50 text-green-700 border-green-200';
      case 'En attente': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Retard': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };


  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => (e.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.category || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.id || '').toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(e => filterCategory ? e.category === filterCategory : true)
      .filter(e => filterSupplier ? e.supplier === filterSupplier : true)
      .filter(e => filterDate ? e.date === filterDate : true);
  }, [expenses, searchQuery, filterCategory, filterSupplier, filterDate]);


  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => (inv.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (inv.client || '').toLowerCase().includes(searchQuery.toLowerCase()) || (inv.ice || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [invoices, searchQuery]);


  const filteredReceipts = useMemo(() => {
    return receipts.filter(rec => (rec.displayId || '').toLowerCase().includes(searchQuery.toLowerCase()) || (rec.id || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [receipts, searchQuery]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Chiffre d'Affaires (Mois)</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-serif text-gray-900 mb-1">{currentMonthRevenue.toLocaleString('fr-FR')} MAD</p>
          <p className={`text-sm flex items-center gap-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% vs mois dernier
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Dépenses (Mois)</h3>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-3xl font-serif text-gray-900 mb-1">{currentMonthExpenses.toLocaleString('fr-FR')} MAD</p>
          <p className={`text-sm flex items-center gap-1 ${expensesGrowth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {expensesGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {expensesGrowth > 0 ? '+' : ''}{expensesGrowth.toFixed(1)}% vs mois dernier
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Bénéfice (Mois)</h3>
            <div className={`p-2 rounded-lg ${currentMonthProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {currentMonthProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
          </div>
          <p className="text-3xl font-serif text-gray-900 mb-1">{currentMonthProfit.toLocaleString('fr-FR')} MAD</p>
          <p className={`text-sm flex items-center gap-1 ${profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profitGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {profitGrowth > 0 ? '+' : ''}{profitGrowth.toFixed(1)}% vs mois dernier
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Factures en attente</h3>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-3xl font-serif text-gray-900 mb-1">{pendingInvoicesTotal.toLocaleString('fr-FR')} MAD</p>
          <p className="text-sm text-gray-500">{pendingInvoicesCount} facture(s) impayée(s)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] p-2">
          <nav className="flex overflow-x-auto hide-scrollbar gap-2">
            {['invoices', 'receipts', 'expenses', 'tva', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#F4C75B]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {tab === 'invoices' && 'Factures Clients'}
                {tab === 'receipts' && 'Recettes Caisses'}
                {tab === 'expenses' && 'Dépenses & Achats'}
                {tab === 'tva' && 'Déclaration TVA'}
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
            <button onClick={() => setIsFilterModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors" title="Filtrer">
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
                {filteredInvoices.map((invoice, idx) => (
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
                        <button onClick={() => { setEditingInvoice(invoice); setIsEditInvoiceModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100" title="Éditer">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteInvoice(invoice)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Aucune facture trouvée.
                    </td>
                  </tr>
                )}
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
                {receipts.filter(r => (r.displayId || '').toLowerCase().includes(searchQuery.toLowerCase()) || (r.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (r.method || '').toLowerCase().includes(searchQuery.toLowerCase())).map((receipt, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900">{receipt.displayId || 'TKT-' + receipt.id.substring(0, 6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {receipt.createdAt?.toDate ? receipt.createdAt.toDate().toLocaleString('fr-FR') : receipt.date}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{receipt.method}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 text-right">{parseAmount(receipt.amount).toFixed(2)} MAD</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setSelectedReceipt(receipt); setIsReceiptModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Voir le ticket">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setEditingReceipt(receipt); setEditReceiptAmount(receipt.amount.toString()); setEditReceiptMethod(receipt.method); setIsEditReceiptModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100" title="Modifier">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteReceipt(receipt.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReceipts.length === 0 && (
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
                  <th className="px-6 py-4 text-right">Montant HT</th>
                  <th className="px-6 py-4 text-right">TVA</th>
                  <th className="px-6 py-4 text-right">Montant TTC</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((expense, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900">{expense.id}</td>
                    <td className="px-6 py-4 text-gray-900">{expense.category}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{expense.supplier}</td>
                    <td className="px-6 py-4 text-gray-500">{expense.date}</td>
                    <td className="px-6 py-4 text-gray-500">{expense.method}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{expense.montantHT !== undefined ? `${Number(expense.montantHT).toFixed(2)} MAD` : '—'}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{expense.tva !== undefined ? `${expense.tva}%` : '—'}</td>
                    <td className="px-6 py-4 font-medium text-red-600 text-right">-{expense.amount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setSelectedExpense(expense); setIsExpenseModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Voir le justificatif">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => {
                          let printWindow = window.open('', '', 'width=800,height=900');
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Dépense ${expense.id}</title>
                                  <style>
                                    body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
                                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #F4C75B; padding-bottom: 20px; }
                                    .logo-text { font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; }
                                    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
                                    table { w-full text-left border-collapse: collapse; width: 100%; margin-bottom: 40px; }
                                    th, td { padding: 15px; border-bottom: 1px solid #eee; }
                                    th { background-color: #f9fafb; font-weight: bold; }
                                    .total-row { font-weight: bold; font-size: 20px; background-color: #f9fafb; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <div class="logo-text">MOUDA PALACE</div>
                                    <div>FÈS</div>
                                  </div>
                                  <h2 style="text-align: center; margin-bottom: 30px;">DÉPENSE / ACHAT</h2>
                                  <div class="invoice-info">
                                    <div>
                                      <strong>N° Dépense:</strong> ${expense.id}<br>
                                      <strong>Date:</strong> ${expense.date}
                                    </div>
                                    <div style="text-align: right;">
                                      <strong>Bénéficiaire:</strong> ${expense.supplier || '-'}<br>
                                      <strong>Catégorie:</strong> ${expense.category}
                                    </div>
                                  </div>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Description</th>
                                        ${expense.montantHT !== undefined ? '<th style="text-align: right;">Montant HT</th><th style="text-align: right;">TVA</th>' : ''}
                                        <th style="text-align: right;">${expense.montantHT !== undefined ? 'Montant TTC' : 'Montant'}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td>${expense.description || expense.category}</td>
                                        ${expense.montantHT !== undefined ? `<td style="text-align: right;">${Number(expense.montantHT).toFixed(2)} MAD</td><td style="text-align: right;">${expense.tva}%</td>` : ''}
                                        <td style="text-align: right;">${parseAmount(expense.amount).toFixed(2)} MAD</td>
                                      </tr>
                                      <tr class="total-row">
                                        <td>Total${expense.montantHT !== undefined ? ' TTC' : ''}</td>
                                        ${expense.montantHT !== undefined ? '<td></td><td></td>' : ''}
                                        <td style="text-align: right;">${parseAmount(expense.amount).toFixed(2)} MAD</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <div style="text-align: center; color: #666; margin-top: 50px; font-size: 14px;">
                                    Méthode de paiement: ${expense.method}<br>
                                    Document généré le ${new Date().toLocaleDateString('fr-FR')}
                                  </div>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                            printWindow.focus();
                            setTimeout(() => {
                              printWindow.print();
                              printWindow.close();
                            }, 250);
                          }
                        }} className="p-1.5 text-gray-400 hover:text-green-500 transition-colors rounded-lg hover:bg-gray-100" title="Imprimer">
                          <Printer size={16} />
                        </button>
                        <button onClick={() => handleDeleteExpense(expense)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      Aucune dépense trouvée. Les achats apparaîtront ici.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        
        {/* Déclaration TVA */}
        {activeTab === 'tva' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Déclaration TVA ({currentTvaPeriod.name})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-2">TVA Collectée (Ventes)</p>
                <p className="text-2xl font-bold text-gray-900">{tvaCollectee.toFixed(2)} MAD</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-2">TVA Déductible (Achats)</p>
                <p className="text-2xl font-bold text-gray-900">{tvaDeductibleTotal.toFixed(2)} MAD</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <p className="text-sm text-indigo-700 font-medium mb-2">TVA à décaisser (Due)</p>
                <p className="text-2xl font-bold text-indigo-900">{tvaADecaisser.toFixed(2)} MAD</p>
                <p className="text-xs text-indigo-600 mt-2">À payer avant le 20 du mois</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">Calculé à partir des factures et dépenses avec montant HT et TVA renseignés. Les enregistrements sans TVA précisée ne sont pas comptabilisés ici.</p>

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
                  {tvaMonthlyData.map((period, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{period.name}</td>
                      <td className="px-6 py-4 text-right">{period.caHT.toFixed(2)} MAD</td>
                      <td className="px-6 py-4 text-right">{period.tva20.toFixed(2)} MAD</td>
                      <td className="px-6 py-4 text-right">{period.tva10.toFixed(2)} MAD</td>
                      <td className="px-6 py-4 text-right">{period.tvaDeductible.toFixed(2)} MAD</td>
                      <td className="px-6 py-4 text-right font-medium text-indigo-700">{(period.tva20 + period.tva10 - period.tvaDeductible).toFixed(2)} MAD</td>
                      <td className="px-6 py-4 text-center">
                        {period.isCurrent ? (
                          <span className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">Période en cours</span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Clôturée</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
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
                  {financialReports.filter(rpt => (rpt.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || (rpt.type || '').toLowerCase().includes(searchQuery.toLowerCase())).map((report, idx) => (
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
                          <button onClick={() => { setSelectedReport(report); setIsViewReportModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Voir le rapport">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDownloadReport(report.type, report.format)} className="p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100" title="Télécharger">
                            <Download size={16} />
                          </button>
                          <button onClick={async () => {
                            if (window.confirm("Voulez-vous vraiment supprimer ce rapport ?")) {
                              if (report.id.startsWith("RPT-20")) {
                                setFinancialReports(prev => prev.filter(r => r.id !== report.id));
                                showToast("Rapport supprimé avec succès");
                              } else {
                                try {
                                  await deleteDoc(doc(db, 'financialReports', report.id));
                                  showToast("Rapport supprimé avec succès");
                                } catch(e) {
                                  showToast("Erreur lors de la suppression", "error");
                                }
                              }
                            }
                          }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100" title="Supprimer">
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
              const montantHT = Number(formData.get('montantHT'));
              const tva = Number(formData.get('tva'));
              const montantTTC = computeTTC(montantHT, tva);
              const newInvoice = {
                client: formData.get('client'),
                ice: formData.get('ice'),
                montantHT,
                tva,
                amount: montantTTC.toFixed(2) + ' MAD',
                date: formData.get('date'),
                status: 'En attente',
                createdAt: serverTimestamp()
              };

              // Optimistic update
              setInvoices([{ id: 'FAC-NOUVEAU', ...newInvoice }, ...invoices]);
              setIsNewModalOpen(false);
              setInvoiceHT('');
              setInvoiceTva(20);
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant HT (MAD)</label>
                  <input name="montantHT" required type="number" step="0.01" min="0" value={invoiceHT} onChange={(e) => setInvoiceHT(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TVA</label>
                  <select name="tva" value={invoiceTva} onChange={(e) => setInvoiceTva(Number(e.target.value))} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    {TVA_RATES.map(rate => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-right">Total TTC : <span className="font-semibold text-gray-900">{computeTTC(Number(invoiceHT) || 0, invoiceTva).toFixed(2)} MAD</span></p>
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

      {/* Edit Invoice Modal */}
      {isEditInvoiceModalOpen && editingInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Éditer la Facture {editingInvoice.id}</h3>
              <button onClick={() => { setIsEditInvoiceModalOpen(false); setEditingInvoice(null); }} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const montant = Number(formData.get('montant'));
              const updatedInvoice = {
                client: formData.get('client'),
                ice: formData.get('ice'),
                date: formData.get('date'),
                status: formData.get('status'),
                amount: montant.toFixed(2) + ' MAD'
              };
              try {
                await updateDoc(doc(db, 'invoices', editingInvoice.id), updatedInvoice);
                logActivity({ action: 'update', entity: 'invoice', entityId: editingInvoice.id, summary: `Modification facture ${editingInvoice.id}`, before: editingInvoice });
                showToast("Facture mise à jour avec succès");
                setIsEditInvoiceModalOpen(false);
                setEditingInvoice(null);
              } catch (err) {
                console.error("Error updating invoice", err);
                showToast("Erreur lors de la mise à jour", "error");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client / Partenaire</label>
                <input name="client" required type="text" defaultValue={editingInvoice.client} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Nom du client" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ICE du Client (15 chiffres)</label>
                <input name="ice" type="text" defaultValue={editingInvoice.ice} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 001538629000041" maxLength={15} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant TTC (MAD)</label>
                  <input name="montant" required type="number" step="0.01" min="0" defaultValue={parseAmount(editingInvoice.amount)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select name="status" required defaultValue={editingInvoice.status} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    <option value="En attente">En attente</option>
                    <option value="Payée">Payée</option>
                    <option value="Retard">Retard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input name="date" required type="text" defaultValue={editingInvoice.date} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 12 nov. 2026" />
              </div>
              <button
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Enregistrer les modifications
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
              const montantHT = Number(formData.get('montantHT'));
              const tva = Number(formData.get('tva'));
              const montantTTC = computeTTC(montantHT, tva);
              const newExpense = {
                category: formData.get('category'),
                supplier: formData.get('supplier'),
                montantHT,
                tva,
                amount: montantTTC.toFixed(2) + ' MAD',
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
                setExpenseHT('');
                setExpenseTva(20);
              } catch (err) {
                console.error("Error adding expense", err);
                showToast("Erreur lors de l'ajout");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <Combobox name="category" options={categories} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: Marchandise" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaire (Fournisseur)</label>
                <Combobox name="supplier" options={suppliersList} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Nom du bénéficiaire" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant HT (MAD)</label>
                  <input name="montantHT" required type="number" step="0.01" min="0" value={expenseHT} onChange={(e) => setExpenseHT(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Ex: 500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TVA</label>
                  <select name="tva" value={expenseTva} onChange={(e) => setExpenseTva(Number(e.target.value))} required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]">
                    {TVA_RATES.map(rate => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-right">Total TTC : <span className="font-semibold text-gray-900">{computeTTC(Number(expenseHT) || 0, expenseTva).toFixed(2)} MAD</span></p>
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


      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-semibold">Filtres de recherche</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white">
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white" title="Filtre par date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] bg-white">
                  <option value="">Tous les fournisseurs</option>
                  {suppliersList.map((sup, idx) => (
                    <option key={idx} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => { setFilterCategory(''); setFilterSupplier(''); setFilterDate(''); setSearchQuery(''); setIsFilterModalOpen(false); }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium mt-4 hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </div>
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
                <p className="text-sm font-medium mb-1">{selectedExpense.montantHT !== undefined ? 'Montant TTC Décaissé' : 'Montant Décaissé'}</p>
                <p className="text-3xl font-bold">{parseAmount(selectedExpense.amount).toFixed(2)} MAD</p>
              </div>
              
              <div className="space-y-4">
                {selectedExpense.montantHT !== undefined && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Montant HT</span>
                      <span className="font-medium text-gray-900">{Number(selectedExpense.montantHT).toFixed(2)} MAD</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">TVA</span>
                      <span className="font-medium text-gray-900">{selectedExpense.tva}% ({(Number(selectedExpense.montantHT) * (selectedExpense.tva || 0) / 100).toFixed(2)} MAD)</span>
                    </div>
                  </>
                )}
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
