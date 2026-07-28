const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// 1. Add missing imports
code = code.replace("import { Plus, Search, ShoppingCart, Truck, FileText, CheckCircle, Clock, AlertTriangle, ChevronRight, Store, X } from 'lucide-react';", 
                    "import { Plus, Search, ShoppingCart, Truck, FileText, CheckCircle, Clock, AlertTriangle, ChevronRight, Store, X, Sparkles, Brain, TrendingUp, Loader2, Calendar } from 'lucide-react';");

// 2. Change activeTab state
code = code.replace("const [activeTab, setActiveTab] = useState<'commandes' | 'fournisseurs'>('commandes');",
                    "const [activeTab, setActiveTab] = useState<'commandes' | 'fournisseurs' | 'previsions'>('commandes');\n  const [isGeneratingPrevisions, setIsGeneratingPrevisions] = useState(false);\n  const [previsions, setPrevisions] = useState<any>(null);");

// 3. Add Previsions Tab Button
const tabButtonSearch = `            <button 
              onClick={() => setActiveTab('fournisseurs')}
              className={\`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all \${activeTab === 'fournisseurs' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}\`}
            >
              Annuaire Fournisseurs
            </button>`;
const tabButtonReplace = `            <button 
              onClick={() => setActiveTab('fournisseurs')}
              className={\`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all \${activeTab === 'fournisseurs' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}\`}
            >
              Annuaire Fournisseurs
            </button>
            <button 
              onClick={() => setActiveTab('previsions')}
              className={\`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 \${activeTab === 'previsions' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}\`}
            >
              <Sparkles size={16} className={activeTab === 'previsions' ? 'text-[#DDA956]' : 'text-gray-400'} />
              Prévisions
            </button>`;

code = code.replace(tabButtonSearch, tabButtonReplace);

// 4. Implement Previsions Logic & UI inside the render
const handleGeneratePrevisions = `
  const handleGeneratePrevisions = () => {
    setIsGeneratingPrevisions(true);
    setTimeout(() => {
      setPrevisions([
        {
          category: 'Produits Frais',
          items: [
            { name: 'Tomates (Catégorie 1)', quantity: '50 kg', supplier: 'Marché Central', reason: 'Forte demande prévue pour les salades (Hausse de 20% des réservations)' },
            { name: 'Poulet Fermier', quantity: '120 kg', supplier: 'Ferme Atlas', reason: 'Menu spécial du weekend' },
            { name: 'Saumon Frais', quantity: '30 kg', supplier: 'Marée Bleue', reason: 'Stock actuel critique (Reste 5 kg)' }
          ]
        },
        {
          category: 'Épicerie & Secs',
          amount: '15 items',
          items: [
            { name: 'Riz Basmati', quantity: '100 kg', supplier: 'Atlas Food', reason: 'Réapprovisionnement mensuel optimal' },
            { name: 'Huile d\\'olive extra vierge', quantity: '40 L', supplier: 'Huileries du Sud', reason: 'Consommation accrue observée' }
          ]
        },
        {
          category: 'Boissons',
          amount: '8 items',
          items: [
            { name: 'Eau Minérale (Plate)', quantity: '200 packs', supplier: 'Distributeur Boissons', reason: 'Prévision de fortes chaleurs cette semaine' },
            { name: 'Jus d\\'orange frais', quantity: '50 L', supplier: 'Marché Central', reason: 'Consommation matinale au buffet en hausse' }
          ]
        }
      ]);
      setIsGeneratingPrevisions(false);
      showToast('Prévisions générées avec succès par l\\'IA');
    }, 2500);
  };
`;

// Insert handleGeneratePrevisions before return statement
code = code.replace("  return (", handleGeneratePrevisions + "\n  return (");

const previsionsTabContent = `
          {activeTab === 'previsions' && (
            <div className="p-8 max-w-5xl mx-auto w-full">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 bg-gradient-to-br from-white to-[#FAFAFA] p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#DDA956]/10 rounded-full blur-3xl"></div>
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#DDA956]/10 flex items-center justify-center">
                      <Brain className="text-[#DDA956]" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif text-[#1A1A1A]">Prévisions d'Achats Intelligentes</h2>
                      <p className="text-gray-500 mt-1">Générées par l'IA de Mouda Palace</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed relative z-10">
                    L'intelligence artificielle analyse en temps réel l'état de vos stocks, l'historique de consommation des 3 derniers mois, ainsi que les réservations et événements prévus pour la semaine à venir afin de vous proposer une liste d'achats optimisée.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <TrendingUp className="text-blue-500" size={20} />
                      <div className="text-sm">
                        <span className="block text-gray-500">Tendance Réservations</span>
                        <span className="font-medium text-gray-900">+15% vs semaine dernière</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <Calendar className="text-emerald-500" size={20} />
                      <div className="text-sm">
                        <span className="block text-gray-500">Période d'analyse</span>
                        <span className="font-medium text-gray-900">Prochains 7 jours</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <AlertTriangle className="text-amber-500" size={20} />
                      <div className="text-sm">
                        <span className="block text-gray-500">Stocks bas détectés</span>
                        <span className="font-medium text-gray-900">12 articles critiques</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleGeneratePrevisions}
                    disabled={isGeneratingPrevisions}
                    className={\`w-full sm:w-auto px-8 py-3 rounded-xl font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all \${
                      isGeneratingPrevisions 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#1A1A1A] hover:bg-black hover:shadow-xl hover:-translate-y-0.5'
                    }\`}
                  >
                    {isGeneratingPrevisions ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Analyse des données en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Générer les prévisions de la semaine
                      </>
                    )}
                  </button>
                </div>
              </div>

              {previsions && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif text-[#1A1A1A]">Liste d'Achats Recommandée</h3>
                    <button className="text-sm bg-[#DDA956]/10 text-[#DDA956] hover:bg-[#DDA956]/20 px-4 py-2 rounded-lg font-medium transition-colors">
                      Créer des bons de commande
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {previsions.map((category: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{category.category}</h4>
                          <span className="text-sm text-gray-500">{category.items.length} articles recommandés</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {category.items.map((item: any, i: number) => (
                            <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-medium text-gray-900">{item.name}</span>
                                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                    {item.quantity}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Sparkles size={14} className="text-[#DDA956]" />
                                  <span className="text-sm text-gray-600">{item.reason}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-500 text-right">
                                  <span className="block text-xs uppercase tracking-wider text-gray-400 mb-0.5">Fournisseur recommandé</span>
                                  {item.supplier}
                                </div>
                                <button className="p-2 text-gray-400 hover:text-[#DDA956] transition-colors bg-white border border-gray-100 shadow-sm rounded-lg hover:border-[#DDA956]/30">
                                  <ShoppingCart size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
`;

code = code.replace("{activeTab === 'fournisseurs' && (", previsionsTabContent + "\n          {activeTab === 'fournisseurs' && (");

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
console.log("Added Previsions tab to AchatsFournisseurs");
