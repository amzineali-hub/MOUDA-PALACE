// Recalcule la note d'un fournisseur (échelle 0-5) à partir de la qualité constatée lors d'une
// livraison, plutôt que de la laisser figée à sa valeur de création. Moyenne pondérée avec la note
// précédente pour qu'une seule mauvaise livraison ne fasse pas basculer brutalement la note, tout en
// laissant la tendance réelle se dégager au fil des réceptions.
const PREVIOUS_RATING_WEIGHT = 0.7;
const DELIVERY_WEIGHT = 0.3;
const DEFAULT_RATING = 5;

export interface ReceivedItemQuality {
  qualityOk?: boolean;
}

export function computeDeliveryQualityScore(itemsReceived: ReceivedItemQuality[]): number | null {
  if (itemsReceived.length === 0) return null;
  const okCount = itemsReceived.filter(item => item.qualityOk !== false).length;
  const qualityRatio = okCount / itemsReceived.length;
  return qualityRatio * 5;
}

export function computeUpdatedSupplierRating(previousRating: number | undefined | null, itemsReceived: ReceivedItemQuality[]): number {
  const deliveryScore = computeDeliveryQualityScore(itemsReceived);
  if (deliveryScore === null) return Number(previousRating) || DEFAULT_RATING;
  const base = Number(previousRating) || DEFAULT_RATING;
  return Math.round(((base * PREVIOUS_RATING_WEIGHT) + (deliveryScore * DELIVERY_WEIGHT)) * 10) / 10;
}
