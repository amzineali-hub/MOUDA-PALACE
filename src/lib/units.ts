export const INVENTORY_UNITS: { value: string; label: string }[] = [
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'G' },
  { value: 'L', label: 'L' },
  { value: 'cl', label: 'Cl' },
  { value: 'ml', label: 'Ml' },
  { value: 'pièce', label: 'Pièce' },
  { value: 'portion', label: 'Portion' },
  { value: 'boîte', label: 'Boîte' },
  { value: 'bouteille', label: 'Bouteille' },
  { value: 'sachet', label: 'Sachet' },
  { value: 'carton', label: 'Carton' },
  { value: 'botte', label: 'Botte' },
  { value: 'cannette', label: 'Cannette' },
  { value: 'bidon', label: 'Bidon' },
  { value: 'plateau', label: 'Plateau' },
  { value: 'paquet', label: 'Paquet' },
  { value: 'c.à.s', label: 'c.à.s' },
  { value: 'c.à.c', label: 'c.à.c' },
];

/**
 * Full unit list, plus the item's current unit prepended if it's an older/unlisted
 * value (e.g. a legacy "pièce(s)") — so an existing item never shows blank-selected.
 */
export function getUnitOptions(currentValue?: string | null): { value: string; label: string }[] {
  if (currentValue && !INVENTORY_UNITS.some(u => u.value === currentValue)) {
    return [{ value: currentValue, label: currentValue }, ...INVENTORY_UNITS];
  }
  return INVENTORY_UNITS;
}
