const fs = require('fs');
let content = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

const searchFnStart = `  const filteredItems = (() => {`;
const searchFnEnd = `  })();`;
const replacementFn = `  const filteredItems = (() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      
      // Search in menuItems
      const matchedMenu = menuItems.filter(item => item.name.toLowerCase().includes(q));
      const menuNames = new Set(matchedMenu.map(m => m.name.toLowerCase()));
      
      // Search in recettes
      const matchedRecettes = recettes.filter(r => (r.nom || '').toLowerCase().includes(q) && !menuNames.has((r.nom || '').toLowerCase()));
      
      const additionalRecettes = matchedRecettes.map(r => ({
        id: 'recette-' + (r.id || r.fbId || Math.random().toString()),
        name: r.nom,
        category: r.categorie || 'Autres',
        price: (r.prixVente || r.coutTotal || '0') + ' MAD',
        numPrice: parseFloat((r.prixVente || r.coutTotal || '0').toString().replace(/[^0-9.]/g, '')),
        imageUrl: r.photo || r.image || ''
      }));

      return [...matchedMenu, ...additionalRecettes];
    }
    return menuItems.filter(item => item.category === activeCategory);
  })();`;

// Wait, I need to fetch inventoryItems first
const unsubInventoryStart = `    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {`;
const unsubInventoryReplacement = `    const unsubTables = onSnapshot(query(collection(db, 'tables')), (snapshot) => {
      setTables(snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id })));
    });
    const unsubRecettes = onSnapshot(query(collection(db, 'recettes')), (snapshot) => {
      setRecettes(snapshot.docs.map(doc => ({ ...doc.data(), fbId: doc.id })));
    });
    const unsubInventory = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsubTables(); unsubRecettes(); unsubInventory(); };
  }, []);`;

// We also need to define inventoryItems state
