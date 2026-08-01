const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target1 = `            <div className="mb-4">
              <p className="font-medium text-gray-900">{selectedProduct.name}</p>
            </div>
            <div className="space-y-4">`;

const replace1 = `            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
              <input id="edit-name" type="text" defaultValue={selectedProduct.name} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B] font-medium text-gray-900" />
            </div>
            <div className="space-y-4">`;

const target2 = `                  const newCat = (document.getElementById('edit-cat') as HTMLInputElement)?.value;
                  const newUnit = (document.getElementById('edit-unit') as HTMLSelectElement)?.value;
                  const newQty = Number((document.getElementById('edit-qty') as HTMLInputElement)?.value);
                  const newMin = Number((document.getElementById('edit-min') as HTMLInputElement)?.value);
                  const newSup = (document.getElementById('edit-sup') as HTMLInputElement)?.value;
                  
                  if (selectedProduct.id) {
                    try {
                      await updateDoc(doc(db, "inventoryItems", selectedProduct.id), {
                        category: newCat,
                        unit: newUnit,
                        quantity: newQty,
                        minStock: newMin,
                        supplier: newSup,
                        updatedAt: serverTimestamp()
                      });`;

const replace2 = `                  const newName = (document.getElementById('edit-name') as HTMLInputElement)?.value;
                  const newCat = (document.getElementById('edit-cat') as HTMLInputElement)?.value;
                  const newUnit = (document.getElementById('edit-unit') as HTMLSelectElement)?.value;
                  const newQty = Number((document.getElementById('edit-qty') as HTMLInputElement)?.value);
                  const newMin = Number((document.getElementById('edit-min') as HTMLInputElement)?.value);
                  const newSup = (document.getElementById('edit-sup') as HTMLInputElement)?.value;
                  
                  if (selectedProduct.id) {
                    try {
                      await updateDoc(doc(db, "inventoryItems", selectedProduct.id), {
                        name: newName || selectedProduct.name,
                        category: newCat,
                        unit: newUnit,
                        quantity: newQty,
                        minStock: newMin,
                        supplier: newSup,
                        updatedAt: serverTimestamp()
                      });`;

if (content.includes(target1) && content.includes(target2)) {
    content = content.replace(target1, replace1).replace(target2, replace2);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Success");
} else {
    console.log("Could not find targets");
}
