import React, { useState } from 'react';
import { Search, FileText, ChevronRight, BookOpen, Settings, PlayCircle, Users, Coffee, CalendarCheck, MessageCircle, FileDigit } from 'lucide-react';

const categories = [
  { id: 'all', label: 'Tout', icon: <FileText size={16} /> },
  { id: 'start', label: 'Démarrage', icon: <PlayCircle size={16} /> },
  { id: 'reservations', label: 'Réservations & CRM', icon: <CalendarCheck size={16} /> },
  { id: 'staff', label: 'Personnes & Administration', icon: <Users size={16} /> },
  { id: 'kitchen', label: 'Cuisine & Stocks', icon: <Coffee size={16} /> },
  { id: 'marketing', label: 'Marketing & IA', icon: <MessageCircle size={16} /> },
  { id: 'accounting', label: 'Facturation & Compta', icon: <FileDigit size={16} /> },
];

const guides = [
  {
    id: 1,
    title: 'Premiers Pas',
    description: 'Guide de démarrage : connexion, tableau de bord, navigation générale et paramétrage de votre profil.',
    level: 'Débutant',
    steps: 5,
    category: 'start',
    link: '#'
  },
  {
    id: 2,
    title: 'Gestion des Réservations',
    description: 'Comment prendre une réservation, gérer le plan de salle, et utiliser la liste d\'attente efficacement.',
    level: 'Débutant',
    steps: 4,
    category: 'reservations',
    link: '#'
  },
  {
    id: 3,
    title: 'Portail B2B Riads',
    description: 'Configuration des commissions partenaires, gestion des réservations B2B et suivi des paiements des concierges.',
    level: 'Intermédiaire',
    steps: 6,
    category: 'reservations',
    link: '#'
  },
  {
    id: 4,
    title: 'Automatisation WhatsApp',
    description: 'Mise en place des confirmations automatiques, rappels, et utilisation de l\'IA pour répondre aux clients.',
    level: 'Avancé',
    steps: 7,
    category: 'marketing',
    link: '#'
  },
  {
    id: 5,
    title: 'Création d\'Articles de Blog (IA)',
    description: 'Générer des articles optimisés SEO avec l\'IA, les éditer et les publier directement via Webhook sur votre site.',
    level: 'Intermédiaire',
    steps: 4,
    category: 'marketing',
    link: '#'
  },
  {
    id: 6,
    title: 'Gestion des Stocks & Recettes',
    description: 'Création de fiches techniques, suivi de la production quotidienne, et gestion des alertes de stock minimum.',
    level: 'Avancé',
    steps: 8,
    category: 'kitchen',
    link: '#'
  },
  {
    id: 7,
    title: 'Menu Digital QR Code',
    description: 'Mise à jour de la carte, gestion des ruptures en temps réel, et personnalisation du menu digital.',
    level: 'Débutant',
    steps: 3,
    category: 'marketing',
    link: '#'
  },
  {
    id: 8,
    title: 'Gestion du Personnel (RH)',
    description: 'Planification des plannings, suivi des présences, gestion des congés et évaluations des employés.',
    level: 'Intermédiaire',
    steps: 5,
    category: 'staff',
    link: '#'
  },
  {
    id: 9,
    title: 'Caisse & Clôture',
    description: 'Intégration TacSystems, gestion des encaissements, et procédure de clôture journalière.',
    level: 'Intermédiaire',
    steps: 4,
    category: 'accounting',
    link: '#'
  },
  {
    id: 10,
    title: 'Facturation & Comptabilité',
    description: 'Génération de factures proforma, suivi des paiements, et export comptable mensuel.',
    level: 'Avancé',
    steps: 6,
    category: 'accounting',
    link: '#'
  }
];

export default function Documentation() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = activeCategory === 'all' || guide.category === activeCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Débutant': return 'bg-blue-100 text-blue-700';
      case 'Intermédiaire': return 'bg-purple-100 text-purple-700';
      case 'Avancé': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
              <FileText size={14} /> v2.0
            </span>
            <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
              Aide en ligne
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            Centre de Documentation
          </h1>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl">
            Tout ce que vous devez savoir sur Mouda Palace SaaS
          </p>
          
          <div className="relative max-w-3xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher dans la documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 rounded-xl border-0 ring-4 ring-indigo-500/30 text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-amber-400/50 sm:text-lg shadow-inner bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap items-center gap-3 py-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'
            }`}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <div key={guide.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${getLevelColor(guide.level)}`}>
                {guide.level}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                {guide.steps} steps
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
              {guide.title}
            </h3>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1">
              {guide.description}
            </p>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <button className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Voir le guide <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {filteredGuides.length === 0 && (
          <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun guide trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos termes de recherche ou de sélectionner une autre catégorie.</p>
          </div>
        )}
      </div>
      
      {/* Support floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-300">
          <MessageCircle size={24} />
        </button>
      </div>
    </div>
  );
}
