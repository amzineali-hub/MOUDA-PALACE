// Point unique de vérité pour agréger des montants datés (encaissements, dépenses) par période.
// Auparavant Accounting.tsx et TableauDeBord.tsx recalculaient chacun leur propre agrégation de
// cash_receipts avec des logiques de parsing/regroupement légèrement différentes (l'une gérait les
// montants stockés en chaîne de caractères, l'autre non) — risque de divergence silencieuse.

const MONTH_LABELS_FR = ['Janv', 'Fév', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

export interface DatedAmount {
  amount?: unknown;
  date?: string;
  createdAt?: { toDate?: () => Date } | null;
}

export function parseAmount(val: unknown): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[^0-9.-]+/g, '')) || 0;
}

export function resolveEntryDate(entry: DatedAmount): Date {
  return entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date(entry.date || Date.now());
}

export interface MonthlyTotal {
  name: string;
  total: number;
  sortKey: number;
}

/** Regroupe des montants datés par mois, sur une fenêtre glissante de `monthsBack` mois (mois en cours inclus). */
export function groupAmountsByMonth(entries: DatedAmount[], monthsBack = 6): MonthlyTotal[] {
  const data: Record<string, MonthlyTotal> = {};
  const now = new Date();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const past = new Date(now.getFullYear(), now.getMonth() - i, 1);
    data[`${past.getFullYear()}-${past.getMonth()}`] = { name: MONTH_LABELS_FR[past.getMonth()], total: 0, sortKey: past.getTime() };
  }
  entries.forEach(entry => {
    const d = resolveEntryDate(entry);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (data[key]) data[key].total += parseAmount(entry.amount);
  });
  return Object.values(data).sort((a, b) => a.sortKey - b.sortKey);
}

export interface DailyTotal {
  date: string;
  total: number;
}

/** Regroupe des montants datés par jour, à partir du champ `date` (chaîne d'affichage). */
export function groupAmountsByDay(entries: DatedAmount[]): DailyTotal[] {
  const totals: Record<string, number> = {};
  entries.forEach(entry => {
    const key = entry.date || 'Inconnu';
    totals[key] = (totals[key] || 0) + parseAmount(entry.amount);
  });
  return Object.entries(totals)
    .sort(([a], [b]) => {
      const dateA = new Date(a).getTime();
      const dateB = new Date(b).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
      return a.localeCompare(b);
    })
    .map(([date, total]) => ({ date, total }));
}

/** Somme les montants datés dont la date tombe dans le mois/année donnés. */
export function sumAmountsInMonth(entries: DatedAmount[], month: number, year: number): number {
  return entries.reduce((sum, entry) => {
    const d = resolveEntryDate(entry);
    if (d.getMonth() === month && d.getFullYear() === year) return sum + parseAmount(entry.amount);
    return sum;
  }, 0);
}
