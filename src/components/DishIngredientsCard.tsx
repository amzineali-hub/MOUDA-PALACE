import React from 'react';
import { Utensils } from 'lucide-react';

// Contenu visuel "Ingrédients de la portion" — nom, portions, photo, liste d'ingrédients en
// texte libre (ex: "1 tomate moyenne, mixée ou râpée"), au format de la brochure imprimée —
// jamais les quantités normalisées de la fiche technique (coûts/stock, ex: "0.2 kg Tomates").
// Réutilisé par la page publique (PublicDishCard) ET par l'aperçu interne rapide depuis Menus
// digitaux / Flipbook, pour que les deux affichent exactement la même chose.
export default function DishIngredientsCard({
  name,
  portions,
  imageUrl,
  ingredients
}: {
  name: string;
  portions?: number;
  imageUrl?: string | null;
  ingredients: string[];
}) {
  const portionCount = portions || 1;

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-serif font-bold uppercase text-gray-900 tracking-wide pb-4 border-b-2 border-gray-800">
        {name}
      </h1>

      <div className="flex items-center gap-2 mt-5 mb-8 text-gray-800">
        <span className="w-9 h-9 rounded-full border-2 border-gray-800 flex items-center justify-center shrink-0">
          <Utensils size={16} />
        </span>
        <span className="font-semibold uppercase tracking-wide text-sm">
          {portionCount} PORTION{portionCount > 1 ? 'S' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {imageUrl && (
          <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[4/3]">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}

        <div className="bg-[#dbe3e6] rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 underline decoration-2 underline-offset-4 mb-4">
            Ingrédients :
          </h2>
          {ingredients.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun ingrédient renseigné.</p>
          ) : (
            <ul className="space-y-2 text-gray-800 text-sm">
              {ingredients.map((line, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-700 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
