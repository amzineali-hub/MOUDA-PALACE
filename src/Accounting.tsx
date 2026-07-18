import { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

  const invoices = [
    { id: 'FAC-2026-001', client: 'Riad Al Andalous', ice: '001538629000041', date: '12 Nov 2026', amount: '1 250 MAD', status: 'Payée' },
    { id: 'FAC-2026-002', client: 'Atlas Voyages', ice: '002148574000034', date: '14 Nov 2026', amount: '4 500 MAD', status: 'En attente' },
    { id: 'FAC-2026-003', client: 'LocaCar Marrakech', ice: '001937482000021', date: '15 Nov 2026', amount: '850 MAD', status: 'Payée' },
    { id: 'FAC-2026-004', client: 'Hôtel La Medina', ice: '002594837000067', date: '18 Nov 2026', amount: '3 200 MAD', status: 'Retard' }
  ];

  const expenses = [
    { id: 'EXP-001', category: 'Marchandise', supplier: 'Marché Central', date: '19 Nov 2026', amount: '2 300 MAD', method: 'Espèces' },
    { id: 'EXP-002', category: 'Électricité', supplier: 'ONEE', date: '18 Nov 2026', amount: '1 850 MAD', method: 'Virement' },
    { id: 'EXP-003', category: 'Marketing', supplier: 'Facebook Ads', date: '15 Nov 2026', amount: '500 MAD', method: 'Carte Bancaire' },
  ];

  const financialReports = [
    { id: 'RPT-2026-11', type: 'Bilan Comptable', date: '30 Nov 2026', status: 'Généré', format: 'PDF' },
    { id: 'RPT-2026-T3', type: 'Déclaration TVA (Maroc)', date: '15 Oct 2026', status: 'Soumis', format: 'PDF / XML' },
    { id: 'RPT-2026-10', type: 'CPC (Compte de Produits et Charges)', date: '31 Oct 2026', status: 'Généré', format: 'Excel' },
    { id: 'RPT-2026-09', type: 'Bilan Comptable', date: '30 Sep 2026', status: 'Généré', format: 'PDF' },
  ];

  const monthlyRevenueData = [
    { name: 'Juin', revenus: 85000, depenses: 32000 },
    { name: 'Juil', revenus: 110000, depenses: 45000 },
    { name: 'Août', revenus: 135000, depenses: 51000 },
    { name: 'Sept', revenus: 95000, depenses: 38000 },
    { name: 'Oct', revenus: 105000, depenses: 40000 },
    { name: 'Nov', revenus: 124500, depenses: 42800 },
  ];

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
            onClick={() => window.print()}
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
            {['invoices', 'expenses', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#DDA956]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {tab === 'invoices' && 'Factures Clients'}
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
              placeholder={activeTab === 'invoices' ? "Rechercher une facture..." : "Rechercher une dépense..."}
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

        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-gray-900 font-medium mb-6">Évolution des Revenus & Dépenses</h3>
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
                      <Bar dataKey="revenus" name="Revenus" fill="#DDA956" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="depenses" name="Dépenses" fill="#1A1A1A" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center text-center">
                <div className="mx-auto w-16 h-16 bg-[#DDA956]/10 rounded-full flex items-center justify-center mb-4 text-[#DDA956]">
                  <FileText size={32} />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Générer un Rapport</h3>
                <p className="text-gray-500 mb-6 text-sm max-w-sm mx-auto">
                  Sélectionnez le type de rapport (Bilan, Compte de résultat, TVA) et la période pour générer le document.
                </p>
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#333] transition-colors mx-auto inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Nouveau Rapport
                </button>
              </div>
            </div>

            <h3 className="text-gray-900 font-medium mb-4 px-2">Rapports Récents</h3>
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client / Partenaire</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Nom du client" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ICE du Client (15 chiffres)</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 001538629000041" maxLength={15} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                onClick={() => {
                  showToast("Facture créée avec succès");
                  setIsNewModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Créer la facture
              </button>
            </div>
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
                onClick={() => {
                  handleDownloadReport(reportType, reportFormat);
                  setIsReportModalOpen(false);
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
