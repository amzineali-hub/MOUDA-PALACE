import { db } from '../firebase';
import { runTransaction, doc, collection, serverTimestamp } from 'firebase/firestore';

export const processUnifiedProduction = async (
  itemName: string,
  quantity: number,
  source: 'POS' | 'ProductionJournaliere',
  fichesTechniques: any[],
  inventoryItems: any[],
  chefResponsable: string = 'Système',
  method: string = 'Envoi Cuisine'
) => {
  return await runTransaction(db, async (transaction) => {
    // 1. Find the fiche technique
    const recipe = fichesTechniques.find(r => (r.nom || r.name || '').toLowerCase() === itemName.toLowerCase());
    
    // 2. Decrement inventory based on recipe ingredients OR direct item
    let ingredientsUpdates: any[] = [];
    if (recipe && recipe.ingredients && Array.isArray(recipe.ingredients)) {
      for (const ing of recipe.ingredients) {
        const inventoryItem = inventoryItems.find(i => (i.name || '').toLowerCase() === (ing.nom || ing.name || '').toLowerCase());
        if (inventoryItem) {
          const baseQty = parseFloat(ing.quantite) || 0;
          const recipePortions = parseFloat(recipe.portions) || 1;
          let neededQty = (baseQty / recipePortions) * quantity;
          
          const ingUnit = (ing.unite || '').toLowerCase();
          const invUnit = (inventoryItem.unit || '').toLowerCase();
          
          if (ingUnit === 'g' && invUnit === 'kg') neededQty = neededQty / 1000;
          else if (ingUnit === 'kg' && invUnit === 'g') neededQty = neededQty * 1000;
          else if (ingUnit === 'ml' && (invUnit === 'l' || invUnit === 'litre')) neededQty = neededQty / 1000;
          else if ((ingUnit === 'l' || ingUnit === 'litre') && invUnit === 'ml') neededQty = neededQty * 1000;
          
          const invRef = doc(db, 'inventoryItems', inventoryItem.id);
          const currentQty = parseFloat(inventoryItem.quantity) || 0;
          
          ingredientsUpdates.push({
            ref: invRef,
            newQty: Math.max(0, currentQty - neededQty),
            itemInfo: { name: inventoryItem.name, unit: inventoryItem.unit, qtyToDeduct: neededQty }
          });
        }
      }
    } else {
      // Direct deduction if no recipe
      const inventoryItem = inventoryItems.find(i => (i.name || '').toLowerCase() === itemName.toLowerCase());
      if (inventoryItem) {
        const invRef = doc(db, 'inventoryItems', inventoryItem.id);
        const currentQty = parseFloat(inventoryItem.quantity) || 0;
        ingredientsUpdates.push({
          ref: invRef,
          newQty: Math.max(0, currentQty - quantity),
          itemInfo: { name: inventoryItem.name, unit: inventoryItem.unit, qtyToDeduct: quantity }
        });
      }
    }
    
    for (const update of ingredientsUpdates) {
      transaction.update(update.ref, { quantity: update.newQty });
      
      const txRef = doc(collection(db, 'inventoryTransactions'));
      transaction.set(txRef, {
        item: update.itemInfo.name,
        type: 'out',
        amount: update.itemInfo.qtyToDeduct,
        unit: update.itemInfo.unit || 'pièce',
        reason: `Production (${source}): ${itemName}`,
        user: chefResponsable,
        date: new Date().toLocaleDateString('fr-FR'),
        createdAt: serverTimestamp()
      });
    }
    
    // 3. Create the production task / order
    if (source === 'POS') {
      const orderId = 'CMD-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const taskRef = doc(collection(db, 'productionTasks'));
      transaction.set(taskRef, {
        orderId,
        item: itemName,
        qty: quantity,
        status: 'À faire',
        progress: 0,
        createdAt: serverTimestamp(),
        source: 'POS',
        priority: 'Haute'
      });
      return { orderId };
    } else if (source === 'ProductionJournaliere') {
      const prodRef = doc(collection(db, 'productionOrders'));
      transaction.set(prodRef, {
        recipeId: recipe ? recipe.id : null,
        recipeName: itemName,
        quantiteProduite: quantity,
        chefResponsable,
        status: 'completed',
        coutMatiereEstime: recipe ? (recipe.coutMatiere * quantity) : 0,
        timestamp: serverTimestamp()
      });
      
      
      // Credit inventory with produced item (semi-finished or finished)
      const producedItem = inventoryItems.find(i => (i.name || '').toLowerCase() === itemName.toLowerCase());
      if (producedItem) {
         transaction.update(doc(db, 'inventoryItems', producedItem.id), {
           quantity: (parseFloat(producedItem.quantity) || 0) + quantity
         });
      }
      return { success: true };
    }
  });
};
