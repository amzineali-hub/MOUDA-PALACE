import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, FileText, Search, Activity, BarChart2 } from 'lucide-react';

interface SeoAnalyticsProps {
  articles: any[];
}

export default function SeoAnalytics({ articles }: SeoAnalyticsProps) {
  // Compute analytics data from articles
  
  const stats = useMemo(() => {
    const total = articles.length;
    
    // Estimate total words
    const totalWords = articles.reduce((acc, curr) => {
      return acc + (curr.content ? curr.content.split(/\s+/).length : 0);
    }, 0);
    
    const avgWords = total > 0 ? Math.round(totalWords / total) : 0;
    
    // Generate trend data (group by date)
    const trendsMap = new Map();
    
    // Default 7 days back if no articles
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendsMap.set(d.toISOString().split('T')[0], { date: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), articles: 0, words: 0 });
    }

    articles.forEach(article => {
      let d = new Date();
      if (article.createdAt?.toDate) {
        d = article.createdAt.toDate();
      }
      const key = d.toISOString().split('T')[0];
      if (trendsMap.has(key)) {
        const current = trendsMap.get(key);
        current.articles += 1;
        current.words += (article.content ? article.content.split(/\s+/).length : 0);
      } else {
        trendsMap.set(key, {
          date: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          articles: 1,
          words: (article.content ? article.content.split(/\s+/).length : 0)
        });
      }
    });

    const trendData = Array.from(trendsMap.values()).slice(-7); // Last 7 days

    // Mock SEO Score (based on word count & frequency for visualization)
    const seoScore = total > 0 ? Math.min(100, Math.round((avgWords / 1500) * 100)) : 0;

    return {
      total,
      avgWords,
      trendData,
      seoScore
    };
  }, [articles]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Articles Publiés</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Taux de Clics (CTR) Moyen</p>
            <h3 className="text-2xl font-bold text-gray-900">4.2%</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Search size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Mots-clés dans le Top 10</p>
            <h3 className="text-2xl font-bold text-gray-900">12</h3>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Évolution de la production</h3>
              <p className="text-sm text-gray-500">Nombre d'articles générés (7 derniers jours)</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
              <BarChart2 size={20} />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="articles" fill="#DDA956" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Volume de mots (SEO)</h3>
              <p className="text-sm text-gray-500">Croissance sémantique générée</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
              <Activity size={20} />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DDA956" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#DDA956" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip cursor={{ stroke: '#DDA956', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="words" stroke="#DDA956" strokeWidth={3} fillOpacity={1} fill="url(#colorWords)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      
      {/* Placeholder Integration Message */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Search size={20} className="text-[#DDA956]" />
            Connecter Google Search Console
          </h3>
          <p className="text-gray-400 mt-2 text-sm max-w-2xl leading-relaxed">
            Pour obtenir les données réelles de trafic (Impressions, Clics, Position moyenne), liez votre compte Google Search Console. 
            Les données actuelles sont basées sur le volume de contenu généré par l'IA.
          </p>
        </div>
        <button 
          onClick={() => alert("L'intégration Google Search Console sera disponible prochainement.")}
          className="w-full md:w-auto px-6 py-3 bg-[#DDA956] hover:bg-[#c59648] text-[#1A1A1A] rounded-xl font-bold transition-colors text-sm whitespace-nowrap text-center"
        >
          Connecter le compte
        </button>
      </div>
    </div>
  );
}
