const fs = require('fs');
let content = fs.readFileSync('src/Accounting.tsx', 'utf-8');

const oldInvoices = `  const invoices = [
    { id: 'FAC-2026-001', client: 'Riad Al Andalous', ice: '001538629000041', date: '12 Nov 2026', amount: '1 250 MAD', status: 'Payée' },
    { id: 'FAC-2026-002', client: 'Atlas Voyages', ice: '002148574000034', date: '14 Nov 2026', amount: '4 500 MAD', status: 'En attente' },
    { id: 'FAC-2026-003', client: 'LocaCar Marrakech', ice: '001937482000021', date: '15 Nov 2026', amount: '850 MAD', status: 'Payée' },
    { id: 'FAC-2026-004', client: 'Hôtel La Medina', ice: '002594837000067', date: '18 Nov 2026', amount: '3 200 MAD', status: 'Retard' }
  ];`;

const newInvoices = `  const [invoices, setInvoices] = useState<any[]>([
    { id: 'FAC-2026-001', client: 'Riad Al Andalous', ice: '001538629000041', date: '12 Nov 2026', amount: '1 250 MAD', status: 'Payée' },
    { id: 'FAC-2026-002', client: 'Atlas Voyages', ice: '002148574000034', date: '14 Nov 2026', amount: '4 500 MAD', status: 'En attente' },
    { id: 'FAC-2026-003', client: 'LocaCar Marrakech', ice: '001937482000021', date: '15 Nov 2026', amount: '850 MAD', status: 'Payée' },
    { id: 'FAC-2026-004', client: 'Hôtel La Medina', ice: '002594837000067', date: '18 Nov 2026', amount: '3 200 MAD', status: 'Retard' }
  ]);
  
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'invoices'), orderBy('createdAt', 'desc')), (snapshot) => {
      if (!snapshot.empty) {
        setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }, (error) => {
      console.error("Error fetching invoices", error);
    });
    return () => unsub();
  }, []);`;

content = content.replace(oldInvoices, newInvoices);

const oldModalForm = `<div className="space-y-4">
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

const newModalForm = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newInvoice = {
                client: formData.get('client'),
                ice: formData.get('ice'),
                amount: Number(formData.get('amount')) + ' MAD',
                date: formData.get('date'),
                status: 'En attente',
                createdAt: serverTimestamp()
              };
              
              // Optimistic update
              setInvoices([{ id: 'FAC-NOUVEAU', ...newInvoice }, ...invoices]);
              setIsNewModalOpen(false);
              showToast("Facture créée avec succès");
              
              try {
                await addDoc(collection(db, 'invoices'), newInvoice);
              } catch (err) {
                console.error("Error creating invoice", err);
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
              <button 
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-medium mt-4 hover:bg-[#333] transition-colors"
              >
                Créer la facture
              </button>
            </form>`;

content = content.replace(oldModalForm, newModalForm);

fs.writeFileSync('src/Accounting.tsx', content);
