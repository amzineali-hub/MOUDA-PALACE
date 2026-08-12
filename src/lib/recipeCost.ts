// Module de calcul unique du coût matière / Food Cost, partagé par toutes les vues
// (Fiches Techniques, Tableau de Bord, POS, Production) pour éviter les 4 implémentations
// dupliquées et incohérentes qui existaient auparavant.

export interface Ingredient {
  nom?: string;
  name?: string;
  quantite: number | string;
  unite: string;
  prixUnitaire?: number | string;
  unitePrix?: string;
}

export interface InventoryItemLike {
  id?: string;
  name?: string;
  unit?: string;
  averageCost?: number | string;
  price?: number | string;
  cost?: number | string;
}

export type PriceSource = 'stock' | 'manuel';

export interface IngredientCostResult {
  cost: number;
  matched: boolean;
  priceSource: PriceSource;
  unitIssue: boolean;
  matchedItem?: InventoryItemLike;
  unitPrice: number;
  unitPriceUnit: string;
}

export type RecipeWarningType =
  | 'unmatched_ingredient'
  | 'unit_incompatible'
  | 'food_cost_abnormal_low'
  | 'food_cost_abnormal_high';

export interface RecipeCostWarning {
  type: RecipeWarningType;
  message: string;
}

export interface RecipeCostResult {
  totalCost: number;
  foodCostPct: number;
  margin: number;
  ingredientResults: (IngredientCostResult & { ingredient: Ingredient })[];
  warnings: RecipeCostWarning[];
}

const WEIGHT_UNITS_TO_G: Record<string, number> = { g: 1, kg: 1000 };
const VOLUME_UNITS_TO_ML: Record<string, number> = { ml: 1, cl: 10, l: 1000, litre: 1000 };

export function normalizeUnit(unit?: string): string {
  return (unit || '').trim().toLowerCase();
}

/**
 * Convertit une quantité entre deux unités. Retourne `null` (au lieu de deviner)
 * quand les deux unités appartiennent à des catégories incompatibles (ex: "pièce" vs "kg").
 */
export function convertQuantity(qty: number, fromUnit?: string, toUnit?: string): number | null {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (!from || !to || from === to) return qty;
  if (from in WEIGHT_UNITS_TO_G && to in WEIGHT_UNITS_TO_G) {
    return (qty * WEIGHT_UNITS_TO_G[from]) / WEIGHT_UNITS_TO_G[to];
  }
  if (from in VOLUME_UNITS_TO_ML && to in VOLUME_UNITS_TO_ML) {
    return (qty * VOLUME_UNITS_TO_ML[from]) / VOLUME_UNITS_TO_ML[to];
  }
  return null;
}

export function normalizeName(name?: string): string {
  return (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function matchInventoryItem<T extends InventoryItemLike>(
  name: string | undefined,
  inventoryItems: T[]
): T | undefined {
  const target = normalizeName(name);
  if (!target) return undefined;
  return inventoryItems.find(i => normalizeName(i.name) === target);
}

/**
 * Calcule le coût d'un ingrédient. Priorité au prix du stock si l'ingrédient est
 * rattaché (correspondance de nom) et qu'un prix y est renseigné ; repli sur le
 * prix manuel saisi sur la fiche sinon — mais toujours en le signalant via `matched`/`priceSource`.
 */
export function computeIngredientCost(
  ingredient: Ingredient,
  inventoryItems: InventoryItemLike[]
): IngredientCostResult {
  const name = ingredient.nom || ingredient.name;
  const matchedItem = matchInventoryItem(name, inventoryItems);
  const qty = Number(ingredient.quantite) || 0;

  let unitPrice: number;
  let unitPriceUnit: string;
  let priceSource: PriceSource;
  let matched = false;

  const stockPrice = matchedItem
    ? Number(matchedItem.averageCost ?? matchedItem.price ?? matchedItem.cost)
    : NaN;

  if (matchedItem && stockPrice > 0) {
    unitPrice = stockPrice;
    unitPriceUnit = matchedItem.unit || ingredient.unitePrix || ingredient.unite;
    priceSource = 'stock';
    matched = true;
  } else {
    unitPrice = Number(ingredient.prixUnitaire) || 0;
    unitPriceUnit = ingredient.unitePrix || ingredient.unite;
    priceSource = 'manuel';
  }

  if (!qty || !unitPrice) {
    return { cost: 0, matched, priceSource, unitIssue: false, matchedItem, unitPrice, unitPriceUnit };
  }

  const convertedQty = convertQuantity(qty, ingredient.unite, unitPriceUnit);
  if (convertedQty === null) {
    // Unités incompatibles : on garde une quantité non convertie (comportement historique)
    // mais on le signale explicitement plutôt que de le cacher.
    return { cost: qty * unitPrice, matched, priceSource, unitIssue: true, matchedItem, unitPrice, unitPriceUnit };
  }

  return { cost: convertedQty * unitPrice, matched, priceSource, unitIssue: false, matchedItem, unitPrice, unitPriceUnit };
}

/**
 * Calcule le coût matière total, le Food Cost % et la marge brute d'une fiche technique,
 * avec des avertissements explicites quand la donnée n'est pas fiable.
 */
export function computeRecipeCost(
  recipe: { ingredients?: Ingredient[]; coutMatiere?: number | string; prixVente?: number | string },
  inventoryItems: InventoryItemLike[]
): RecipeCostResult {
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const ingredientResults = ingredients.map(ingredient => ({
    ingredient,
    ...computeIngredientCost(ingredient, inventoryItems)
  }));

  const totalCost = ingredients.length > 0
    ? ingredientResults.reduce((sum, r) => sum + r.cost, 0)
    : Number(recipe.coutMatiere) || 0;

  const pv = Number(recipe.prixVente) || 0;
  const foodCostPct = pv > 0 ? (totalCost / pv) * 100 : 0;
  const margin = pv > 0 ? pv - totalCost : 0;

  const warnings: RecipeCostWarning[] = [];
  const unmatchedCount = ingredientResults.filter(r => !r.matched).length;
  const unitIssueCount = ingredientResults.filter(r => r.unitIssue).length;

  if (unmatchedCount > 0) {
    warnings.push({
      type: 'unmatched_ingredient',
      message: `${unmatchedCount} ingrédient(s) non rattaché(s) au stock — prix non garanti à jour.`
    });
  }
  if (unitIssueCount > 0) {
    warnings.push({
      type: 'unit_incompatible',
      message: `${unitIssueCount} ingrédient(s) avec une unité incompatible entre la recette et le stock — coût potentiellement inexact.`
    });
  }
  if (pv > 0 && ingredients.length > 0) {
    if (foodCostPct < 10) {
      warnings.push({
        type: 'food_cost_abnormal_low',
        message: 'Ce taux semble anormalement bas — vérifiez la liste d\'ingrédients et les quantités.'
      });
    } else if (foodCostPct > 60) {
      warnings.push({
        type: 'food_cost_abnormal_high',
        message: 'Ce taux semble anormalement élevé — vérifiez la liste d\'ingrédients et les quantités.'
      });
    }
  }

  return { totalCost, foodCostPct, margin, ingredientResults, warnings };
}
