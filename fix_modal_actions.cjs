const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target1 = `              {!semiFinishedForm.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
                  <input
                    type="number"
                    value={semiFinishedForm.quantity}
                    onChange={(e) => setSemiFinishedForm({...semiFinishedForm, quantity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                  />
                </div>
              )}`;
              
const replacement1 = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{semiFinishedForm.id ? 'Quantité en stock' : 'Stock initial'}</label>
                <input
                  type="number"
                  value={semiFinishedForm.quantity}
                  onChange={(e) => setSemiFinishedForm({...semiFinishedForm, quantity: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F4C75B] focus:border-[#F4C75B]"
                />
              </div>`;

if(code.includes(target1)) {
  code = code.replace(target1, replacement1);
}

const target2 = `                                onClick={async () => {
                                  if(confirm(\`Supprimer \${item.name} ?\`)) {
                                    await deleteDoc(doc(db, 'semi_finished', item.id));
                                    showToast('Produit supprimé');
                                  }
                                }}`;

const replacement2 = `                                onClick={async () => {
                                  if(window.confirm(\`Voulez-vous vraiment supprimer le produit "\${item.name}" ?\`)) {
                                    try {
                                      await deleteDoc(doc(db, 'semi_finished', item.id));
                                      showToast('Produit supprimé avec succès');
                                    } catch(e) {
                                      showToast('Erreur lors de la suppression', 'error');
                                    }
                                  }
                                }}`;

if(code.includes(target2)) {
  code = code.replace(target2, replacement2);
}

const target3 = `                                onClick={() => {
                                  const qty = prompt('Quantité à ajouter ou retirer (ex: 5 ou -2) :');
                                  if (qty && !isNaN(Number(qty))) {
                                    const newQty = Number(item.quantity || 0) + Number(qty);
                                    updateDoc(doc(db, 'semi_finished', item.id), { quantity: newQty });
                                    showToast(\`Stock de \${item.name} mis à jour.\`);
                                  }
                                }}`;

const replacement3 = `                                onClick={async () => {
                                  const qty = window.prompt('Quantité à ajouter ou retirer (ex: 5 ou -2) :');
                                  if (qty && !isNaN(Number(qty))) {
                                    const newQty = Number(item.quantity || 0) + Number(qty);
                                    try {
                                      await updateDoc(doc(db, 'semi_finished', item.id), { quantity: newQty });
                                      showToast(\`Stock de \${item.name} mis à jour avec succès.\`);
                                    } catch(e) {
                                      showToast('Erreur lors de la mise à jour', 'error');
                                    }
                                  }
                                }}`;

if(code.includes(target3)) {
  code = code.replace(target3, replacement3);
}

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed actions and modal');
