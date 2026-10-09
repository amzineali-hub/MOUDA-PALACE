import { parseAmount } from './revenueUtils';

// Source unique de l'ordre des catégories du menu, partagée entre l'éditeur (MenuGenerator.tsx —
// tableau de bord + tous les templates d'impression) et la page publique (PublicMenu.tsx, affichée
// sur moudapalace.com/menu/ via iframe) : avant cette extraction, chaque fichier avait sa propre
// copie de ce tableau, qui a fini par diverger (Tapas et Chicha mal placés, "Entrées" en double sur
// le site public, absent de l'éditeur) — voir aussi `sortItemsByPrice` ci-dessous, même raison.
export const MENU_CATEGORY_ORDER = [
  'Entrées marocaines', 'Entrées saveurs du monde', 'Plats marocains', 'Plats saveurs du monde',
  'Plats Principaux',
  'Desserts',
  'Tapas',
  'Boissons Fraîches', 'Boissons Chaudes', 'Jus Maison', 'Mocktails', 'Cocktails',
  'Bières', 'Vins Blancs & Rosé', 'Vins Rouges', 'Champagnes & Prosecco', 'Spiritueux', 'Digestifs',
  'Chicha',
  'Boissons'
];

// Trie les plats d'une catégorie par prix croissant — même règle partout où un menu est affiché
// (tableau de bord, 3 templates d'impression, page publique).
export function sortItemsByPrice<T extends { price?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => parseAmount(a.price) - parseAmount(b.price));
}
