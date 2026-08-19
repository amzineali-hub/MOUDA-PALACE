export interface PosCartLine {
  name?: string;
  numPrice?: number;
  price?: string | number;
  qty?: number;
}

export function parsePosPrice(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value ?? '')
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getLineQuantity(line: PosCartLine): number {
  const quantity = Number(line.qty);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

export function getLineUnitPrice(line: PosCartLine): number {
  return parsePosPrice(line.numPrice ?? line.price);
}

export function getLineTotal(line: PosCartLine): number {
  return getLineUnitPrice(line) * getLineQuantity(line);
}

export function calculatePosSubtotal(lines: PosCartLine[]): number {
  return lines.reduce((sum, line) => sum + getLineTotal(line), 0);
}

export function createPosOrderId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `CMD-${uuid}`;
  return `CMD-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
