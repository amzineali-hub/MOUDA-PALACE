export type StockStatus = 'ok' | 'alert' | 'critical';

/**
 * Calcule le statut du stock en fonction de la quantité actuelle et du seuil minimal.
 * - 'critical': La quantité est à 0 ou en dessous de 25% du seuil minimal.
 * - 'alert': La quantité est inférieure ou égale au seuil minimal.
 * - 'ok': La quantité est supérieure au seuil minimal.
 */
export function calculateStockStatus(quantity: number, minStock: number): StockStatus {
  if (quantity <= minStock * 0.5 || quantity <= 0) {
    return 'critical';
  }
  if (quantity <= minStock) {
    return 'alert';
  }
  return 'ok';
}
