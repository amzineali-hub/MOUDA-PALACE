const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

// Fix 712
const search1 = `                onClick={async () => {
                  setCommandeToDelete(cmd.id); if (false) {
                    try {
                      if (selectedCommande?.id) { await deleteDoc(doc(db, 'commandes', selectedCommande.id)); }`;
const replace1 = `                onClick={async () => {
                  if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
                    try {
                      if (selectedCommande?.id) { await deleteDoc(doc(db, 'commandes', selectedCommande.id)); }`;
code = code.replace(search1, replace1);

// Fix 1112
const search2 = `                onClick={async () => {
                  setFournisseurToDelete(fournisseur.id); if (false) {
                    try {
                      if (selectedFournisseur?.id) { await deleteDoc(doc(db, 'fournisseurs', selectedFournisseur.id)); }`;
const replace2 = `                onClick={async () => {
                  if (confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
                    try {
                      if (selectedFournisseur?.id) { await deleteDoc(doc(db, 'fournisseurs', selectedFournisseur.id)); }`;
code = code.replace(search2, replace2);

// Fix 1522
const search3 = `  const handleReject = () => {
    setDeliveryToReject(cmd.id); if (false) {
      onValidate(order.id, items, 'Refusée', invoiceNote);
    }
  };`;
const replace3 = `  const handleReject = () => {
    if (confirm('Voulez-vous vraiment refuser cette livraison ?')) {
      onValidate(order.id, items, 'Refusée', invoiceNote);
    }
  };`;
code = code.replace(search3, replace3);

fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
