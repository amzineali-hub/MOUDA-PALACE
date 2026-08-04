const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `                onClick={async () => {
                  try {
                    const data: any = {
                      name: semiFinishedForm.name,
                      unit: semiFinishedForm.unit,
                      cost: Number(semiFinishedForm.cost) || 0,
                      quantity: Number(semiFinishedForm.quantity) || 0,
                      updatedAt: serverTimestamp()
                    };
                    if (semiFinishedForm.id) {
                      await updateDoc(doc(db, 'semi_finished', semiFinishedForm.id), data);
                      showToast('Produit mis à jour');
                    } else {
                      data.createdAt = serverTimestamp();
                      await addDoc(collection(db, 'semi_finished'), data);
                      showToast('Produit créé');
                    }
                    setIsSemiFinishedModalOpen(false);
                  } catch(e) {
                    
                  }
                }}`;

const replacement = `                onClick={async () => {
                  try {
                    const data: any = {
                      name: semiFinishedForm.name,
                      unit: semiFinishedForm.unit,
                      cost: Number(semiFinishedForm.cost) || 0,
                      quantity: Number(semiFinishedForm.quantity) || 0,
                      updatedAt: serverTimestamp()
                    };
                    if (semiFinishedForm.id) {
                      await updateDoc(doc(db, 'semi_finished', semiFinishedForm.id), data);
                      showToast('Produit mis à jour');
                    } else {
                      data.createdAt = serverTimestamp();
                      await addDoc(collection(db, 'semi_finished'), data);
                      showToast('Produit créé');
                    }
                    setIsSemiFinishedModalOpen(false);
                  } catch(e: any) {
                    console.error('Error saving:', e);
                    showToast('Erreur: ' + e.message, 'error');
                  }
                }}`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Fixed');
} else {
  console.log('Target not found');
}
