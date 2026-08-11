export const TVA_RATES = [20, 10, 0] as const;

export const computeTTC = (ht: number, tva: number) => ht + (ht * tva) / 100;
