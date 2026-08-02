const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, addDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

const fournisseurs = [
  { nom: 'Coop Fès Primeurs', contact: 'Ahmed', telephone: '0661234567', categorie: 'Légumes & Fruits', email: 'ahmed@coopfes.ma' },
  { nom: 'Viandes Atlas', contact: 'Rachid', telephone: '0662345678', categorie: 'Viandes', email: 'contact@viandesatlas.ma' },
  { nom: 'Laiterie du Nord', contact: 'Fatima', telephone: '0663456789', categorie: 'Produits Laitiers', email: 'fatima@laiterienord.ma' },
  { nom: 'Epices & Saveurs', contact: 'Youssef', telephone: '0664567890', categorie: 'Épices', email: 'youssef@epices.ma' },
  { nom: 'Pêcheries de l\'Océan', contact: 'Brahim', telephone: '0665678901', categorie: 'Poissons & Fruits de mer', email: 'brahim@pecheries.ma' },
  { nom: 'Boulangerie Artisanale', contact: 'Driss', telephone: '0666789012', categorie: 'Boulangerie', email: 'driss@boulangerie.ma' },
  { nom: 'Marché Central de Fès', contact: 'Ali', telephone: '0667890123', categorie: 'Divers', email: 'ali@marche.ma' },
  { nom: 'Distriboissons Maroc', contact: 'Hassan', telephone: '0668901234', categorie: 'Boissons', email: 'hassan@distriboissons.ma' },
  { nom: 'Emballages Pro', contact: 'Kamal', telephone: '0669012345', categorie: 'Emballages', email: 'kamal@emballagespro.ma' },
  { nom: 'Hygiène Plus', contact: 'Mourad', telephone: '0660123456', categorie: 'Produits d\'entretien', email: 'mourad@hygieneplus.ma' },
  { nom: 'Fromagerie de l\'Atlas', contact: 'Khadija', telephone: '0661234568', categorie: 'Produits Laitiers', email: 'khadija@fromagerie.ma' },
  { nom: 'Volaille Bio Fès', contact: 'Omar', telephone: '0662345679', categorie: 'Volailles', email: 'omar@volaillebio.ma' },
  { nom: 'Maghreb Céréales', contact: 'Zineb', telephone: '0663456780', categorie: 'Épicerie', email: 'zineb@cereales.ma' }
];

const categories = ["Viandes", "Volailles", "Poissons & Fruits de mer", "Légumes", "Fruits", "Produits Laitiers", "Épicerie", "Boissons", "Boulangerie", "Emballages", "Produits d'entretien", "Épices"];

const productTemplates = [
  // Viandes (15)
  ...['Boeuf Haché', 'Filet de Boeuf', 'Entrecôte', 'Côte de Boeuf', 'Jarret de Boeuf', 'Collier d\'Agneau', 'Gigot d\'Agneau', 'Épaule d\'Agneau', 'Viande Hachée Agneau', 'Foie de Boeuf', 'Foie d\'Agneau', 'Merguez', 'Saucisses de Boeuf', 'Tripes', 'Côtelettes d\'Agneau'].map(n => ({ name: n, category: 'Viandes', supplier: 'Viandes Atlas', unit: 'kg', minPrice: 80, maxPrice: 180 })),
  // Volailles (10)
  ...['Poulet Entier', 'Blanc de Poulet', 'Cuisses de Poulet', 'Ailes de Poulet', 'Dinde', 'Escalope de Dinde', 'Foie de Volaille', 'Coquelet', 'Poulet Beldi', 'Oeufs'].map(n => ({ name: n, category: 'Volailles', supplier: 'Volaille Bio Fès', unit: n === 'Oeufs' ? 'unité' : 'kg', minPrice: 20, maxPrice: 70 })),
  // Poissons & Fruits de mer (15)
  ...['Dorade', 'Loup Bar', 'Sole', 'Rouget', 'Calamar', 'Crevettes Roses', 'Crevettes Grises', 'Gambas', 'Moules', 'Huîtres', 'Saumon Frais', 'Thon Frais', 'Espadon', 'Sardines', 'Merlan'].map(n => ({ name: n, category: 'Poissons & Fruits de mer', supplier: 'Pêcheries de l\'Océan', unit: 'kg', minPrice: 30, maxPrice: 200 })),
  // Légumes (25)
  ...['Pommes de Terre', 'Tomates', 'Oignons Blancs', 'Oignons Rouges', 'Carottes', 'Courgettes', 'Aubergines', 'Poivrons Verts', 'Poivrons Rouges', 'Poivrons Jaunes', 'Concombres', 'Laitue', 'Céleri', 'Persil', 'Coriandre', 'Menthe', 'Ail', 'Navets', 'Choux Blanc', 'Choux Rouge', 'Brocolis', 'Haricots Verts', 'Petits Pois', 'Artichauts', 'Citrons'].map(n => ({ name: n, category: 'Légumes', supplier: 'Coop Fès Primeurs', unit: 'kg', minPrice: 5, maxPrice: 25 })),
  // Fruits (15)
  ...['Pommes', 'Bananes', 'Oranges', 'Clémentines', 'Fraises', 'Framboises', 'Melon', 'Pastèque', 'Raisin Blanc', 'Raisin Noir', 'Pêches', 'Nectarines', 'Prunes', 'Citrons Verts', 'Avocats'].map(n => ({ name: n, category: 'Fruits', supplier: 'Coop Fès Primeurs', unit: 'kg', minPrice: 8, maxPrice: 35 })),
  // Produits Laitiers (15)
  ...['Lait Entier', 'Lait Demi-écrémé', 'Beurre Doux', 'Beurre Salé', 'Crème Fraîche', 'Fromage Râpé', 'Parmesan', 'Mozzarella', 'Fromage à Tartiner', 'Yaourt Nature', 'Smen', 'Fromage de Chèvre', 'Gorgonzola', 'Cheddar', 'Edam'].map(n => ({ name: n, category: 'Produits Laitiers', supplier: 'Fromagerie de l\'Atlas', unit: 'kg', minPrice: 15, maxPrice: 120 })),
  // Épicerie (25)
  ...['Riz Blanc', 'Riz Basmati', 'Farine Blé', 'Semoule', 'Pâtes Spaghetti', 'Pâtes Penne', 'Macaroni', 'Sucre Semoule', 'Sucre Morceaux', 'Huile Tournesol', 'Huile d\'Olive', 'Vinaigre Blanc', 'Vinaigre Balsamique', 'Concentré de Tomates', 'Moutarde', 'Mayonnaise', 'Lentilles', 'Pois Chiches', 'Haricots Blancs', 'Amandes', 'Noix', 'Raisins Secs', 'Pruneaux', 'Olives Vertes', 'Olives Noires'].map(n => ({ name: n, category: 'Épicerie', supplier: 'Maghreb Céréales', unit: 'kg', minPrice: 10, maxPrice: 80 })),
  // Épices (20)
  ...['Sel', 'Poivre Noir', 'Poivre Blanc', 'Cumin', 'Paprika', 'Gingembre en Poudre', 'Curcuma', 'Safran', 'Cannelle en Poudre', 'Bâtons de Cannelle', 'Ras el Hanout', 'Coriandre en Poudre', 'Herbes de Provence', 'Origan', 'Clous de Girofle', 'Noix de Muscade', 'Piment Fort', 'Gingembre Frais', 'Graines de Sésame', 'Gomme Arabique'].map(n => ({ name: n, category: 'Épices', supplier: 'Epices & Saveurs', unit: 'kg', minPrice: 20, maxPrice: 300 })),
  // Boissons (15)
  ...['Eau Minérale 1.5L', 'Eau Gazeuse 1L', 'Coca Cola 33cl', 'Sprite 33cl', 'Fanta 33cl', 'Jus d\'Orange Brique', 'Jus de Pomme Brique', 'Sirop Grenadine', 'Sirop Menthe', 'Thé Vert', 'Café en Grains', 'Café Moulu', 'Schweppes 33cl', 'Red Bull', 'Lipton Ice Tea'].map(n => ({ name: n, category: 'Boissons', supplier: 'Distriboissons Maroc', unit: 'unité', minPrice: 5, maxPrice: 80 })),
  // Boulangerie (5)
  ...['Baguette', 'Pain Burger', 'Pain de Mie', 'Pain Complet', 'Viennoiseries Assorties'].map(n => ({ name: n, category: 'Boulangerie', supplier: 'Boulangerie Artisanale', unit: 'unité', minPrice: 2, maxPrice: 10 })),
  // Emballages (10)
  ...['Boîtes Pizza', 'Boîtes Burger', 'Sacs Papier', 'Sacs Plastique', 'Gobelets Carton', 'Gobelets Plastique', 'Couverts Jetables', 'Serviettes Papier', 'Papier Aluminium', 'Film Alimentaire'].map(n => ({ name: n, category: 'Emballages', supplier: 'Emballages Pro', unit: 'unité', minPrice: 0.5, maxPrice: 50 })),
  // Produits d'entretien (10)
  ...['Liquide Vaisselle', 'Eau de Javel', 'Nettoyant Sols', 'Dégraissant', 'Désinfectant', 'Savon Mains', 'Papier Toilette', 'Essuie-tout', 'Sacs Poubelle 100L', 'Éponges'].map(n => ({ name: n, category: 'Produits d\'entretien', supplier: 'Hygiène Plus', unit: 'unité', minPrice: 5, maxPrice: 150 }))
];

async function seed() {
  console.log('Starting restoration...');
  try {
    // We only clear inventoryItems and fournisseurs.
    // (Wait, to be safe and avoid duplicates, we clear these two)
    const collectionsToClear = ['inventoryItems', 'fournisseurs'];
    for (const c of collectionsToClear) {
      const snap = await getDocs(collection(db, c));
      let count = 0;
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
        count++;
      }
      console.log(`Cleared ${count} items from ${c}`);
    }

    for (const f of fournisseurs) {
      await addDoc(collection(db, 'fournisseurs'), {
        ...f,
        createdAt: new Date().toISOString()
      });
    }

    let invCount = 0;
    for (let i = 0; i < productTemplates.length; i++) {
      const tpl = productTemplates[i];
      const quantity = Math.floor(Math.random() * 50) + 10;
      const minStock = Math.floor(quantity * 0.3) + 2;
      
      const invPayload = {
        name: tpl.name,
        category: tpl.category,
        unit: tpl.unit,
        quantity: quantity,
        minStock: minStock,
        supplier: tpl.supplier,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        barcode: 'REF-' + Math.floor(100000 + Math.random() * 900000).toString(),
        expirationDate: null
      };
      
      if (['Produits Laitiers', 'Viandes', 'Poissons & Fruits de mer', 'Volailles'].includes(tpl.category)) {
        const expDays = Math.floor(Math.random() * 14) + 1;
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + expDays - 2); // Some expired
        invPayload.expirationDate = expDate.toISOString().split('T')[0];
      }

      await addDoc(collection(db, 'inventoryItems'), invPayload);
      invCount++;
    }

    console.log(`Done! Inserted ${fournisseurs.length} fournisseurs and ${invCount} inventoryItems (total ~180).`);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

seed();
