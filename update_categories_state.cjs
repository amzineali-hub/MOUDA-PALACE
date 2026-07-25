const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldCats = `  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('inventoryCategories');
    return saved ? JSON.parse(saved) : ['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes'];
  });

  const [stockItemsData, setStockItemsData] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('inventoryCategories', JSON.stringify(categories));
  }, [categories]);`;

const newCats = `  const [categories, setCategories] = useState<string[]>([]);
  const [stockItemsData, setStockItemsData] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inventoryCategories'), (snapshot) => {
      if (!snapshot.empty) {
        setCategories(snapshot.docs.map(doc => doc.data().name));
      } else {
        // Fallback if empty
        setCategories(['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes', 'Produits Laitiers', 'Légumes']);
      }
    });
    return () => unsub();
  }, []);`;

content = content.replace(oldCats, newCats);

// In the Add Modal we have a part that adds a category if it doesn't exist
// We need to update that to save to Firestore too
const oldAddCat = `              if (!categories.includes(category)) {
                setCategories([...categories, category]);
              }`;
const newAddCat = `              if (!categories.includes(category)) {
                try {
                  await addDoc(collection(db, 'inventoryCategories'), { name: category });
                } catch (err) {
                  console.error("Error adding category", err);
                }
              }`;

content = content.replace(oldAddCat, newAddCat);

fs.writeFileSync('src/App.tsx', content);
