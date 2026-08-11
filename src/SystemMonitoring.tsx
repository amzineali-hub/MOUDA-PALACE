import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MonitorSmartphone, ChefHat, Package, FileSpreadsheet, ShoppingCart, CheckCircle2, XCircle, Wifi, WifiOff, Database, Activity } from 'lucide-react';
import { indexedDbPersistenceReady } from './firebase';

export default function SystemMonitoring() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [persistenceEnabled, setPersistenceEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    indexedDbPersistenceReady.then(setPersistenceEnabled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const nodes = [
    { id: 'pos', name: 'Caisse POS', icon: MonitorSmartphone, color: '#3b82f6', angle: 210 },
    { id: 'kds', name: 'Cuisine KDS', icon: ChefHat, color: '#f97316', angle: 270 },
    { id: 'stock', name: 'Stocks', icon: Package, color: '#10b981', angle: 330 },
    { id: 'acc', name: 'Compta', icon: FileSpreadsheet, color: '#a855f7', angle: 30 },
    { id: 'buy', name: 'Achats', icon: ShoppingCart, color: '#f43f5e', angle: 150 },
  ];

  // Helper to position nodes in a circle
  const radius = 140; // px
  const getPosition = (angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: 250 + radius * Math.cos(angleRad),
      y: 180 + radius * Math.sin(angleRad)
    };
  };

  return (
    <div className="bg-black/10 backdrop-blur-sm rounded-3xl p-5 shadow-2xl border border-white/10 mb-6 overflow-hidden relative max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 text-blue-400 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">Réseau Synaptique ERP</h3>
            <p className="text-sm text-gray-400">Monitoring de la propagation atomique des données</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isOnline ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}>
          {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
          <span className="font-semibold text-sm tracking-wide">
            {isOnline ? 'Flux Temps Réel' : 'Persistance Locale'}
          </span>
        </div>
      </div>

      <div className="w-full flex justify-center overflow-hidden"><div className="relative w-[500px] h-[360px] flex-shrink-0 [transform:scale(0.75)] sm:[transform:scale(0.9)] md:[transform:scale(1)] origin-center -my-12 sm:-my-8 md:my-0">
        {/* SVG Synapses */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 360">
          {/* Defs for gradients and animations */}
          <defs>
            {nodes.map(node => (
              <linearGradient key={`grad-${node.id}`} id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={node.color} stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
              </linearGradient>
            ))}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Connections to center */}
          {nodes.map((node, i) => {
            const pos = getPosition(node.angle);
            return (
              <g key={`connection-${node.id}`}>
                {/* Base wire */}
                <path
                  d={`M ${pos.x} ${pos.y} Q ${(pos.x + 250) / 2} ${(pos.y + 180) / 2 + (i%2===0?-20:20)} 250 180`}
                  fill="none"
                  stroke={isOnline ? `url(#grad-${node.id})` : '#333'}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity={isOnline ? "0.6" : "0.3"}
                />
                
                {/* Flowing data pulses */}
                {isOnline && (
                  <motion.circle
                    r="3"
                    fill={node.color}
                    filter="url(#glow)"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.4
                    }}
                    style={{
                      offsetPath: `path("M ${pos.x} ${pos.y} Q ${(pos.x + 250) / 2} ${(pos.y + 180) / 2 + (i%2===0?-20:20)} 250 180")`
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Center Node (Nucleus) */}
        <motion.div 
          className="absolute z-10 flex flex-col items-center justify-center"
          style={{ left: 250 - 45, top: 180 - 45 }}
          animate={isOnline ? { scale: [1, 1.05, 1], boxShadow: ["0 0 20px rgba(79,70,229,0.4)", "0 0 40px rgba(79,70,229,0.6)", "0 0 20px rgba(79,70,229,0.4)"] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-indigo-600 to-indigo-900 border-2 border-indigo-400 flex items-center justify-center relative shadow-lg">
            <Database size={36} className="text-white relative z-10" />
            {isOnline && (
              <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20"></div>
            )}
          </div>
          <div className="absolute -bottom-8 whitespace-nowrap font-bold text-indigo-300 text-sm">Noyau Atomique</div>
        </motion.div>

        {/* Peripheral Nodes (Neurons) */}
        {nodes.map((node, i) => {
          const pos = getPosition(node.angle);
          const Icon = node.icon;
          return (
            <motion.div 
              key={node.id}
              className="absolute z-10 flex flex-col items-center justify-center group"
              style={{ left: pos.x - 30, top: pos.y - 30 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
            >
              <div 
                className="w-[60px] h-[60px] rounded-full bg-[#1A1A1A] border-2 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-110 shadow-lg"
                style={{ borderColor: node.color, boxShadow: isOnline ? `0 0 15px ${node.color}40` : 'none' }}
              >
                <Icon size={24} style={{ color: node.color }} className="relative z-10" />
                {isOnline && (
                  <div className="absolute inset-0 rounded-full animate-pulse opacity-20" style={{ backgroundColor: node.color }}></div>
                )}
              </div>
              <div className="absolute -bottom-7 whitespace-nowrap font-medium text-gray-300 text-xs text-center">
                {node.name}
              </div>
            </motion.div>
          );
        })}
      </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400 relative z-10">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>Synchronisation Multi-Écrans en Direct</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
          {persistenceEnabled === false ? (
            <XCircle size={14} className="text-red-400" />
          ) : (
            <CheckCircle2 size={14} className="text-emerald-400" />
          )}
          <span>{persistenceEnabled === false ? 'Cache IndexedDB Indisponible' : 'Cache IndexedDB Local'}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>Résolution UUID Anti-Conflit</span>
        </div>
      </div>
    </div>
  );
}
