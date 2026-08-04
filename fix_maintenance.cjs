const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "ai-studio-moudapalacesaas-4dac6993-224c-4a7d-9a21-1588a2dfdc68"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'inventoryItems'));
  let count = 0;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.category && data.category.toLowerCase() === "produits de maintenance") {
      count++;
      await updateDoc(doc(db, 'inventoryItems', docSnap.id), { category: "Hygiène & Entretien" });
      console.log("Updated item", data.name);
    }
  }
  console.log("Total updated:", count);
  
  const fSnapshot = await getDocs(collection(db, 'fournisseurs'));
  let fCount = 0;
  for (const docSnap of fSnapshot.docs) {
    const data = docSnap.data();
    if (
      (data.categorie && data.categorie.toLowerCase() === "produits de maintenance") || 
      (data.category && data.category.toLowerCase() === "produits de maintenance")
    ) {
      fCount++;
      await updateDoc(doc(db, 'fournisseurs', docSnap.id), { categorie: "Hygiène & Entretien", category: "Hygiène & Entretien" });
      console.log("Updated fournisseur", data.name || data.nom);
    }
  }
  console.log("Total fournisseurs updated:", fCount);
  
  process.exit(0);
}
check();
