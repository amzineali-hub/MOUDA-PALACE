import React, { useEffect, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { MENU_CATEGORY_ORDER, sortItemsByPrice } from './lib/menuOrder';

// Page publique, sans connexion — /carte, destinée à être intégrée (lien ou <iframe>) depuis le
// site WordPress (moudapalace.com/menu/), qui est construit avec Elementor : plutôt que de pousser
// du contenu vers WordPress (risque de casser la mise en page Elementor, qui stocke son propre
// contenu structuré indépendamment du champ `content` standard), cette page affiche en direct le
// menu déjà géré dans l'ERP (Générateur de Menu) — toujours à jour, aucune synchronisation manuelle
// à refaire après un changement de menu. Rendue en dehors de AuthContext/ToastContext, comme
// PublicDishCard : lecture seule, aucune donnée de coût/marge (menu_items ne contient que ce qui
// est déjà public dans l'appli : nom, catégorie, prix de vente, description, photo).
// L'ordre des catégories vient de src/lib/menuOrder.ts, partagé avec MenuGenerator.tsx — ne plus en
// garder une copie locale ici, c'est exactement ce qui avait fait diverger les deux affichages.
const CATEGORY_ORDER = MENU_CATEGORY_ORDER;

interface MenuItemData {
  id: string;
  name: string;
  category: string;
  price: string;
  desc?: string;
  imageUrl?: string;
}

export default function PublicMenu() {
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  // Plein écran au clic sur une photo — surtout utile en version PC, où les vignettes de la grille
  // restent petites comparé au mobile (une seule colonne, déjà plus grande naturellement).
  const [lightboxItem, setLightboxItem] = useState<MenuItemData | null>(null);

  useEffect(() => {
    if (!lightboxItem) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxItem(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxItem]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'menu_items'));
        if (cancelled) return;
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItemData)));
        setStatus('ready');
      } catch (err) {
        console.error('Erreur de chargement du menu public', err);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-gray-400">
        Chargement du menu...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-gray-500 gap-2 p-6 text-center">
        <p className="text-lg font-serif">Le menu n'est pas disponible pour le moment.</p>
        <a href="https://www.moudapalace.com" className="text-[#265C6D] underline text-sm">Retour à moudapalace.com</a>
      </div>
    );
  }

  const categoriesPresent = CATEGORY_ORDER.filter(cat => items.some(i => i.category === cat));
  // Filet de sécurité : une catégorie future absente de CATEGORY_ORDER (nouvelle catégorie ajoutée
  // dans le Générateur de Menu sans mise à jour de cette liste) s'affiche quand même, en fin de page,
  // plutôt que de disparaître silencieusement du menu public.
  const knownCategories = new Set(CATEGORY_ORDER);
  const extraCategories = [...new Set(items.map(i => i.category).filter(c => c && !knownCategories.has(c)))];
  const orderedCategories = [...categoriesPresent, ...extraCategories];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <header className="bg-[#265C6D] text-white py-12 px-6 text-center">
        <div
          className="mx-auto h-16 w-20 bg-[#F4C75B] mb-4"
          style={{
            maskImage: 'url(/mouda-1-1-1.png)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
            WebkitMaskImage: 'url(/mouda-1-1-1.png)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'
          }}
        />
        <h1 className="text-3xl md:text-4xl font-serif tracking-wide">MOUDA PALACE</h1>
        <p className="text-[#F4C75B] tracking-[0.2em] uppercase text-xs mt-2">Restaurant · Lounge · Rooftop</p>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-12">
        {orderedCategories.length === 0 ? (
          <p className="text-center text-gray-400">Le menu est en cours de préparation.</p>
        ) : (
          orderedCategories.map(category => (
            <section key={category}>
              <h2 className="text-2xl font-serif text-[#265C6D] font-semibold border-b border-[#F4C75B]/40 pb-2 mb-6">
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortItemsByPrice(items.filter(i => i.category === category)).map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    {item.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setLightboxItem(item)}
                        className="h-40 bg-gray-100 relative group w-full cursor-zoom-in"
                        aria-label={`Agrandir la photo de ${item.name}`}
                      >
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" referrerPolicy="no-referrer" />
                        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                        </span>
                      </button>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-serif font-semibold text-gray-900 leading-tight">{item.name}</h3>
                      {item.desc && <p className="text-sm text-gray-500 mt-1 flex-1">{item.desc}</p>}
                      <p className="text-[#F4C75B] font-bold mt-2">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 tracking-widest uppercase py-10">
        Mouda Palace · Fès
      </footer>

      {lightboxItem && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 md:p-10"
          onClick={() => setLightboxItem(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxItem(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
          <figure className="max-w-5xl max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxItem.imageUrl}
              alt={lightboxItem.name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <figcaption className="text-white text-center mt-4">
              <p className="font-serif text-lg">{lightboxItem.name}</p>
              <p className="text-[#F4C75B] font-bold">{lightboxItem.price}</p>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
