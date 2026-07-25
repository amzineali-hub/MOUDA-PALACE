const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

// For "Fournisseurs", optimistic update:
const oldFournisseurForm = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nom = formData.get('nom') as string;
              const categorie = formData.get('categorie') as string;
              const contact = formData.get('contact') as string;
              
              try {
                await addDoc(collection(db, 'fournisseurs'), {
                  nom,
                  categorie,
                  contact,
                  rating: 5.0, // Default rating
                  createdAt: serverTimestamp()
                });
                showToast("Fournisseur ajouté avec succès");
                setIsNewSupplierModalOpen(false);
              } catch (err) {
                console.error("Error adding fournisseur", err);
                showToast("Erreur lors de l'ajout du fournisseur");
              }
            }}>`;

const newFournisseurForm = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nom = formData.get('nom') as string;
              const categorie = formData.get('categorie') as string;
              const contact = formData.get('contact') as string;
              
              const newFournisseur = {
                  id: 'F' + Date.now(),
                  nom,
                  categorie,
                  contact,
                  rating: 5.0,
                  createdAt: serverTimestamp()
              };
              
              setFournisseurs([newFournisseur, ...fournisseurs]);
              showToast("Fournisseur ajouté avec succès");
              setIsNewSupplierModalOpen(false);
              
              try {
                await addDoc(collection(db, 'fournisseurs'), newFournisseur);
              } catch (err) {
                console.error("Error adding fournisseur", err);
              }
            }}>`;

content = content.replace(oldFournisseurForm, newFournisseurForm);

// For "Commandes", optimistic update:
const oldCommandeForm = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const supplierId = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              const articles = formData.get('articles') as string;
              
              const selectedSupplier = fournisseurs.find(f => f.id === supplierId);
              const supplierName = selectedSupplier ? selectedSupplier.nom : supplierId;

              try {
                await addDoc(collection(db, 'commandes'), {
                  fournisseur: supplierName,
                  fournisseurId: supplierId,
                  date: new Date().toLocaleDateString('fr-FR'),
                  deliveryDate,
                  montant: '0 MAD', // To be calculated or updated later
                  status: 'En attente',
                  items: articles.split(',').length,
                  articles,
                  createdAt: serverTimestamp()
                });

                let fileContent = \`BON DE COMMANDE\\n\\n\`;
                fileContent += \`Émetteur : Restaurant Mouda Palace\\n\`;
                fileContent += \`Date d'émission : \${new Date().toLocaleDateString('fr-FR')}\\n\`;
                fileContent += \`Fournisseur : \${supplierName}\\n\`;
                fileContent += \`Date de livraison prévue : \${deliveryDate}\\n\\n\`;
                fileContent += \`Articles commandés :\\n\${articles}\\n\\n\`;
                fileContent += \`Merci de bien vouloir confirmer la réception de cette commande.\\n\`;
                
                const encodedUri = encodeURI("data:text/plain;charset=utf-8," + fileContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", \`Bon_de_commande_\${supplierName.replace(/ /g, '_')}_\${new Date().toISOString().split('T')[0]}.txt\`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                
                showToast("Commande validée et bon de commande généré");
                setIsNewOrderModalOpen(false);
              } catch (err) {
                console.error("Error adding order", err);
                showToast("Erreur lors de la création de la commande");
              }
            }}>`;

const newCommandeForm = `<form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const supplierId = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              const articles = formData.get('articles') as string;
              
              const selectedSupplier = fournisseurs.find(f => f.id === supplierId);
              const supplierName = selectedSupplier ? selectedSupplier.nom : supplierId;

              const newCmd = {
                  id: 'CMD-' + Date.now(),
                  fournisseur: supplierName,
                  fournisseurId: supplierId,
                  date: new Date().toLocaleDateString('fr-FR'),
                  deliveryDate,
                  montant: '0 MAD',
                  status: 'En attente',
                  items: articles.split(',').length,
                  articles,
                  createdAt: serverTimestamp()
              };

              setCommandes([newCmd, ...commandes]);
              showToast("Commande validée et bon de commande généré");
              setIsNewOrderModalOpen(false);

              try {
                await addDoc(collection(db, 'commandes'), newCmd);

                let fileContent = \`BON DE COMMANDE\\n\\n\`;
                fileContent += \`Émetteur : Restaurant Mouda Palace\\n\`;
                fileContent += \`Date d'émission : \${new Date().toLocaleDateString('fr-FR')}\\n\`;
                fileContent += \`Fournisseur : \${supplierName}\\n\`;
                fileContent += \`Date de livraison prévue : \${deliveryDate}\\n\\n\`;
                fileContent += \`Articles commandés :\\n\${articles}\\n\\n\`;
                fileContent += \`Merci de bien vouloir confirmer la réception de cette commande.\\n\`;
                
                const encodedUri = encodeURI("data:text/plain;charset=utf-8," + fileContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", \`Bon_de_commande_\${supplierName.replace(/ /g, '_')}_\${new Date().toISOString().split('T')[0]}.txt\`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              } catch (err) {
                console.error("Error adding order", err);
              }
            }}>`;

content = content.replace(oldCommandeForm, newCommandeForm);
fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
