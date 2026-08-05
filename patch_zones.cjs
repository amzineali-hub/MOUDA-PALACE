const fs = require('fs');
let content = fs.readFileSync('src/ZonesStockage.tsx', 'utf-8');

const targetStr = `export default function ZonesStockage({ inventoryItems }: { inventoryItems: any[] }) {`;
const replaceStr = `export default function ZonesStockage() {
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/ZonesStockage.tsx', content);
console.log("Patched ZonesStockage.tsx to fetch own items");
