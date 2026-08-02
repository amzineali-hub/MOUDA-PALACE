const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

const missingFournisseurs = [
  { nom: 'Les Domaines Agricoles', contact: 'Samir', telephone: '0661112233', categorie: 'Fruits & Légumes', email: 'samir@domaines.ma' },
  { nom: 'Cave de Meknès', contact: 'Jalil', telephone: '0662223344', categorie: 'Boissons Alcoolisées', email: 'jalil@cavesmeknes.ma' },
  { nom: 'Conserveries Marocaines', contact: 'Tarik', telephone: '0663334455', categorie: 'Conserves', email: 'tarik@conserveries.ma' },
  { nom: 'Sauces & Condiments', contact: 'Hicham', telephone: '0664445566', categorie: 'Sauces', email: 'hicham@sauces.ma' },
  { nom: 'Sirops du Monde', contact: 'Yassine', telephone: '0665556677', categorie: 'Sirops', email: 'yassine@sirops.ma' },
  { nom: 'Equipement CHR', contact: 'Anass', telephone: '0666667788', categorie: 'Matériel', email: 'anass@equipementchr.ma' },
  { nom: 'Presta Services', contact: 'Mounia', telephone: '0667778899', categorie: 'Services', email: 'mounia@prestaservices.ma' },
  { nom: 'Pro Hygiène', contact: 'Sara', telephone: '0668889900', categorie: 'Hygiène & Entretien', email: 'sara@prohygiene.ma' },
  { nom: 'Trésors de la Terre', contact: 'Nabil', telephone: '0669990011', categorie: 'Fruits Secs', email: 'nabil@tresors.ma' },
  { nom: 'Jardin des Herbes', contact: 'Leila', telephone: '0660001122', categorie: 'Herbes', email: 'leila@jardinherbes.ma' }
];

const productTemplates = [
  // Fruits Secs (10)
  ...['Amandes Décortiquées', 'Noix Entières', 'Pistaches', 'Noix de Cajou', 'Noisettes', 'Raisins Secs Blancs', 'Raisins Secs Noirs', 'Pruneaux', 'Abricots Secs', 'Dattes Majhoul'].map(n => ({ name: n, category: 'Fruits Secs', supplier: 'Trésors de la Terre', unit: 'kg', minPrice: 30, maxPrice: 150 })),
  // Herbes (10)
  ...['Coriandre Fraîche', 'Persil Frais', 'Menthe Fraîche', 'Ciboulette', 'Basilic Frais', 'Thym Frais', 'Romarin', 'Aneth', 'Estragon', 'Sauge'].map(n => ({ name: n, category: 'Herbes', supplier: 'Jardin des Herbes', unit: 'botte', minPrice: 2, maxPrice: 10 })),
  // Boissons Alcoolisées (15)
  ...['Vin Rouge AOC', 'Vin Blanc', 'Vin Rosé', 'Bière Blonde', 'Bière Brune', 'Vodka', 'Whisky', 'Gin', 'Rhum', 'Tequila', 'Champagne', 'Cognac', 'Liqueur de Café', 'Pastis', 'Cidre'].map(n => ({ name: n, category: 'Boissons Alcoolisées', supplier: 'Cave de Meknès', unit: 'bouteille', minPrice: 50, maxPrice: 1500 })),
  // Conserves (15)
  ...['Olives Vertes Dénoyautées', 'Olives Noires', 'Câpres', 'Cornichons', 'Thon à l\'huile', 'Sardines en boîte', 'Anchois', 'Concentré de Tomate 1kg', 'Champignons Émincés', 'Cœurs de Palmier', 'Maïs Doux', 'Petits Pois en conserve', 'Haricots Verts en conserve', 'Ananas au sirop', 'Pêches au sirop'].map(n => ({ name: n, category: 'Conserves', supplier: 'Conserveries Marocaines', unit: 'boîte', minPrice: 10, maxPrice: 80 })),
  // Sauces (12)
  ...['Ketchup 5kg', 'Mayonnaise 5kg', 'Moutarde de Dijon', 'Sauce Soja', 'Sauce Huître', 'Sauce Pimentée (Harissa)', 'Sauce Barbecue', 'Sauce César', 'Vinaigrette', 'Coulis de Tomate', 'Tabasco', 'Sauce Tartare'].map(n => ({ name: n, category: 'Sauces', supplier: 'Sauces & Condiments', unit: 'bidon', minPrice: 20, maxPrice: 200 })),
  // Sirops (8)
  ...['Sirop de Menthe', 'Sirop de Grenadine', 'Sirop de Fraise', 'Sirop de Pêche', 'Sirop de Citron', 'Sirop de Caramel', 'Sirop de Vanille', 'Sirop d\'Orgeat'].map(n => ({ name: n, category: 'Sirops', supplier: 'Sirops du Monde', unit: 'bouteille', minPrice: 30, maxPrice: 80 })),
  // Matériel (8)
  ...['Assiettes Blanches', 'Verres à Eau', 'Couverts Inox', 'Casserole Pro', 'Poêle Anti-adhésive', 'Couteau Chef', 'Planche à Découper', 'Bac Gastronorme'].map(n => ({ name: n, category: 'Matériel', supplier: 'Equipement CHR', unit: 'unité', minPrice: 50, maxPrice: 500 })),
  // Services (3)
  ...['Maintenance Frigo', 'Nettoyage Hotte', 'Désinsectisation'].map(n => ({ name: n, category: 'Services', supplier: 'Presta Services', unit: 'prestation', minPrice: 300, maxPrice: 1500 })),
  // Hygiène & Entretien (10)
  ...['Gel Hydroalcoolique', 'Gants Latex', 'Charlotte', 'Masque', 'Tablier Jetable', 'Brosse', 'Balai Mop', 'Seau Essoreur', 'Chiffon Microfibre', 'Désodorisant'].map(n => ({ name: n, category: 'Hygiène & Entretien', supplier: 'Pro Hygiène', unit: 'unité', minPrice: 10, maxPrice: 120 })),
];

async function seedMissing() {
  console.log('Starting adding missing data...');
  try {
    for (const f of missingFournisseurs) {
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
      
      if (['Conserves', 'Boissons Alcoolisées', 'Sauces', 'Sirops'].includes(tpl.category)) {
        const expDays = Math.floor(Math.random() * 365) + 30;
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + expDays);
        invPayload.expirationDate = expDate.toISOString().split('T')[0];
      }

      await addDoc(collection(db, 'inventoryItems'), invPayload);
      invCount++;
    }

    console.log(`Done! Inserted ${missingFournisseurs.length} fournisseurs and ${invCount} inventoryItems.`);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

seedMissing();
