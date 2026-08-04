const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

const targetState = `  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);`;
const replacementState = `  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState<any>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);`;

if (code.includes(targetState)) {
    code = code.replace(targetState, replacementState);
} else {
    console.log("State target not found");
}

const targetCheckout = `      showToast(\`Paiement de \${total.toFixed(2)} MAD validé. Pièces comptables générées et stock mis à jour.\`);
      setCart([]);`;
const replacementCheckout = `      showToast(\`Paiement de \${total.toFixed(2)} MAD validé. Pièces comptables générées et stock mis à jour.\`);
      setTicketToPrint({
        id: displayId,
        date: today,
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: total,
        method: method
      });
      setIsTicketModalOpen(true);
      setCart([]);`;

if (code.includes(targetCheckout)) {
    code = code.replace(targetCheckout, replacementCheckout);
} else {
    console.log("Checkout target not found");
}

const ticketModalCode = `      {/* Ticket Modal */}
      {isTicketModalOpen && ticketToPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-sm w-full flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Ticket de caisse</h3>
              <button onClick={() => setIsTicketModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white flex-1" id="printable-ticket">
              <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-4">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">MOUDA PALACE</h2>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Restaurant & Salon de thé</p>
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p>Ticket: {ticketToPrint.id}</p>
                  <p>{ticketToPrint.date} à {ticketToPrint.time}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {ticketToPrint.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.qty}x</span> {item.name}
                    </div>
                    <div className="text-gray-700">{(item.price * item.qty).toFixed(2)} MAD</div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-dashed border-gray-300 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>TOTAL</span>
                  <span>{ticketToPrint.total.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Paiement</span>
                  <span>{ticketToPrint.method}</span>
                </div>
              </div>
              
              <div className="text-center text-xs text-gray-400 mt-8">
                <p>Merci de votre visite !</p>
                <p>À très bientôt chez Mouda Palace</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  const printContent = document.getElementById('printable-ticket');
                  if (printContent) {
                    const originalContents = document.body.innerHTML;
                    document.body.innerHTML = printContent.innerHTML;
                    window.print();
                    document.body.innerHTML = originalContents;
                    window.location.reload();
                  }
                }}
                className="flex-1 py-2.5 bg-[#F4C75B] text-[#1A1A1A] font-medium rounded-lg hover:bg-[#E5B745] transition-colors flex items-center justify-center gap-2"
              >
                <Receipt size={18} />
                Imprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
`;

const targetModalInsert = `      {/* Add Item Modal */}`;
if (code.includes(targetModalInsert)) {
    code = code.replace(targetModalInsert, ticketModalCode + "\\n      " + targetModalInsert);
} else {
    console.log("Modal insert target not found");
}

fs.writeFileSync('src/POSTactile.tsx', code);
console.log("Patched POS ticket");
