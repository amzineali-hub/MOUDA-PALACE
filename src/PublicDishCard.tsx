import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import DishIngredientsCard from './components/DishIngredientsCard';

// Page publique, sans connexion — accessible via une URL du type /plat/soupe-harira, destinée
// à être partagée depuis le site WordPress (moudapalace.com). Elle ne lit QUE la collection
// `public_dish_cards` (nom, photo, portions, ingrédients en texte libre — jamais coûts/marges),
// publiée volontairement par le gérant depuis Fiches Techniques. Rendue en dehors de
// AuthContext/ToastContext : ce composant reste volontairement autonome et minimal.
interface PublicDishCardData {
  name: string;
  portions?: number;
  imageUrl?: string;
  ingredients: string[];
}

export default function PublicDishCard({ slug }: { slug: string }) {
  const [data, setData] = useState<PublicDishCardData | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'not-found' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'public_dish_cards', slug));
        if (cancelled) return;
        if (snap.exists()) {
          setData(snap.data() as PublicDishCardData);
          setStatus('found');
        } else {
          setStatus('not-found');
        }
      } catch (err) {
        console.error('Erreur de chargement de la fiche publique', err);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-gray-400">
        Chargement...
      </div>
    );
  }

  if (status !== 'found' || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-gray-500 gap-2 p-6 text-center">
        <p className="text-lg font-serif">Cette fiche n'est plus disponible.</p>
        <a href="https://www.moudapalace.com" className="text-[#265C6D] underline text-sm">Retour à moudapalace.com</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <DishIngredientsCard name={data.name} portions={data.portions} imageUrl={data.imageUrl} ingredients={data.ingredients} />
        <p className="text-center text-xs text-gray-400 mt-10 tracking-widest uppercase">Mouda Palace · Fès</p>
      </div>
    </div>
  );
}
