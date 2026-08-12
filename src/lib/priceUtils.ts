// Point unique de vérité pour lire le prix unitaire connu d'un article de stock.
// Les documents inventoryItems (et assimilés) utilisent des noms de champ différents
// selon qui les a écrits (averageCost, unitPrice, price, cost) — ce repli complet
// évite qu'un prix existant reste invisible parce qu'un écran ne lisait qu'un seul champ.

export interface PricedItem {
  averageCost?: number | string;
  unitPrice?: number | string;
  price?: number | string;
  cost?: number | string;
}

export function resolveItemPrice(item?: PricedItem | null): number {
  if (!item) return 0;
  const raw = item.averageCost || item.unitPrice || item.price || item.cost;
  return Number(raw) || 0;
}
