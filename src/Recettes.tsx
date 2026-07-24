import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, ChefHat, Tag, Scale, AlertCircle, ChevronRight, Edit3 } from 'lucide-react';

export default function Recettes() {
  const [activeCategory, setActiveCategory] = useState('toutes');

  const recettes = [
    { id: 'R001', nom: 'Pastilla au Pigeon', categorie: 'Plats Principaux', cout: '120 MAD', temps: '1h 30m', portion: '4 personnes', difficulte: 'Difficile' },
    { id: 'R002', nom: 'Couscous Royal', categorie: 'Plats Principaux', cout: '150 MAD', temps: '2h', portion: '6 personnes', difficulte: 'Moyenne' },
    { id: 'R003', nom: 'Zaalouk d\'Aubergines', categorie: 'Entrées', cout: '25 MAD', temps: '40m', portion: '2 personnes', difficulte: 'Facile' },
    { id: 'R004', nom: 'Tajine d\'Agneau aux Pruneaux', categorie: 'Plats Principaux', cout: '110 MAD', temps: '1h 45m', portion: '4 personnes', difficulte: 'Moyenne' },
    { id: 'R005', nom: 'Corne de Gazelle', categorie: 'Desserts', cout: '60 MAD', temps: '2h', portion: '12 pièces', difficulte: 'Difficile' },
  ];

  const categories = ['Toutes', 'Entrées', 'Plats Principaux', 'Desserts', 'Boissons'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A] font-semibold mb-2">Fiches Techniques & Recettes</h1>
          <p className="text-gray-500">Gérez vos recettes, calculez vos coûts de revient et vos portions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium hover:bg-[#C89845] transition-colors shadow-sm">
            <Plus size={18} />
            <span>Nouvelle Recette</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat.toLowerCase())}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              activeCategory === cat.toLowerCase() 
                ? 'bg-[#1A1A1A] text-[#DDA956] border-[#1A1A1A]' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#DDA956]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Rechercher une recette ou un ingrédient..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DDA956] focus:border-transparent bg-white"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <AlertCircle size={20} />
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Nom de la recette</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium text-center">Portion</th>
                <th className="px-6 py-4 font-medium text-center">Temps</th>
                <th className="px-6 py-4 font-medium text-center">Difficulté</th>
                <th className="px-6 py-4 font-medium text-right">Coût estimé</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recettes.map((recette) => (
                <tr key={recette.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                        <ChefHat size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A1A1A]">{recette.nom}</p>
                        <p className="text-xs text-gray-400">ID: {recette.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Tag size={14} className="text-gray-400" />
                      {recette.categorie}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{recette.portion}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{recette.temps}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      recette.difficulte === 'Facile' ? 'bg-green-100 text-green-700' :
                      recette.difficulte === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {recette.difficulte}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[#1A1A1A]">{recette.cout}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Modifier">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-[#DDA956] transition-colors" title="Fiche technique détaillée">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
