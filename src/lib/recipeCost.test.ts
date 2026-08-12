import { describe, it, expect } from 'vitest';
import { convertQuantity, matchInventoryItem, computeIngredientCost, computeRecipeCost } from './recipeCost';

describe('recipeCost - convertQuantity', () => {
  it('converts weight units (g <-> kg)', () => {
    expect(convertQuantity(250, 'g', 'kg')).toBe(0.25);
    expect(convertQuantity(0.25, 'kg', 'g')).toBe(250);
  });

  it('converts volume units (ml <-> L, cl)', () => {
    expect(convertQuantity(500, 'ml', 'L')).toBe(0.5);
    expect(convertQuantity(1, 'L', 'ml')).toBe(1000);
    expect(convertQuantity(50, 'cl', 'ml')).toBe(500);
  });

  it('returns the same quantity when units already match', () => {
    expect(convertQuantity(3, 'pièce', 'pièce')).toBe(3);
  });

  it('returns null for incompatible unit categories', () => {
    expect(convertQuantity(2, 'pièce', 'kg')).toBeNull();
    expect(convertQuantity(2, 'g', 'ml')).toBeNull();
  });
});

describe('recipeCost - matchInventoryItem', () => {
  const inventory = [{ name: 'Pommes de Terre', unit: 'kg', averageCost: 6 }];

  it('matches case-insensitively', () => {
    expect(matchInventoryItem('pommes de terre', inventory)).toBe(inventory[0]);
  });

  it('matches ignoring accents', () => {
    expect(matchInventoryItem('Pommes de Terrè', inventory)).toBe(inventory[0]);
  });

  it('returns undefined when nothing matches', () => {
    expect(matchInventoryItem('Poulet', inventory)).toBeUndefined();
  });
});

describe('recipeCost - computeIngredientCost', () => {
  const inventory = [{ name: 'Pommes de Terre', unit: 'kg', averageCost: 6 }];

  it('uses live stock price when matched', () => {
    const result = computeIngredientCost(
      { nom: 'Pommes de Terre', quantite: 150, unite: 'g' },
      inventory
    );
    expect(result.matched).toBe(true);
    expect(result.priceSource).toBe('stock');
    expect(result.cost).toBeCloseTo(0.9); // 0.15kg * 6 DH/kg
  });

  it('falls back to manual price when unmatched, and flags it', () => {
    const result = computeIngredientCost(
      { nom: 'Poulet', quantite: 250, unite: 'g', prixUnitaire: 10, unitePrix: 'kg' },
      inventory
    );
    expect(result.matched).toBe(false);
    expect(result.priceSource).toBe('manuel');
    expect(result.cost).toBeCloseTo(2.5); // 0.25kg * 10 DH/kg
  });

  it('flags unitIssue instead of silently multiplying incompatible units', () => {
    const result = computeIngredientCost(
      { nom: 'Citron confit', quantite: 2, unite: 'pièce', prixUnitaire: 5, unitePrix: 'kg' },
      inventory
    );
    expect(result.unitIssue).toBe(true);
    expect(result.cost).toBeCloseTo(10); // naive qty * price fallback, but flagged
  });

  it('returns 0 cost when quantity or price is missing', () => {
    const result = computeIngredientCost({ nom: 'Sel', quantite: 0, unite: 'g' }, inventory);
    expect(result.cost).toBe(0);
  });
});

describe('recipeCost - computeRecipeCost', () => {
  const inventory = [{ name: 'Pommes de Terre', unit: 'kg', averageCost: 6 }];

  it('aggregates total cost, food cost % and margin', () => {
    const recipe = {
      prixVente: 100,
      ingredients: [
        { nom: 'Pommes de Terre', quantite: 500, unite: 'g' }, // 0.5kg * 6 = 3
        { nom: 'Poulet', quantite: 1, unite: 'kg', prixUnitaire: 27, unitePrix: 'kg' } // 27
      ]
    };
    const result = computeRecipeCost(recipe, inventory);
    expect(result.totalCost).toBeCloseTo(30);
    expect(result.foodCostPct).toBeCloseTo(30);
    expect(result.margin).toBeCloseTo(70);
  });

  it('warns about unmatched ingredients', () => {
    const recipe = {
      prixVente: 100,
      ingredients: [{ nom: 'Poulet', quantite: 1, unite: 'kg', prixUnitaire: 30, unitePrix: 'kg' }]
    };
    const result = computeRecipeCost(recipe, inventory);
    expect(result.warnings.some(w => w.type === 'unmatched_ingredient')).toBe(true);
  });

  it('warns when food cost is abnormally low (reproduces the reported Tajine bug)', () => {
    const recipe = {
      prixVente: 170,
      ingredients: [
        { nom: 'Poulet', quantite: 250, unite: 'g', prixUnitaire: 10, unitePrix: 'kg' },
        { nom: 'Citron confit', quantite: 20, unite: 'g', prixUnitaire: 10, unitePrix: 'kg' }
      ]
    };
    const result = computeRecipeCost(recipe, inventory);
    expect(result.foodCostPct).toBeLessThan(10);
    expect(result.warnings.some(w => w.type === 'food_cost_abnormal_low')).toBe(true);
    expect(result.warnings.some(w => w.type === 'unmatched_ingredient')).toBe(true);
  });

  it('warns when food cost is abnormally high', () => {
    const recipe = {
      prixVente: 10,
      ingredients: [{ nom: 'Pommes de Terre', quantite: 2, unite: 'kg' }] // 12 DH cost on a 10 DH plate
    };
    const result = computeRecipeCost(recipe, inventory);
    expect(result.warnings.some(w => w.type === 'food_cost_abnormal_high')).toBe(true);
  });

  it('falls back to the stored coutMatiere when there are no ingredients', () => {
    const result = computeRecipeCost({ prixVente: 50, coutMatiere: 12 }, inventory);
    expect(result.totalCost).toBe(12);
    expect(result.warnings).toHaveLength(0);
  });
});
