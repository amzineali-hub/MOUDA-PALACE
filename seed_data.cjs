const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, getDocs } = require('firebase/firestore');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || "(default)");

const seed = async () => {
  const fournisseursRef = collection(db, 'fournisseurs');
  const fDocs = await getDocs(fournisseursRef);
  if (fDocs.empty) {
    console.log("Seeding fournisseurs...");
    const fournisseurs = [
      { id: 'F001', nom: 'Coopérative Taliouine', categorie: 'Épices & Safran', contact: 'M. Hassan', tel: '+212 6 00 00 00 01', email: 'contact@taliouine-safran.ma', rating: 4.8 },
      { id: 'F002', nom: 'Marché Central Fès', categorie: 'Fruits & Légumes', contact: 'M. Karim', tel: '+212 6 00 00 00 02', email: 'commandes@marche-fes.ma', rating: 4.5 },
      { id: 'F003', nom: 'Boucherie Al Baraka', categorie: 'Viandes', contact: 'M. Youssef', tel: '+212 6 00 00 00 03', email: 'youssef@albaraka.ma', rating: 4.9 },
    ];
    for (const f of fournisseurs) {
      await addDoc(fournisseursRef, { ...f, createdAt: serverTimestamp() });
    }
  }

  const recettesRef = collection(db, 'recettes');
  const rDocs = await getDocs(recettesRef);
  if (rDocs.empty) {
    console.log("Seeding recettes...");
    const recettes = [
      { id: '1', nom: 'Pastilla au Pigeon', categorie: 'Plats', cout: 45, prix: 180, marge: 75, tempsPrep: '45 min', chef: 'Chef Amine' },
      { id: '2', nom: "Tajine d'Agneau aux Pruneaux", categorie: 'Plats', cout: 65, prix: 220, marge: 70, tempsPrep: '60 min', chef: 'Chef Khalid' },
      { id: '3', nom: 'Salade Zaalouk', categorie: 'Entrées', cout: 15, prix: 65, marge: 77, tempsPrep: '20 min', chef: 'Chef Fatima' },
      { id: '4', nom: 'Briouates aux Amandes', categorie: 'Desserts', cout: 25, prix: 85, marge: 71, tempsPrep: '30 min', chef: 'Chef Youssef' },
    ];
    for (const r of recettes) {
      await addDoc(recettesRef, { ...r, createdAt: serverTimestamp() });
    }
  }
  
  const tablesRef = collection(db, 'tables');
  const tDocs = await getDocs(tablesRef);
  if (tDocs.empty) {
    console.log("Seeding tables...");
    const tables = [
      { id: 'T01', zone: 'patio', capacity: 4, status: 'occupee', currentPax: 3, time: '19:30', reservation: 'Dupont' },
      { id: 'T02', zone: 'patio', capacity: 2, status: 'libre', currentPax: 0, time: null, reservation: null },
      { id: 'T03', zone: 'patio', capacity: 4, status: 'reservee', currentPax: 0, time: '21:00', reservation: 'Martin' },
      { id: 'T04', zone: 'patio', capacity: 6, status: 'occupee', currentPax: 6, time: '19:45', reservation: 'Famille Alami' },
      { id: 'T05', zone: 'patio', capacity: 2, status: 'libre', currentPax: 0, time: null, reservation: null },
      { id: 'T06', zone: 'patio', capacity: 8, status: 'nettoyage', currentPax: 0, time: null, reservation: null },
      { id: 'VIP1', zone: 'salon', capacity: 4, status: 'reservee', currentPax: 0, time: '20:30', reservation: 'Ambassade' },
      { id: 'TER1', zone: 'terrasse', capacity: 2, status: 'occupee', currentPax: 2, time: '19:15', reservation: 'Couple' },
      { id: 'TER2', zone: 'terrasse', capacity: 4, status: 'libre', currentPax: 0, time: null, reservation: null },
    ];
    for (const t of tables) {
      await addDoc(tablesRef, { ...t, createdAt: serverTimestamp() });
    }
  }
  
  console.log("Seeding done.");
  process.exit(0);
};

seed().catch(console.error);
