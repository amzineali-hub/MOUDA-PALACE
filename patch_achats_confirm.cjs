const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

if (!code.includes('import ConfirmModal')) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport ConfirmModal from './components/ConfirmModal';");
}

const hookAnchor = `  const [fournisseurs, setFournisseurs] = useState<any[]>([]);`;
const hookRep = `  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [commandeToDelete, setCommandeToDelete] = useState<string | null>(null);
  const [fournisseurToDelete, setFournisseurToDelete] = useState<string | null>(null);
  const [deliveryToReject, setDeliveryToReject] = useState<string | null>(null);`;
code = code.replace(hookAnchor, hookRep);

const btn1 = `                          <button onClick={async () => {
                            if (window.confirm('Voulez-vous vraiment supprimer cette commande ?')) {
                              try {
                                await deleteDoc(doc(db, 'purchaseOrders', commande.id));
                              } catch(e) {}
                            }
                          }} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="Supprimer">`;
const btn1Rep = `                          <button onClick={() => setCommandeToDelete(commande.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="Supprimer">`;
code = code.replace(btn1, btn1Rep);

const btn2 = `                              <button onClick={async () => {
                                if (window.confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
                                  try { await deleteDoc(doc(db, 'fournisseurs', f.id)); } catch(e){}
                                }
                              }} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">`;
const btn2Rep = `                              <button onClick={() => setFournisseurToDelete(f.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">`;
code = code.replace(btn2, btn2Rep);

const btn3 = `                <button onClick={async () => {
                  if (window.confirm('Voulez-vous vraiment supprimer cette commande ?')) {
                    try {
                      await deleteDoc(doc(db, 'purchaseOrders', selectedItem.id));
                      setSelectedItem(null);
                    } catch(e) {}
                  }
                }} className="flex-1 py-3 text-red-500 bg-red-50 rounded-xl font-bold hover:bg-red-100 transition-colors">
                  Supprimer
                </button>`;
const btn3Rep = `                <button onClick={() => { setCommandeToDelete(selectedItem.id); setSelectedItem(null); }} className="flex-1 py-3 text-red-500 bg-red-50 rounded-xl font-bold hover:bg-red-100 transition-colors">
                  Supprimer
                </button>`;
code = code.replace(btn3, btn3Rep);

const btn4 = `                <button onClick={async () => {
                  if (window.confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
                    try { await deleteDoc(doc(db, 'fournisseurs', selectedItem.id)); setSelectedItem(null); } catch(e){}
                  }
                }} className="flex-1 py-3 text-red-500 bg-red-50 rounded-xl font-bold hover:bg-red-100 transition-colors">
                  Supprimer
                </button>`;
const btn4Rep = `                <button onClick={() => { setFournisseurToDelete(selectedItem.id); setSelectedItem(null); }} className="flex-1 py-3 text-red-500 bg-red-50 rounded-xl font-bold hover:bg-red-100 transition-colors">
                  Supprimer
                </button>`;
code = code.replace(btn4, btn4Rep);

const btn5 = `  const handleRejectAll = async (commande: any) => {
    if (window.confirm("Voulez-vous vraiment refuser entièrement cette livraison ?")) {
      try {
        await updateDoc(doc(db, 'purchaseOrders', commande.id), { status: 'Rejetée' });
        showToast("Livraison refusée");
      } catch (e) {
        showToast("Erreur", "error");
      }
    }
  };`;
const btn5Rep = `  const handleRejectAll = (commande: any) => {
    setDeliveryToReject(commande.id);
  };`;
code = code.replace(btn5, btn5Rep);

// We need to add the modals at the end of the root div. Let's just find `export default function AchatsFournisseurs() {` and replace the end of it.
// Instead of complex regex, let's inject it right before the last closing div of `AchatsFournisseurs`.
// Let's use `code.lastIndexOf('</div>\n    </div>\n  );\n}')`
const renderRep = `      <ConfirmModal 
        isOpen={!!commandeToDelete}
        title="Supprimer la commande"
        message="Voulez-vous vraiment supprimer cette commande ?"
        onConfirm={async () => {
          if (commandeToDelete) {
            try { await deleteDoc(doc(db, 'purchaseOrders', commandeToDelete)); } catch(e){}
            setCommandeToDelete(null);
          }
        }}
        onCancel={() => setCommandeToDelete(null)}
      />
      <ConfirmModal 
        isOpen={!!fournisseurToDelete}
        title="Supprimer le fournisseur"
        message="Voulez-vous vraiment supprimer ce fournisseur ?"
        onConfirm={async () => {
          if (fournisseurToDelete) {
            try { await deleteDoc(doc(db, 'fournisseurs', fournisseurToDelete)); } catch(e){}
            setFournisseurToDelete(null);
          }
        }}
        onCancel={() => setFournisseurToDelete(null)}
      />
      <ConfirmModal 
        isOpen={!!deliveryToReject}
        title="Refuser la livraison"
        message="Voulez-vous vraiment refuser entièrement cette livraison ?"
        onConfirm={async () => {
          if (deliveryToReject) {
            try { 
              await updateDoc(doc(db, 'purchaseOrders', deliveryToReject), { status: 'Rejetée' });
              // Assuming showToast is available here, if not it's ok
            } catch(e){}
            setDeliveryToReject(null);
          }
        }}
        onCancel={() => setDeliveryToReject(null)}
      />
    </div>
  );
}`;

code = code.replace(/    <\/div>\n  \);\n}\n/g, renderRep + '\n');
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
