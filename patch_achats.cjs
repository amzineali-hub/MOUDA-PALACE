const fs = require('fs');

let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

// 1. Add Firebase imports
content = content.replace(
  "import { useToast } from './context/ToastContext';",
  "import { useToast } from './context/ToastContext';\nimport { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc } from 'firebase/firestore';\nimport { db } from './firebase';"
);
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

// 2. Replace hardcoded arrays with useState
const oldCommandesStr = `  const commandes = [
    { id: 'CMD-2024-089', fournisseur: 'Coopérative Taliouine', date: '24 Juil 2024', montant: '12 400 MAD', status: 'En attente', items: 3 },
    { id: 'CMD-2024-088', fournisseur: 'Marché Central Fès', date: '22 Juil 2024', montant: '4 850 MAD', status: 'Livrée', items: 12 },
    { id: 'CMD-2024-087', fournisseur: 'Boucherie Al Baraka', date: '20 Juil 2024', montant: '8 900 MAD', status: 'Livrée', items: 5 },
    { id: 'CMD-2024-086', fournisseur: 'Primeur Atlas', date: '19 Juil 2024', montant: '3 200 MAD', status: 'Annulée', items: 8 },
  ];`;

const newCommandesStr = `  const [commandes, setCommandes] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubCommandes = onSnapshot(query(collection(db, 'commandes'), orderBy('createdAt', 'desc')), (snapshot) => {
      setCommandes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching commandes", error);
      showToast("Erreur lors de la récupération des commandes");
    });

    const unsubFournisseurs = onSnapshot(query(collection(db, 'fournisseurs'), orderBy('createdAt', 'desc')), (snapshot) => {
      setFournisseurs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching fournisseurs", error);
      showToast("Erreur lors de la récupération des fournisseurs");
      setLoading(false);
    });

    return () => {
      unsubCommandes();
      unsubFournisseurs();
    };
  }, []);`;

content = content.replace(oldCommandesStr, newCommandesStr);

// Remove old fournisseurs
const oldFournisseursStr = `  const fournisseurs = [
    { id: 'F001', nom: 'Coopérative Taliouine', categorie: 'Épices & Safran', contact: 'M. Hassan', tel: '+212 6 00 00 00 01', email: 'contact@taliouine-safran.ma', rating: 4.8 },
    { id: 'F002', nom: 'Marché Central Fès', categorie: 'Fruits & Légumes', contact: 'M. Karim', tel: '+212 6 00 00 00 02', email: 'commandes@marche-fes.ma', rating: 4.5 },
    { id: 'F003', nom: 'Boucherie Al Baraka', categorie: 'Viandes', contact: 'M. Youssef', tel: '+212 6 00 00 00 03', email: 'youssef@albaraka.ma', rating: 4.9 },
  ];`;
content = content.replace(oldFournisseursStr, "");

// 3. Fix tables to show data
// "Commandes"
// cmd.id is now the firebase id (string), but we want to display a readable order ID if it has one, or just slice the id. Let's assume the order data has 'orderNumber' or we use id slice.
content = content.replace(
  /{cmd\.id}/g,
  "{cmd.orderNumber || cmd.id.slice(0,8).toUpperCase()}"
);

// We need to fix the submit handler of "Nouvelle Commande"
const oldOrderSubmit = `            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const supplier = formData.get('supplier') as string;
              const deliveryDate = formData.get('deliveryDate') as string;
              const articles = formData.get('articles') as string;
              
              let fileContent = \`BON DE COMMANDE\\n\\n\`;
              fileContent += \`Émetteur : Restaurant Mouda Palace\\n\`;
              fileContent += \`Date d'émission : \${new Date().toLocaleDateString('fr-FR')}\\n\`;
              fileContent += \`Fournisseur : \${supplier}\\n\`;
              fileContent += \`Date de livraison prévue : \${deliveryDate}\\n\\n\`;
              fileContent += \`Articles commandés :\\n\${articles}\\n\\n\`;
              fileContent += \`Merci de bien vouloir confirmer la réception de cette commande.\\n\`;
              
              const encodedUri = encodeURI("data:text/plain;charset=utf-8," + fileContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", \`Bon_de_commande_\${supplier.replace(/ /g, '_')}_\${new Date().toISOString().split('T')[0]}.txt\`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              
              showToast("Commande validée et bon de commande généré");
              setIsNewOrderModalOpen(false);
            }}>`;

const newOrderSubmit = `            <form className="space-y-4" onSubmit={async (e) => {
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

content = content.replace(oldOrderSubmit, newOrderSubmit);

// Need to update the options in the select of order modal
const oldOptions = `<select name="supplier" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                  <option>Coopérative Taliouine</option>
                  <option>Ferme Atlas</option>
                  <option>Boucherie Centrale</option>
                </select>`;
const newOptions = `<select name="supplier" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option value="">Sélectionnez un fournisseur</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>`;
content = content.replace(oldOptions, newOptions);


// Now for Nouveau Fournisseur modal
const oldFournisseurForm = `<div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input type="text" placeholder="Ex: Grossiste Bio Plus" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white">
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="Fruits & Légumes">Fruits & Légumes</option>
                  <option value="Viandes & Volailles">Viandes & Volailles</option>
                  <option value="Poissons & Fruits de mer">Poissons & Fruits de mer</option>
                  <option value="Épices & Safran">Épices & Safran</option>
                  <option value="Épicerie & Sec">Épicerie & Sec</option>
                  <option value="Produits Laitiers">Produits Laitiers</option>
                  <option value="Boissons">Boissons</option>
                  <option value="Emballages & Consommables">Emballages & Consommables</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Email ou Téléphone)</label>
                <input type="text" placeholder="Ex: contact@bioplus.ma" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                onClick={() => {
                  showToast("Fournisseur ajouté avec succès");
                  setIsNewSupplierModalOpen(false);
                }}
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Ajouter le Fournisseur
              </button>
            </div>`;

const newFournisseurForm = `<form className="space-y-4" onSubmit={async (e) => {
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
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                <input name="nom" required type="text" placeholder="Ex: Grossiste Bio Plus" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select name="categorie" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956] bg-white max-h-48 overflow-y-auto">
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="Fruits & Légumes">Fruits & Légumes</option>
                  <option value="Viandes & Volailles">Viandes & Volailles</option>
                  <option value="Poissons & Fruits de mer">Poissons & Fruits de mer</option>
                  <option value="Épices & Safran">Épices & Safran</option>
                  <option value="Épicerie & Sec">Épicerie & Sec</option>
                  <option value="Produits Laitiers">Produits Laitiers</option>
                  <option value="Boissons">Boissons</option>
                  <option value="Emballages & Consommables">Emballages & Consommables</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Email ou Téléphone)</label>
                <input name="contact" required type="text" placeholder="Ex: contact@bioplus.ma" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#DDA956] text-[#1A1A1A] py-3 rounded-xl font-medium mt-4 hover:bg-[#c4954b] transition-colors"
              >
                Ajouter le Fournisseur
              </button>
            </form>`;

content = content.replace(oldFournisseurForm, newFournisseurForm);

fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log("Patched src/AchatsFournisseurs.tsx");
