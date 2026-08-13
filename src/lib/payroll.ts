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
const FRAIS_PRO_RATE = 0.2;
const FRAIS_PRO_CEILING = 2500;

export function computePayroll(baseSalary: number): PayrollBreakdown {
  const cnss = Math.min(baseSalary, CNSS_CEILING) * CNSS_RATE;
  const amo = baseSalary * AMO_RATE;
  const fraisPro = Math.min(baseSalary * FRAIS_PRO_RATE, FRAIS_PRO_CEILING);
  const sni = baseSalary - cnss - amo - fraisPro;

  // Barème IGR marocain (simplifié, mensuel)
  let igr = 0;
  if (sni > 2500 && sni <= 4166) igr = sni * 0.1 - 250;
  else if (sni > 4166 && sni <= 5000) igr = sni * 0.2 - 666.67;
  else if (sni > 5000 && sni <= 6666) igr = sni * 0.3 - 1166.67;
  else if (sni > 6666 && sni <= 15000) igr = sni * 0.34 - 1433.33;
  else if (sni > 15000) igr = sni * 0.38 - 2033.33;
  igr = Math.max(0, igr);

  const netSalary = baseSalary - cnss - amo - igr;

  return { baseSalary, cnss, amo, fraisPro, sni, igr, netSalary };
}
