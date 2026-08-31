// Agrégation par poste de caisse (station) des sessions `pos_shifts` d'une journée, pour le
// détail affiché dans le Rapport X une fois qu'il y a plusieurs caisses physiques (Patio,
// Rooftop...). Le Rapport X lui-même continue d'agréger toute la journée sans filtrer par
// station — cette fonction ne fait qu'ajouter un sous-détail à côté du total déjà calculé.

export const STATIONS = ['Patio', 'Rooftop'] as const;

export interface PosShiftLike {
  station?: string;
  cashSales?: number | string;
  cardSales?: number | string;
  totalSales?: number | string;
  paymentCount?: number | string;
}

export interface StationBreakdown {
  station: string;
  shiftsCount: number;
  cashSales: number;
  cardSales: number;
  totalSales: number;
  paymentCount: number;
}

export function computeStationBreakdown(shiftsToday: PosShiftLike[]): StationBreakdown[] {
  const num = (v: unknown) => Number(v) || 0;
  return STATIONS.map(name => {
    const shifts = shiftsToday.filter(sh => sh.station === name);
    return {
      station: name,
      shiftsCount: shifts.length,
      cashSales: shifts.reduce((s, sh) => s + num(sh.cashSales), 0),
      cardSales: shifts.reduce((s, sh) => s + num(sh.cardSales), 0),
      totalSales: shifts.reduce((s, sh) => s + num(sh.totalSales), 0),
      paymentCount: shifts.reduce((s, sh) => s + num(sh.paymentCount), 0),
    };
  }).filter(row => row.shiftsCount > 0);
}
