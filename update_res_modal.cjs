const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldModal = `            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: M. Dubois" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input type="time" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personnes (Pax)</label>
                  <input type="number" defaultValue={2} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="+212..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source / Canal</label>
                <select className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                  <option>Téléphone</option>
                  <option>Passage (Walk-in)</option>
                  <option>WhatsApp / Instagram</option>
                  <option>Site Web</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Tags spéciaux</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none" placeholder="Allergies, anniversaire..."></textarea>
              </div>
              <button 
                onClick={() => {
                  showToast("Réservation ajoutée avec succès");
                  setIsNewResOpen(false);
                }}
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Confirmer la réservation
              </button>
            </div>`;

const newModal = `            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nom = formData.get('nom') as string;
              const date = formData.get('date') as string;
              const time = formData.get('time') as string;
              const pax = Number(formData.get('pax'));
              const phone = formData.get('phone') as string;
              const source = formData.get('source') as string;
              const notes = formData.get('notes') as string;
              
              let tag = 'Nouveau';
              if (notes.toLowerCase().includes('vip')) tag = 'VIP';
              else if (notes.toLowerCase().includes('allergie')) tag = 'Allergies';

              const newRes = {
                id: 'RES-' + Date.now(),
                name: nom,
                date: date + ', ' + time,
                pax,
                source,
                status: 'Confirmé',
                phone,
                tag,
                notes,
                table: null,
                createdAt: serverTimestamp()
              };

              try {
                await addDoc(collection(db, 'reservations'), newRes);
                setReservations([newRes, ...reservations]);
                showToast("Réservation ajoutée avec succès");
              } catch (err) {
                console.error(err);
                showToast("Erreur", "error");
              }
              setIsNewResOpen(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input name="nom" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: M. Dubois" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input name="date" required type="date" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input name="time" required type="time" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personnes (Pax)</label>
                  <input name="pax" required type="number" defaultValue={2} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input name="phone" required type="tel" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="+212..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source / Canal</label>
                <select name="source" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                  <option>Téléphone</option>
                  <option>Passage (Walk-in)</option>
                  <option>WhatsApp / Instagram</option>
                  <option>Site Web</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Tags spéciaux (ajoutez "VIP" pour tag VIP)</label>
                <textarea name="notes" rows={2} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] resize-none" placeholder="Allergies, anniversaire, VIP..."></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Confirmer la réservation
              </button>
            </form>`;

if (code.includes('Confirmer la réservation')) {
  code = code.replace(oldModal, newModal);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated modal");
} else {
  console.log("Could not find modal");
}
