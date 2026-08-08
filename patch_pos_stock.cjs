const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const search = `      // 3. Stocks (simplified to avoid bugs)
      try {
        const inventorySnapshot = await getDocs(collection(db, 'inventoryItems'));
        const inventoryItems = inventorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
        for (const cartItem of cart) {
          if (!cartItem || !cartItem.name) continue;
          
          const matchingRecipe = recettes.find(r => (r.nom || r.name || '').toLowerCase() === cartItem.name.toLowerCase());
          
          if (matchingRecipe && matchingRecipe.ingredients && Array.isArray(matchingRecipe.ingredients)) {
            for (const ingredient of matchingRecipe.ingredients) {
              if (!ingredient || !ingredient.name) continue;
              
              let invItem = inventoryItems.find((inv: any) => (inv.name || '').toLowerCase() === ingredient.name.toLowerCase());
              const portions = matchingRecipe.portions || 1;
              const qtyToDeduct = ((ingredient.quantity || 0) / portions) * (cartItem.qty || 1);
              if (invItem && typeof invItem.quantity !== 'undefined') {
                const newQty = Math.max(0, Number(invItem.quantity) - qtyToDeduct);
                await updateDoc(doc(db, 'inventoryItems', invItem.id), { quantity: newQty, updatedAt: now });
                await addDoc(collection(db, 'inventoryTransactions'), {
                  item: invItem.name,
                  type: 'out',
                  amount: qtyToDeduct,
                  unit: invItem.unit || 'kg',
                  reason: \`Vente POS: \${cartItem.name} (\${displayId})\`,
                  user: 'POS',
                  date: today,
                  createdAt: now
                });
              }
            }
          } else {
            const matchingItem = inventoryItems.find((inv: any) => 
              (inv.name || '').toLowerCase() === cartItem.name.toLowerCase()
            );
            if (matchingItem && typeof matchingItem.quantity !== 'undefined') {
              const newQty = Math.max(0, Number(matchingItem.quantity) - (cartItem.qty || 1));
              const deductedQty = cartItem.qty || 1;
              await updateDoc(doc(db, 'inventoryItems', matchingItem.id), { quantity: newQty, updatedAt: now });
              await addDoc(collection(db, 'inventoryTransactions'), {
                item: matchingItem.name,
                type: 'out',
                amount: deductedQty,
                unit: matchingItem.unit || 'pièce',
                reason: \`Vente POS: \${cartItem.name} (\${displayId})\`,
                user: 'POS',
                date: today,
                createdAt: now
              });
            }
          }
        }`;

const replacement = `      // 3. Stocks
      try {
        const inventorySnapshot = await getDocs(collection(db, 'inventoryItems'));
        const inventoryItems = inventorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
        
        for (const cartItem of cart) {
          if (!cartItem || !cartItem.name) continue;
          
          const deductedQty = cartItem.qty || 1;
          
          // 1. Try to find the item directly in stock (pre-produced or bought to sell)
          const matchingItem = inventoryItems.find((inv: any) => 
            (inv.name || '').toLowerCase() === cartItem.name.toLowerCase()
          );
          
          let deductedFromFinished = false;
          
          // If it exists in stock and has quantity, deduct it directly.
          if (matchingItem && typeof matchingItem.quantity !== 'undefined' && Number(matchingItem.quantity) > 0) {
              const newQty = Math.max(0, Number(matchingItem.quantity) - deductedQty);
              await updateDoc(doc(db, 'inventoryItems', matchingItem.id), { quantity: newQty, updatedAt: now });
              await addDoc(collection(db, 'inventoryTransactions'), {
                item: matchingItem.name,
                type: 'out',
                amount: deductedQty,
                unit: matchingItem.unit || 'portion',
                reason: \`Vente POS: \${cartItem.name} (\${displayId})\`,
                user: 'POS',
                date: today,
                createdAt: now
              });
              deductedFromFinished = true;
          }
          
          // 2. If not found in stock or stock was 0, it might be made-to-order. Deduct ingredients.
          if (!deductedFromFinished) {
            const matchingRecipe = recettes.find(r => (r.nom || r.name || '').toLowerCase() === cartItem.name.toLowerCase());
            
            if (matchingRecipe && matchingRecipe.ingredients && Array.isArray(matchingRecipe.ingredients)) {
              for (const ingredient of matchingRecipe.ingredients) {
                if (!ingredient || !ingredient.name) continue;
                
                let invItem = inventoryItems.find((inv: any) => (inv.name || '').toLowerCase() === ingredient.name.toLowerCase());
                const portions = matchingRecipe.portions || 1;
                const qtyToDeduct = ((ingredient.quantity || 0) / portions) * deductedQty;
                
                if (invItem && typeof invItem.quantity !== 'undefined') {
                  const newQty = Math.max(0, Number(invItem.quantity) - qtyToDeduct);
                  await updateDoc(doc(db, 'inventoryItems', invItem.id), { quantity: newQty, updatedAt: now });
                  await addDoc(collection(db, 'inventoryTransactions'), {
                    item: invItem.name,
                    type: 'out',
                    amount: qtyToDeduct,
                    unit: invItem.unit || 'kg',
                    reason: \`Vente (Ingrédient): \${cartItem.name} (\${displayId})\`,
                    user: 'POS',
                    date: today,
                    createdAt: now
                  });
                }
              }
            }
          }
        }`;

code = code.replace(search, replacement);
fs.writeFileSync('src/POSTactile.tsx', code);
