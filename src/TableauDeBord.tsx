import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, TrendingUp, AlertTriangle, ArrowDownRight, ArrowUpRight, 
  DollarSign, Package, ChefHat, Activity, ThermometerSnowflake, ShieldCheck, 
  Clock, CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './context/ToastContext';
import { Database } from 'lucide-react';

export default function TableauDeBord() {
  const { showToast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [haccpLots, setHaccpLots] = useState<any[]>([]);
  const [temperatureLogs, setTemperatureLogs] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [cashReceipts, setCashReceipts] = useState<any[]>([]);

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, 'inventoryItems'), snap => {
      setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubRec = onSnapshot(collection(db, 'fiches_techniques'), snap => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubProd = onSnapshot(query(collection(db, 'productionOrders'), orderBy('createdAt', 'desc')), snap => {
      setProductionOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubLots = onSnapshot(query(collection(db, 'haccpLots'), orderBy('dlcDate', 'asc')), snap => {
      setHaccpLots(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubTemp = onSnapshot(query(collection(db, 'temperatureLogs'), orderBy('timestamp', 'desc')), snap => {
      setTemperatureLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubCmd = onSnapshot(query(collection(db, 'commandes'), orderBy('createdAt', 'desc')), snap => {
      setCommandes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubCash = onSnapshot(collection(db, 'cash_receipts'), snap => {
      setCashReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

  



  return () => {
      unsubInv();
      unsubRec();
      unsubProd();
      unsubLots();
      unsubTemp();
      unsubCmd();
      unsubCash();
    };
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      // 1. Fournisseurs
      await addDoc(collection(db, 'fournisseurs'), {
        nom: 'Farine de Fès',
        contact: '0600000001',
        email: 'contact@farinedefes.ma',
        categorie: 'Sec',
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'fournisseurs'), {
        nom: 'Boucherie Atlas',
        contact: '0600000002',
        email: 'contact@boucherieatlas.ma',
        categorie: 'Viande',
        createdAt: serverTimestamp()
      });

      // 2. Ingrédients (inventoryItems)
      const i1 = await addDoc(collection(db, 'inventoryItems'), {
        name: 'Poulet Entier',
        category: 'Viande',
        quantity: 50,
        unit: 'kg',
        price: 35,
        minThreshold: 10,
        zone: 'Chambre Froide',
        createdAt: serverTimestamp()
      });
      const i2 = await addDoc(collection(db, 'inventoryItems'), {
        name: 'Citron Confit',
        category: 'Épicerie',
        quantity: 5,
        unit: 'kg',
        price: 40,
        minThreshold: 2,
        zone: 'Économat',
        createdAt: serverTimestamp()
      });
      const i3 = await addDoc(collection(db, 'inventoryItems'), {
        name: 'Oignon Blanc',
        category: 'Légumes',
        quantity: 20,
        unit: 'kg',
        price: 5,
        minThreshold: 5,
        zone: 'Économat',
        createdAt: serverTimestamp()
      });

      // 3. Fiche technique (fiches_techniques)
      await addDoc(collection(db, 'fiches_techniques'), {
        nom: 'Tajine de Poulet Citron Confit',
        categorie: 'Plat Principal',
        portions: 4,
        prixVente: 120,
        coutMatiere: 45,
        foodCost: (45 / 120) * 100,
        margeBrute: 120 - 45,
        ingredients: [
          { nom: 'Poulet Entier', quantite: 1, unite: 'kg', prixUnitaire: 35, unitePrix: 'kg', coutCalculated: 35 },
          { nom: 'Citron Confit', quantite: 0.1, unite: 'kg', prixUnitaire: 40, unitePrix: 'kg', coutCalculated: 4 },
          { nom: 'Oignon Blanc', quantite: 0.5, unite: 'kg', prixUnitaire: 5, unitePrix: 'kg', coutCalculated: 2.5 }
        ],
        updatedAt: serverTimestamp()
      });

      // 4. Lot sous-vide (haccpLots)
      await addDoc(collection(db, 'haccpLots'), {
        lotNumber: `LOT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000).toString().padStart(3, '0')}`,
        itemId: i1.id,
        itemName: 'Poulet Entier (Portionné)',
        operator: 'Chef Ahmed',
        tempSealing: 4.5,
        tempRefrigeration: -19.0,
        quantity: 10,
        dlcDays: 30,
        dlcDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Validé',
        createdAt: serverTimestamp()
      });

      // 5. Temperature log
      await addDoc(collection(db, 'temperatureLogs'), {
        temperature: -19.5,
        operator: 'Chef Ahmed',
        room: 'Chambre Négative',
        timestamp: serverTimestamp()
      });

      // 6. Production Order
      await addDoc(collection(db, 'productionOrders'), {
        recipeId: 'fake-id',
        recipeName: 'Tajine de Poulet Citron Confit',
        plannedQuantity: 20,
        status: 'En cours',
        chefResponsable: 'Chef Ahmed',
        createdAt: serverTimestamp()
      });

      // 7. Commandes
      await addDoc(collection(db, 'commandes'), {
        fournisseur: 'Boucherie Atlas',
        statut: 'Livrée',
        totalAmount: 1500,
        createdAt: serverTimestamp()
      });

      showToast("Données de démo injectées avec succès !");
    } catch (error) {
      console.error("Erreur lors du seeding", error);
      showToast("Erreur lors de l'injection des données", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  // --- Calculations for KPIs ---

  // 1. Food Cost & Marge Globale (Potential based on Recipes)
  let totalFoodCost = 0;
  let totalPrixVente = 0;
  
  recipes.forEach(r => {
    totalFoodCost += (parseFloat(r.coutMatiere) || 0);
    totalPrixVente += (parseFloat(r.prixVente) || 0);
  });
  
  const averageFoodCostPct = totalPrixVente > 0 ? (totalFoodCost / totalPrixVente) * 100 : 0;
  const margeBruteGlobale = totalPrixVente - totalFoodCost;
  
  // 2. Production Volume (Last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentProductions = productionOrders.filter(po => {
    if (!po.createdAt) return false;
    const date = po.createdAt?.toDate ? po.createdAt.toDate() : new Date(po.createdAt);
    return date >= thirtyDaysAgo;
  });

  const volumeProduit = recentProductions.reduce((sum, po) => sum + (parseFloat(po.plannedQuantity) || 0), 0);
  
  // 3. Commandes / Achats (Last 30 days)
  const recentCommandes = commandes.filter(c => {
    if (!c.createdAt) return false;
    const date = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
    return date >= thirtyDaysAgo;
  });
  const totalAchats = recentCommandes.reduce((sum, c) => sum + (parseFloat(c.totalAmount) || 0), 0);

  // --- Alerts Generation ---

  const alerts = [];

  // Stock Faible
  inventory.forEach(item => {
    const qty = parseFloat(item.quantity) || 0;
    const min = parseFloat(item.minStock) || 5;
    if (qty <= min) {
      alerts.push({
        id: `stock-${item.id}`,
        type: 'stock',
        severity: qty === 0 ? 'high' : 'medium',
        title: 'Stock Faible',
        message: `${item.name} (${qty} ${item.unit} restants, min: ${min})`,
        icon: <Package size={16} />
      });
    }
  });

  // DLC
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  haccpLots.forEach(lot => {
    if (lot.status === 'Épuisé' || lot.status === 'Consommé' || lot.status === 'Jeté') return;
    const dlc = new Date(lot.dlcDate);
    if (dlc < now) {
      alerts.push({
        id: `dlc-${lot.id}`,
        type: 'dlc_expired',
        severity: 'high',
        title: 'DLC Dépassée',
        message: `Lot ${lot.lotNumber} (${lot.itemName}) périmé depuis le ${dlc.toLocaleDateString()}`,
        icon: <AlertTriangle size={16} />
      });
    } else if (dlc <= nextWeek) {
      alerts.push({
        id: `dlc-${lot.id}`,
        type: 'dlc_soon',
        severity: 'medium',
        title: 'DLC Proche',
        message: `Lot ${lot.lotNumber} (${lot.itemName}) expire le ${dlc.toLocaleDateString()}`,
        icon: <Clock size={16} />
      });
    }
  });

  // Temperatures
  const recentTemps = temperatureLogs.slice(0, 10);
  recentTemps.forEach(log => {
    if (log.room === 'Chambre Négative' && log.temperature > -18) {
      alerts.push({
        id: `temp-${log.id}`,
        type: 'temp',
        severity: 'high',
        title: 'Alerte Température',
        message: `Chambre Négative à ${log.temperature}°C le ${log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : ''}`,
        icon: <ThermometerSnowflake size={16} />
      });
    }
  });

  // --- Charts Data ---
  
  // Recipe Food Cost Comparison
  const revByDate = cashReceipts.reduce((acc, cr) => {
    const d = cr.date || 'Inconnu';
    if (!acc[d]) acc[d] = 0;
    acc[d] += Number(cr.amount) || 0;
    return acc;
  }, {});

  const evolutionData = Object.entries(revByDate)
    .sort((a, b) => {
      // sort dates assuming format like '07 oct. 2023' or '2023-10-07'
      // For simplicity, string sort or parse to Date if it works.
      // If dates are DD MMM YYYY, it's tricky, but let's just reverse or keep as is.
      // Actually, let's just sort by key if it's sortable, or use original order.
      const dateA = new Date(a[0]).getTime();
      const dateB = new Date(b[0]).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
      return a[0].localeCompare(b[0]);
    })
    .map(([date, revenue]) => ({
      name: date,
      CA: revenue
    }));  const recipeChartData = recipes.slice(0, 5).map(r => ({
    name: r.nom.substring(0, 15),
    FoodCost: parseFloat(r.coutMatiere) || 0,
    Marge: parseFloat(r.margeBrute) || 0
  }));

  // Inventory Distribution by Category
  const categoryCount: Record<string, number> = {};
  inventory.forEach(item => {
    const cat = item.category || 'Autre';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const pieData = Object.keys(categoryCount).map((key, i) => ({
    name: key,
    value: categoryCount[key],
    color: COLORS[i % COLORS.length]
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Tableau de Bord Exécutif</h1>
            <p className="text-gray-500">Pilotage de la rentabilité, alertes globales et KPIs</p>
          </div>
        </div>
        <button
          onClick={handleSeedData}
          disabled={isSeeding}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-medium transition-colors disabled:opacity-50"
          title="Injecter données de démo"
        >
          <Database size={18} />
          {isSeeding ? 'Injection...' : 'Données Démo'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Marge Brute Potentielle</p>
              <h3 className="text-3xl font-black text-gray-900">{margeBruteGlobale.toFixed(2)} DH</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">Basé sur catalogue</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Food Cost Moyen</p>
              <h3 className="text-3xl font-black text-gray-900">{averageFoodCostPct.toFixed(1)}%</h3>
            </div>
            <div className={`p-2 rounded-lg ${averageFoodCostPct > 35 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {averageFoodCostPct > 35 ? (
              <><ArrowUpRight size={16} className="text-red-500 mr-1" /><span className="text-red-500 font-medium">Objectif &lt; 30%</span></>
            ) : (
              <><ArrowDownRight size={16} className="text-green-500 mr-1" /><span className="text-green-500 font-medium">Optimal</span></>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Achats (30j)</p>
              <h3 className="text-3xl font-black text-gray-900">{totalAchats.toFixed(2)} DH</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Matières premières</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Volume Prod (30j)</p>
              <h3 className="text-3xl font-black text-gray-900">{volumeProduit} portions</h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <ChefHat size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Ordres de fabrication</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts Center */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-purple-600" />
              Centre des Alertes
            </h3>
            
            <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                  <CheckCircle2 size={48} className="text-green-200" />
                  <p>Aucune alerte en cours. Tout est nominal.</p>
                </div>
              ) : (
                alerts.sort((a, b) => a.severity === 'high' ? -1 : 1).map((alert, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={alert.id} 
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-100 text-red-900' : 'bg-orange-50 border-orange-100 text-orange-900'
                    }`}
                  >
                    <div className={`mt-0.5 ${alert.severity === 'high' ? 'text-red-500' : 'text-orange-500'}`}>
                      {alert.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{alert.title}</h4>
                      <p className={`text-xs mt-1 leading-relaxed ${alert.severity === 'high' ? 'text-red-700' : 'text-orange-700'}`}>
                        {alert.message}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[500px] flex flex-col">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" />
              Rentabilité (Top 5 Plats)
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recipeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="FoodCost" name="Coût Matière (DH)" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} barSize={40} />
                  <Bar dataKey="Marge" name="Marge Brute (DH)" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[350px] flex flex-col">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package size={20} className="text-amber-500" />
              Répartition des Stocks
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
        </div>

        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#265C6D]" />
            Historique d'Évolution (CA)
          </h3>
          <div className="flex-1 min-h-[300px]">
            {evolutionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#265C6D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#265C6D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} width={60} tickFormatter={(value) => `${value} DH`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} MAD`, 'Chiffre d\'affaires']}
                  />
                  <Area type="monotone" dataKey="CA" stroke="#265C6D" strokeWidth={3} fillOpacity={1} fill="url(#colorCA)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Historique d'Évolution</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Connectez le module POS / Caisse pour visualiser l'évolution du chiffre d'affaires.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
