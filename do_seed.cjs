const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, addDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || '(default)');

const NEW_DATA = [
  {
    "category": "Entrées",
    "name": "La Fameuse Soupe Traditionnelle Harira servie avec ses Dattes, Chebbakia",
    "price": 60,
    "ingredients": [
      { "name": "Tomates", "quantity": 0.2, "unit": "kg" },
      { "name": "Viande de boeuf", "quantity": 0.05, "unit": "kg" },
      { "name": "Céleri", "quantity": 0.02, "unit": "kg" },
      { "name": "Pois chiches", "quantity": 0.05, "unit": "kg" },
      { "name": "Lentilles", "quantity": 0.03, "unit": "kg" },
      { "name": "Dattes", "quantity": 3, "unit": "pièce" }
    ]
  },
  {
    "category": "Entrées",
    "name": "Seffa: Cheveux d'Ange parfumé à la Cannelle, garni de Raisins Secs et Amandes",
    "price": 80,
    "ingredients": [
      { "name": "Cheveux d'ange", "quantity": 0.15, "unit": "kg" },
      { "name": "Cannelle", "quantity": 0.01, "unit": "kg" },
      { "name": "Raisins Secs", "quantity": 0.03, "unit": "kg" },
      { "name": "Amandes", "quantity": 0.03, "unit": "kg" }
    ]
  },
  {
    "category": "Entrées",
    "name": "Mosaïque de Salades Marocaines",
    "price": 90,
    "ingredients": [
      { "name": "Tomates", "quantity": 0.1, "unit": "kg" },
      { "name": "Poivrons", "quantity": 0.1, "unit": "kg" },
      { "name": "Aubergines", "quantity": 0.1, "unit": "kg" },
      { "name": "Huile d'olive", "quantity": 0.02, "unit": "L" }
    ]
  },
  {
    "category": "Entrées",
    "name": "Sélection de Briouates: Feuilletés farcis à la Viande Hachée, aux Légumes frais, et au Fromage",
    "price": 90,
    "ingredients": [
      { "name": "Feuille de brick", "quantity": 3, "unit": "pièce" },
      { "name": "Viande Hachée", "quantity": 0.08, "unit": "kg" },
      { "name": "Fromage", "quantity": 0.03, "unit": "kg" },
      { "name": "Légumes", "quantity": 0.05, "unit": "kg" }
    ]
  },
  {
    "category": "Entrées",
    "name": "Foie de Boeuf à la Charmoula Marocaine",
    "price": 120,
    "ingredients": [
      { "name": "Foie de Boeuf", "quantity": 0.15, "unit": "kg" },
      { "name": "Coriandre", "quantity": 0.01, "unit": "kg" },
      { "name": "Ail", "quantity": 0.01, "unit": "kg" },
      { "name": "Huile d'olive", "quantity": 0.02, "unit": "L" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Pastilla Fassie à la Volaille : Tourte croustillante farcie, aux Amandes, goût sucré salé",
    "price": 140,
    "ingredients": [
      { "name": "Poulet", "quantity": 0.2, "unit": "kg" },
      { "name": "Amandes", "quantity": 0.05, "unit": "kg" },
      { "name": "Feuille de brick", "quantity": 3, "unit": "pièce" },
      { "name": "Oeufs", "quantity": 2, "unit": "pièce" },
      { "name": "Sucre", "quantity": 0.02, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Tajine Berbère aux Légumes de saison, Citron confit",
    "price": 130,
    "ingredients": [
      { "name": "Carottes", "quantity": 0.1, "unit": "kg" },
      { "name": "Courgettes", "quantity": 0.1, "unit": "kg" },
      { "name": "Pommes de terre", "quantity": 0.1, "unit": "kg" },
      { "name": "Citron confit", "quantity": 0.02, "unit": "kg" },
      { "name": "Olives", "quantity": 0.03, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Tajine Kefta aux Oeufs et Sauce Tomate",
    "price": 150,
    "ingredients": [
      { "name": "Viande Hachée", "quantity": 0.2, "unit": "kg" },
      { "name": "Tomates", "quantity": 0.15, "unit": "kg" },
      { "name": "Oeufs", "quantity": 2, "unit": "pièce" },
      { "name": "Oignons", "quantity": 0.05, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Tajine de Crevettes à la Marocaine",
    "price": 150,
    "ingredients": [
      { "name": "Crevettes", "quantity": 0.2, "unit": "kg" },
      { "name": "Tomates", "quantity": 0.1, "unit": "kg" },
      { "name": "Coriandre", "quantity": 0.01, "unit": "kg" },
      { "name": "Ail", "quantity": 0.01, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Tajine de Poulet aux Frites, Olives et Citron confit",
    "price": 170,
    "ingredients": [
      { "name": "Poulet", "quantity": 0.25, "unit": "kg" },
      { "name": "Pommes de terre", "quantity": 0.15, "unit": "kg" },
      { "name": "Olives", "quantity": 0.03, "unit": "kg" },
      { "name": "Citron confit", "quantity": 0.02, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Tajine de boeuf confit, legumes, safran, citron",
    "price": 180,
    "ingredients": [
      { "name": "Viande de boeuf", "quantity": 0.25, "unit": "kg" },
      { "name": "Carottes", "quantity": 0.1, "unit": "kg" },
      { "name": "Safran", "quantity": 0.001, "unit": "kg" },
      { "name": "Citron confit", "quantity": 0.02, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Couscous Végétarien aux Légumes frais et Raisins Secs caramélisés",
    "price": 130,
    "ingredients": [
      { "name": "Semoule", "quantity": 0.2, "unit": "kg" },
      { "name": "Carottes", "quantity": 0.05, "unit": "kg" },
      { "name": "Courgettes", "quantity": 0.05, "unit": "kg" },
      { "name": "Navets", "quantity": 0.05, "unit": "kg" },
      { "name": "Raisins Secs", "quantity": 0.03, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Couscous Fassi Traditionnel: Poulet ou Boeuf aux Légumes frais et Raisins Secs caramélisés",
    "price": 170,
    "ingredients": [
      { "name": "Semoule", "quantity": 0.2, "unit": "kg" },
      { "name": "Poulet", "quantity": 0.2, "unit": "kg" },
      { "name": "Oignons", "quantity": 0.1, "unit": "kg" },
      { "name": "Raisins Secs", "quantity": 0.03, "unit": "kg" },
      { "name": "Pois chiches", "quantity": 0.03, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Tajine d'Agneau aux Pruneaux, Abricots et Amandes grillées",
    "price": 220,
    "ingredients": [
      { "name": "Agneau", "quantity": 0.25, "unit": "kg" },
      { "name": "Pruneaux", "quantity": 0.05, "unit": "kg" },
      { "name": "Abricots secs", "quantity": 0.05, "unit": "kg" },
      { "name": "Amandes", "quantity": 0.02, "unit": "kg" }
    ]
  },
  {
    "category": "Entrées",
    "name": "Crème de Légumes d'hiver",
    "price": 70,
    "ingredients": [
      { "name": "Carottes", "quantity": 0.05, "unit": "kg" },
      { "name": "Poireaux", "quantity": 0.05, "unit": "kg" },
      { "name": "Pommes de terre", "quantity": 0.05, "unit": "kg" },
      { "name": "Crème fraîche", "quantity": 0.02, "unit": "L" }
    ]
  },
  {
    "category": "Entrées",
    "name": "Mezze Libanais (Houmous, Tzatziki, Baba Ghanoush)",
    "price": 80,
    "ingredients": [
      { "name": "Pois chiches", "quantity": 0.05, "unit": "kg" },
      { "name": "Tahini", "quantity": 0.02, "unit": "kg" },
      { "name": "Aubergines", "quantity": 0.05, "unit": "kg" },
      { "name": "Yaourt nature", "quantity": 0.05, "unit": "kg" }
    ]
  },
  {
    "category": "Entrées",
    "name": "Arancini à la Bolognaise parfumée au Safran Bio",
    "price": 90,
    "ingredients": [
      { "name": "Riz", "quantity": 0.1, "unit": "kg" },
      { "name": "Viande Hachée", "quantity": 0.05, "unit": "kg" },
      { "name": "Chapelure", "quantity": 0.02, "unit": "kg" },
      { "name": "Safran", "quantity": 0.001, "unit": "kg" }
    ]
  },
  {
    "category": "Entrées",
    "name": "Tartare de Thon Rouge aromatisé au Gingembre, au Citron Vert et à l'Huile d'Argan",
    "price": 120,
    "ingredients": [
      { "name": "Thon Rouge", "quantity": 0.15, "unit": "kg" },
      { "name": "Gingembre", "quantity": 0.01, "unit": "kg" },
      { "name": "Citron vert", "quantity": 1, "unit": "pièce" },
      { "name": "Huile d'Argan", "quantity": 0.01, "unit": "L" }
    ]
  },
  {
    "category": "Entrées",
    "name": "Coupe fraîcheur à la Mozzarella panée, quinoa, Courgette grillée, et Fruits de saison",
    "price": 90,
    "ingredients": [
      { "name": "Mozzarella", "quantity": 0.1, "unit": "kg" },
      { "name": "Quinoa", "quantity": 0.05, "unit": "kg" },
      { "name": "Courgettes", "quantity": 0.05, "unit": "kg" },
      { "name": "Fruits de saison", "quantity": 0.05, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Brochettes de volaille aux trois saveurs Curry miel, marinade marocaine, sauce grec, frites",
    "price": 160,
    "ingredients": [
      { "name": "Poulet", "quantity": 0.2, "unit": "kg" },
      { "name": "Miel", "quantity": 0.02, "unit": "kg" },
      { "name": "Curry", "quantity": 0.01, "unit": "kg" },
      { "name": "Pommes de terre", "quantity": 0.1, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Pavé de saumon, déclinaison de poivron et ratatouille de légumes, sauce à l'orange",
    "price": 190,
    "ingredients": [
      { "name": "Saumon", "quantity": 0.2, "unit": "kg" },
      { "name": "Poivrons", "quantity": 0.05, "unit": "kg" },
      { "name": "Courgettes", "quantity": 0.05, "unit": "kg" },
      { "name": "Orange", "quantity": 1, "unit": "pièce" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Mouda Burger, Pain brioché maison, viande de bœuf maturée, tombée de Daghmira, fromage, frites",
    "price": 160,
    "ingredients": [
      { "name": "Pain burger", "quantity": 1, "unit": "pièce" },
      { "name": "Viande de boeuf", "quantity": 0.15, "unit": "kg" },
      { "name": "Oignons", "quantity": 0.05, "unit": "kg" },
      { "name": "Fromage", "quantity": 0.02, "unit": "kg" },
      { "name": "Pommes de terre", "quantity": 0.1, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Filet de bœuf, mousseline de pommes de terre parfumée à la truffe, carotte glacé jus à la réglisse",
    "price": 220,
    "ingredients": [
      { "name": "Viande de boeuf", "quantity": 0.2, "unit": "kg" },
      { "name": "Pommes de terre", "quantity": 0.15, "unit": "kg" },
      { "name": "Truffes", "quantity": 0.01, "unit": "kg" },
      { "name": "Carottes", "quantity": 0.05, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Semoule, Frites, Riz, Salade Verte, Légumes sautés",
    "price": 25,
    "ingredients": [
      { "name": "Semoule", "quantity": 0.1, "unit": "kg" },
      { "name": "Pommes de terre", "quantity": 0.1, "unit": "kg" },
      { "name": "Riz", "quantity": 0.1, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Linguine alla Stracciatella Tomates cerises, olives, câpre, Parmesan, cœur de la burrata",
    "price": 140,
    "ingredients": [
      { "name": "Pâtes", "quantity": 0.15, "unit": "kg" },
      { "name": "Tomates cerises", "quantity": 0.05, "unit": "kg" },
      { "name": "Burrata", "quantity": 0.05, "unit": "kg" },
      { "name": "Parmesan", "quantity": 0.02, "unit": "kg" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Penne alla crema di zucchine e salmone Courgette, Saumon frais, citron vert",
    "price": 160,
    "ingredients": [
      { "name": "Pâtes", "quantity": 0.15, "unit": "kg" },
      { "name": "Courgettes", "quantity": 0.05, "unit": "kg" },
      { "name": "Saumon", "quantity": 0.05, "unit": "kg" },
      { "name": "Crème fraîche", "quantity": 0.03, "unit": "L" }
    ]
  },
  {
    "category": "Plats Principaux",
    "name": "Risotto crémeux con gamberi et crème de Safran",
    "price": 160,
    "ingredients": [
      { "name": "Riz", "quantity": 0.15, "unit": "kg" },
      { "name": "Crevettes", "quantity": 0.1, "unit": "kg" },
      { "name": "Crème fraîche", "quantity": 0.03, "unit": "L" },
      { "name": "Safran", "quantity": 0.001, "unit": "kg" }
    ]
  },
  {
    "category": "Desserts",
    "name": "Mouda Pastilla à la Poire caramélisée et Pistache, parfumée à la Gomme Arabique",
    "price": 90,
    "ingredients": [
      { "name": "Feuille de brick", "quantity": 2, "unit": "pièce" },
      { "name": "Poire", "quantity": 1, "unit": "pièce" },
      { "name": "Pistaches", "quantity": 0.02, "unit": "kg" },
      { "name": "Sucre", "quantity": 0.02, "unit": "kg" }
    ]
  },
  {
    "category": "Desserts",
    "name": "Assortiment de Gâteaux Marocains, Thé à la Menthe fraîche",
    "price": 80,
    "ingredients": [
      { "name": "Amandes", "quantity": 0.05, "unit": "kg" },
      { "name": "Farine", "quantity": 0.05, "unit": "kg" },
      { "name": "Miel", "quantity": 0.02, "unit": "kg" }
    ]
  },
  {
    "category": "Desserts",
    "name": "Assiette de Fruits frais découpés",
    "price": 80,
    "ingredients": [
      { "name": "Fruits de saison", "quantity": 0.2, "unit": "kg" }
    ]
  },
  {
    "category": "Desserts",
    "name": "Paris Brest à la Noisette, sauce chocolat",
    "price": 90,
    "ingredients": [
      { "name": "Farine", "quantity": 0.05, "unit": "kg" },
      { "name": "Noisettes", "quantity": 0.02, "unit": "kg" },
      { "name": "Chocolat", "quantity": 0.03, "unit": "kg" },
      { "name": "Oeufs", "quantity": 1, "unit": "pièce" }
    ]
  },
  {
    "category": "Boissons",
    "name": "Thé à la Menthe Fraîche",
    "price": 25,
    "ingredients": [
      { "name": "Thé vert", "quantity": 0.01, "unit": "kg" },
      { "name": "Menthe", "quantity": 0.02, "unit": "kg" },
      { "name": "Sucre", "quantity": 0.05, "unit": "kg" }
    ]
  },
  {
    "category": "Boissons",
    "name": "Jus d'Orange Pressé",
    "price": 35,
    "ingredients": [
      { "name": "Orange", "quantity": 0.4, "unit": "kg" }
    ]
  },
  {
    "category": "Boissons",
    "name": "Cocktail Mouda Palace",
    "price": 50,
    "ingredients": [
      { "name": "Fruits de saison", "quantity": 0.15, "unit": "kg" },
      { "name": "Sucre", "quantity": 0.01, "unit": "kg" }
    ]
  },
  {
    "category": "Boissons",
    "name": "Eau Minérale 1L",
    "price": 20,
    "ingredients": [
      { "name": "Eau", "quantity": 1, "unit": "L" }
    ]
  }
];

async function seed() {
  console.log('Starting seed...');
  try {
    const collectionsToClear = ['menu_items', 'fiches_techniques', 'inventoryItems', 'recettes', 'recipes'];
    for (const c of collectionsToClear) {
      const snap = await getDocs(collection(db, c));
      let count = 0;
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
        count++;
      }
      console.log(`Cleared ${count} items from ${c}`);
    }

    const ingredientsSet = new Map();
    
    let menuCount = 0;
    let ficheCount = 0;

    for (const item of NEW_DATA) {
      const ingList = item.ingredients.map((ing, i) => {
        if (!ingredientsSet.has(ing.name)) {
          ingredientsSet.set(ing.name, {
            name: ing.name,
            category: 'Ingrédients',
            unit: ing.unit,
            quantity: 100,
            minStock: 10,
            supplier: 'Marché',
            createdAt: new Date().toISOString()
          });
        }
        return {
          id: Date.now().toString() + '-' + i,
          nom: ing.name,
          quantite: ing.quantity,
          unite: ing.unit,
          prixUnitaire: 10,
          unitePrix: ing.unit,
          coutCalculated: ing.quantity * 10
        };
      });

      const fichePayload = {
        nom: item.name,
        categorie: item.category,
        portions: 1,
        prixVente: item.price,
        coutMatiere: ingList.reduce((acc, ing) => acc + ing.coutCalculated, 0),
        foodCost: 25,
        margeBrute: item.price - ingList.reduce((acc, ing) => acc + ing.coutCalculated, 0),
        ingredients: ingList,
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'fiches_techniques'), fichePayload);
      ficheCount++;

      const menuPayload = {
        name: item.name,
        price: item.price.toString() + ' MAD',
        numPrice: item.price,
        category: item.category,
        active: true,
        desc: ''
      };
      
      await addDoc(collection(db, 'menu_items'), menuPayload);
      menuCount++;
    }

    let invCount = 0;
    for (const inv of Array.from(ingredientsSet.values())) {
      await addDoc(collection(db, 'inventoryItems'), inv);
      invCount++;
    }

    console.log(`Done! Inserted ${menuCount} menu_items, ${ficheCount} fiches_techniques, ${invCount} inventoryItems.`);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

seed();
