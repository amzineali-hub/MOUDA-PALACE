export function isCriticalStock(quantity: number, criticalThreshold: number): boolean {
  return quantity < criticalThreshold;
}

export function calculateStockStatus(quantity: number, minStock: number): 'ok' | 'alert' | 'critical' {
  if (quantity <= minStock / 2) return 'critical';
  if (quantity < minStock) return 'alert';
  return 'ok';
}
