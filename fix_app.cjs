const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Move stockItemsData up
code = code.replace(
`  const categories = useMemo(() => {
    const defaultCats = ['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes', 'Poissons', 'Légumes', 'Boulangerie', 'Produits Laitiers'];
    const dbCats = stockItemsData.map(item => item.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats])).sort();
  }, [stockItemsData]);
  
  const [stockItemsData, setStockItemsData] = useState<any[]>([]);`,
`  const [stockItemsData, setStockItemsData] = useState<any[]>([]);

  const categories = useMemo(() => {
    const defaultCats = ['Épices', 'Épicerie', 'Viandes', 'Fruits Secs', 'Herbes', 'Poissons', 'Légumes', 'Boulangerie', 'Produits Laitiers'];
    const dbCats = stockItemsData.map(item => item.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats])).sort();
  }, [stockItemsData]);`
);

fs.writeFileSync('src/App.tsx', code);
