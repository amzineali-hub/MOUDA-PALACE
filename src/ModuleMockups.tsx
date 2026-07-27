import React from 'react';
import { Search, Plus, List, Grid, Users, Receipt, Calendar, Settings, ChefHat, ShoppingCart, BarChart3, Clock, DollarSign } from 'lucide-react';

export const ModuleMockup = ({ type }: { type: string }) => {
  switch (type) {
    case 'achats':
      return (
        <div className="w-full h-full bg-gray-50 flex flex-col rounded-lg overflow-hidden border border-gray-200 text-[8px] leading-tight">
          <div className="bg-white p-2 border-b flex justify-between items-center">
            <span className="font-bold text-gray-800">Achats & Fournisseurs</span>
            <div className="bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
              <Plus size={8} /> Nouvel Achat
            </div>
          </div>
          <div className="p-2 flex-1">
            <div className="flex gap-2 mb-2">
              <div className="bg-white border rounded px-1 flex-1 py-1 flex items-center text-gray-400"><Search size={8} className="mr-1"/> Rechercher...</div>
              <div className="bg-white border rounded px-1 py-1">Filtres</div>
            </div>
            <div className="bg-white border rounded">
              <div className="flex border-b bg-gray-50 p-1 font-semibold text-gray-500">
                <div className="flex-1">Date</div>
                <div className="flex-1">Fournisseur</div>
                <div className="flex-1">Montant</div>
                <div className="flex-1">Statut</div>
              </div>
              {[1,2,3].map(i => (
                <div key={i} className="flex border-b p-1 items-center">
                  <div className="flex-1 text-gray-600">12/05/2024</div>
                  <div className="flex-1 font-medium">Boucherie Centrale</div>
                  <div className="flex-1 font-bold">1450 DH</div>
                  <div className="flex-1"><span className="bg-green-100 text-green-700 px-1 rounded-full">Payé</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 'inventaire':
      return (
        <div className="w-full h-full bg-gray-50 flex flex-col rounded-lg overflow-hidden border border-gray-200 text-[8px] leading-tight">
          <div className="bg-white p-2 border-b flex justify-between items-center">
            <span className="font-bold text-gray-800">Inventaire</span>
            <div className="bg-indigo-600 text-white px-2 py-0.5 rounded">Ajouter Produit</div>
          </div>
          <div className="p-2 grid grid-cols-2 gap-2 flex-1">
            {['Viande Hachée', 'Tomates', 'Farine', 'Huile'].map((p, i) => (
              <div key={i} className="bg-white border rounded p-1.5 flex flex-col gap-1">
                <div className="font-semibold text-gray-700">{p}</div>
                <div className="text-gray-500">{i === 1 ? '15 kg' : '50 unités'}</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div className={`h-1 rounded-full ${i === 1 ? 'bg-amber-500 w-1/3' : 'bg-green-500 w-3/4'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'cuisine':
      return (
        <div className="w-full h-full bg-gray-900 flex flex-col rounded-lg overflow-hidden border border-gray-800 text-[8px] leading-tight">
          <div className="bg-gray-800 p-2 border-b border-gray-700 flex justify-between items-center text-white">
            <span className="font-bold flex items-center gap-1"><ChefHat size={10} className="text-amber-400"/> KDS - Cuisine</span>
            <span className="text-gray-400">12:45 PM</span>
          </div>
          <div className="p-2 grid grid-cols-3 gap-2 flex-1">
            <div className="bg-gray-800 rounded p-1 border border-gray-700">
              <div className="text-white font-bold mb-1 pb-1 border-b border-gray-700">Nouveaux (2)</div>
              <div className="bg-gray-700 p-1 rounded mb-1 border-l-2 border-blue-500 text-white">
                <div className="flex justify-between font-bold mb-1"><span>Tbl 4</span><span>3m</span></div>
                <div>2x Burger Maison</div>
                <div>1x Salade César</div>
              </div>
            </div>
            <div className="bg-gray-800 rounded p-1 border border-gray-700">
              <div className="text-white font-bold mb-1 pb-1 border-b border-gray-700">En cours (1)</div>
              <div className="bg-gray-700 p-1 rounded mb-1 border-l-2 border-amber-500 text-white">
                <div className="flex justify-between font-bold mb-1"><span>Tbl 12</span><span>8m</span></div>
                <div className="line-through text-gray-400">1x Soupe Oignon</div>
                <div>1x Entrecôte</div>
              </div>
            </div>
            <div className="bg-gray-800 rounded p-1 border border-gray-700">
              <div className="text-white font-bold mb-1 pb-1 border-b border-gray-700">Prêts (0)</div>
            </div>
          </div>
        </div>
      );
    case 'recettes':
      return (
        <div className="w-full h-full bg-gray-50 flex flex-col rounded-lg overflow-hidden border border-gray-200 text-[8px] leading-tight">
          <div className="bg-white p-2 border-b flex justify-between items-center">
            <span className="font-bold text-gray-800">Recettes & Menu</span>
            <div className="bg-indigo-600 text-white px-2 py-0.5 rounded">Nouvelle Recette</div>
          </div>
          <div className="bg-white border-b px-2 flex gap-2">
            <div className="border-b-2 border-indigo-600 text-indigo-600 py-1 font-semibold">Entrées</div>
            <div className="py-1 text-gray-500">Plats</div>
            <div className="py-1 text-gray-500">Desserts</div>
          </div>
          <div className="p-2 grid grid-cols-2 gap-2 flex-1">
            {['Salade César', 'Soupe à l\'oignon', 'Carpaccio', 'Nems'].map((p, i) => (
              <div key={i} className="bg-white border rounded flex overflow-hidden">
                <div className="w-8 bg-gray-200 flex-shrink-0"></div>
                <div className="p-1 flex-1 flex flex-col justify-center">
                  <div className="font-bold text-gray-800 truncate">{p}</div>
                  <div className="text-indigo-600 font-semibold">{80 + i*15} DH</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'tables':
      return (
        <div className="w-full h-full bg-gray-100 flex flex-col rounded-lg overflow-hidden border border-gray-200 text-[8px] leading-tight">
          <div className="bg-white p-2 border-b flex justify-between items-center">
            <span className="font-bold text-gray-800">Plan de Salle</span>
            <div className="flex gap-1">
              <span className="bg-green-100 text-green-700 px-1 rounded">2 Libres</span>
              <span className="bg-red-100 text-red-700 px-1 rounded">3 Occupées</span>
            </div>
          </div>
          <div className="p-3 flex-1 flex flex-wrap gap-3 justify-center items-center relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:10px_10px]">
            <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center font-bold text-red-700">T1</div>
            <div className="w-12 h-8 rounded-lg bg-green-100 border-2 border-green-500 flex items-center justify-center font-bold text-green-700">T2</div>
            <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center font-bold text-green-700">T3</div>
            <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center font-bold text-amber-700">T4</div>
            <div className="w-12 h-8 rounded-lg bg-red-100 border-2 border-red-500 flex items-center justify-center font-bold text-red-700">T5</div>
          </div>
        </div>
      );
    case 'rh':
      return (
        <div className="w-full h-full bg-gray-50 flex flex-col rounded-lg overflow-hidden border border-gray-200 text-[8px] leading-tight">
          <div className="bg-white p-2 border-b flex justify-between items-center">
            <span className="font-bold text-gray-800">Équipe & RH</span>
            <div className="bg-indigo-600 text-white px-2 py-0.5 rounded">Inviter</div>
          </div>
          <div className="p-2 flex-1">
            <div className="bg-white border rounded">
              {[
                { n: 'Ali Amzine', r: 'Admin', c: 'bg-purple-100 text-purple-700' },
                { n: 'Sarah B.', r: 'Manager', c: 'bg-blue-100 text-blue-700' },
                { n: 'Karim Y.', r: 'Serveur', c: 'bg-emerald-100 text-emerald-700' },
                { n: 'Youssef M.', r: 'Cuisine', c: 'bg-amber-100 text-amber-700' }
              ].map((u, i) => (
                <div key={i} className="flex border-b p-1.5 items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500">{u.n[0]}</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{u.n}</div>
                    <div className="text-gray-400">Actif il y a 2h</div>
                  </div>
                  <div><span className={`px-1.5 py-0.5 rounded-full ${u.c}`}>{u.r}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 'pos':
      return (
        <div className="w-full h-full bg-gray-100 flex rounded-lg overflow-hidden border border-gray-200 text-[8px] leading-tight">
          <div className="w-2/3 flex flex-col">
            <div className="bg-white p-2 border-b flex gap-1 overflow-x-hidden">
              <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded">Tout</span>
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Plats</span>
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Boissons</span>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2 flex-1 bg-gray-50">
              {['Pizza', 'Burger', 'Cola', 'Salade'].map((p,i) => (
                <div key={i} className="bg-white border rounded flex flex-col p-1 shadow-sm active:bg-gray-50">
                  <div className="h-8 bg-indigo-50 rounded mb-1"></div>
                  <span className="font-bold truncate">{p}</span>
                  <span className="text-indigo-600 font-semibold">{50 + i*10} DH</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-1/3 bg-white border-l flex flex-col">
            <div className="p-2 border-b bg-gray-50 font-bold text-center">Table 4</div>
            <div className="flex-1 p-1 overflow-hidden flex flex-col gap-1">
              <div className="flex justify-between border-b pb-1">
                <span>1x Burger</span><span>80.00</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>2x Cola</span><span>40.00</span>
              </div>
            </div>
            <div className="p-2 bg-gray-50 border-t">
              <div className="flex justify-between font-bold text-[10px] mb-2">
                <span>Total</span><span className="text-indigo-600">120.00 DH</span>
              </div>
              <div className="bg-green-600 text-white text-center py-1.5 rounded font-bold shadow-sm">
                Encaisser
              </div>
            </div>
          </div>
        </div>
      );
    case 'compta':
      return (
        <div className="w-full h-full bg-gray-50 flex flex-col rounded-lg overflow-hidden border border-gray-200 text-[8px] leading-tight">
          <div className="bg-white p-2 border-b flex justify-between items-center">
            <span className="font-bold text-gray-800">Comptabilité & Finances</span>
            <span className="text-gray-500">Ce mois</span>
          </div>
          <div className="p-2 flex-1 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border rounded p-1.5">
                <div className="text-gray-500 flex items-center gap-1"><DollarSign size={8}/> CA Brut</div>
                <div className="font-bold text-gray-800 text-[10px] mt-0.5">45,230 DH</div>
                <div className="text-green-500 flex items-center mt-0.5">+12%</div>
              </div>
              <div className="bg-white border rounded p-1.5">
                <div className="text-gray-500 flex items-center gap-1"><ShoppingCart size={8}/> Dépenses</div>
                <div className="font-bold text-gray-800 text-[10px] mt-0.5">12,450 DH</div>
                <div className="text-red-500 flex items-center mt-0.5">+5%</div>
              </div>
            </div>
            <div className="bg-white border rounded flex-1 p-1.5 flex flex-col">
              <div className="font-semibold text-gray-700 mb-1">Évolution des ventes</div>
              <div className="flex-1 flex items-end justify-between px-2 gap-1 pt-2">
                <div className="w-full bg-indigo-100 rounded-t h-1/3"></div>
                <div className="w-full bg-indigo-200 rounded-t h-2/3"></div>
                <div className="w-full bg-indigo-400 rounded-t h-full"></div>
                <div className="w-full bg-indigo-300 rounded-t h-4/5"></div>
                <div className="w-full bg-indigo-500 rounded-t h-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-semibold border border-gray-200 shadow-inner">Capture d'écran</div>;
  }
}
