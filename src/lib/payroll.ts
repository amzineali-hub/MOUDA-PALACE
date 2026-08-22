// Calcul de la paie selon le Code du Travail marocain (simplifié) — extrait de PayrollModal
// (src/RH.tsx) pour être testable indépendamment du composant React.

export interface PayrollBreakdown {
  baseSalary: number;
  cnss: number;
  amo: number;
  fraisPro: number;
  sni: number; // Salaire Net Imposable
  igr: number;
  netSalary: number;
}

const CNSS_RATE = 0.0448; // Salariale, plafonnée à 6000 MAD
const CNSS_CEILING = 6000;
const AMO_RATE = 0.0226; // Salariale, sans plafond
const FRAIS_PRO_RATE = 0.25;
const FRAIS_PRO_CEILING = 2916.66;
// 5 MAD/mois par personne à charge, plafonné à 6 personnes (30 MAD/mois max).
const CHARGE_FAMILLE_PAR_PERSONNE = 5;
const CHARGE_FAMILLE_MAX_PERSONNES = 6;

export function computePayroll(baseSalary: number, personnesACharge = 0): PayrollBreakdown {
  const cnss = Math.min(baseSalary, CNSS_CEILING) * CNSS_RATE;
  const amo = baseSalary * AMO_RATE;
  const fraisPro = Math.min(baseSalary * FRAIS_PRO_RATE, FRAIS_PRO_CEILING);
  const sni = baseSalary - cnss - amo - fraisPro;

  // Barème IGR marocain (mensuel), réforme LF2023 — tranches en vigueur en 2026.
  let igr = 0;
  if (sni > 3333 && sni <= 5000) igr = sni * 0.1 - 333.33;
  else if (sni > 5000 && sni <= 6667) igr = sni * 0.2 - 833.33;
  else if (sni > 6667 && sni <= 8333) igr = sni * 0.3 - 1500;
  else if (sni > 8333 && sni <= 15000) igr = sni * 0.34 - 1833.33;
  else if (sni > 15000) igr = sni * 0.37 - 2283.33;

  const chargeFamille = Math.min(Math.max(personnesACharge, 0), CHARGE_FAMILLE_MAX_PERSONNES) * CHARGE_FAMILLE_PAR_PERSONNE;
  igr = Math.max(0, igr - chargeFamille);

  const netSalary = baseSalary - cnss - amo - igr;

  return { baseSalary, cnss, amo, fraisPro, sni, igr, netSalary };
}

// Base horaire mensuelle utilisée ailleurs sur le bulletin de paie (191h ≈ 44h/semaine).
export const MONTHLY_HOURS_BASIS = 191;
// Base "jours ouvrés" mensuelle standard pour une retenue journalière (convention courante).
export const MONTHLY_WORKING_DAYS_BASIS = 26;

export interface AbsenceRecord {
  hours?: number; // absence partielle (quelques heures) — sinon journée complète
}

/**
 * Calcule la retenue au prorata temporis pour une liste d'absences : au taux horaire
 * (base / 191h) pour une absence partielle avec des heures renseignées, au taux
 * journalier (base / 26j) pour une journée complète sans heures renseignées.
 */
export function computeAbsenceDeduction(baseSalary: number, absences: AbsenceRecord[]): number {
  const dailyRate = baseSalary / MONTHLY_WORKING_DAYS_BASIS;
  const hourlyRate = baseSalary / MONTHLY_HOURS_BASIS;
  return absences.reduce((sum, a) => sum + ((a.hours && a.hours > 0) ? hourlyRate * a.hours : dailyRate), 0);
}
