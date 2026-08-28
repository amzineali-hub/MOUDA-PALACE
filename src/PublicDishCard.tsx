import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Utensils } from 'lucide-react';

// Page publique, sans connexion — accessible via une URL du type /plat/soupe-harira, destinée
// à être partagée depuis le site WordPress (moudapalace.com). Elle ne lit QUE la collection
// `public_dish_cards` (nom, photo, portions, ingrédients — jamais coûts/marges), publiée
// volontairement par le gérant depuis Fiches Techniques. Rendue en dehors de AuthContext/
// ToastContext : ce composant reste volontairement autonome et minimal.
interface PublicIngredient {
  name: string;
  quantity?: string;
  unit?: string;
}

interface PublicDishCardData {
  name: string;
  portions?: number;
  imageUrl?: string;
  ingredients: PublicIngredient[];
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

  const portions = data.portions || 1;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold uppercase text-gray-900 tracking-wide pb-4 border-b-2 border-gray-800">
          {data.name}
        </h1>

        <div className="flex items-center gap-2 mt-5 mb-8 text-gray-800">
          <span className="w-9 h-9 rounded-full border-2 border-gray-800 flex items-center justify-center shrink-0">
            <Utensils size={16} />
          </span>
          <span className="font-semibold uppercase tracking-wide text-sm">
            {portions} PORTION{portions > 1 ? 'S' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {data.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[4/3]">
              <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}

          <div className="bg-[#dbe3e6] rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 underline decoration-2 underline-offset-4 mb-4">
              Ingrédients :
            </h2>
            <ul className="space-y-2 text-gray-800 text-sm">
              {data.ingredients.map((ing, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-700 shrink-0" />
                  <span>
                    {[ing.quantity, ing.unit].filter(Boolean).join(' ')}{(ing.quantity || ing.unit) ? ' ' : ''}
                    {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10 tracking-widest uppercase">Mouda Palace · Fès</p>
      </div>
    </div>
  );
}
