const fs = require('fs');

let content = fs.readFileSync('src/Accounting.tsx', 'utf-8');

// I also need to make sure we import addDoc and serverTimestamp from firebase/firestore
content = content.replace(
  "import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';",
  "import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';"
);


const oldModal = `<div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client / Partenaire</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Nom du client" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ICE du Client (15 chiffres)</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 001538629000041" maxLength={15} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option>B2B (Entreprise)</option>
                  <option>B2C (Particulier)</option>
                </select>
              </div>
              <button 
                onClick={() => {
                  showToast("Facture créée avec succès");
                  setIsNewModalOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Créer la facture
              </button>
            </div>`;

const newModal = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                await addDoc(collection(db, 'invoices'), {
                  client: formData.get('client'),
                  ice: formData.get('ice'),
                  amount: Number(formData.get('amount')),
                  date: formData.get('date'),
                  type: formData.get('type'),
                  status: 'en attente',
                  createdAt: serverTimestamp()
                });
                showToast("Facture créée avec succès");
                setIsNewModalOpen(false);
              } catch (err) {
                console.error("Error creating invoice", err);
                showToast("Erreur lors de la création de la facture");
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client / Partenaire</label>
                <input name="client" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Nom du client" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ICE du Client (15 chiffres)</label>
                <input name="ice" type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 001538629000041" maxLength={15} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
                <input name="amount" required type="number" step="0.01" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                <input name="date" required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option value="B2B">B2B (Entreprise)</option>
                  <option value="B2C">B2C (Particulier)</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Créer la facture
              </button>
            </form>`;

content = content.replace(oldModal, newModal);
fs.writeFileSync('src/Accounting.tsx', content);
