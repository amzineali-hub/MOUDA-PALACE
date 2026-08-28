import React from 'react';
import { X, ChefHat } from 'lucide-react';
import DishIngredientsCard, { DishIngredient } from './DishIngredientsCard';

// Aperçu rapide "Ingrédients de la portion" depuis Menus digitaux / Flipbook — même visuel que
// la fiche publique WordPress. Ne remplace pas la fiche technique interne (coûts/marges) : un
// lien secondaire optionnel ("Gérer la fiche technique") y renvoie pour le staff qui en a besoin.
export default function DishIngredientsModal({
  name,
  portions,
  imageUrl,
  ingredients,
  onClose,
  onManage
}: {
  name: string;
  portions?: number;
  imageUrl?: string | null;
  ingredients: DishIngredient[];
  onClose: () => void;
  onManage?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors">
          <X size={20} />
        </button>

        <DishIngredientsCard name={name} portions={portions} imageUrl={imageUrl} ingredients={ingredients} />

        {onManage && (
          <button
            type="button"
            onClick={onManage}
            className="mt-6 flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-[#265C6D] transition-colors"
          >
            <ChefHat size={14} /> Gérer la fiche technique (coûts &amp; marges, interne)
          </button>
        )}
      </div>
    </div>
  );
}
