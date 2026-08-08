const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// The modal block we want to keep
const modalStr = `      <ConfirmModal 
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
      />`;

// Replace all occurrences of it with nothing
code = code.split(modalStr).join('');

// Re-add it only once before the end of AchatsFournisseurs
const anchor = `setActiveTab={setActiveTab} />
      )}
    </div>
  );
}`;
code = code.replace(anchor, `setActiveTab={setActiveTab} />
      )}\n${modalStr}
    </div>
  );
}`);

// Also fix the commande/f variables
code = code.replace(/setCommandeToDelete\(commande\.id\)/g, 'setCommandeToDelete(cmd.id)');
code = code.replace(/setFournisseurToDelete\(f\.id\)/g, 'setFournisseurToDelete(fournisseur.id)');
code = code.replace(/setDeliveryToReject\(commande\.id\)/g, 'setDeliveryToReject(cmd.id)');

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
