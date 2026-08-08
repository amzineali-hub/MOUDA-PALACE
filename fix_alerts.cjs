const fs = require('fs');
let code = fs.readFileSync('src/NotificationSystem.tsx', 'utf8');

const search = `  // Tracking alerts
  const alertedStock = useRef<Set<string>>(new Set());
  const alertedHACCP = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Inventory Alerts
    const unsubInv = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      snapshot.docs.forEach(doc => {`;

const replace = `  // Tracking alerts
  const alertedStock = useRef<Set<string>>(new Set());
  const alertedHACCP = useRef<Set<string>>(new Set());
  
  const isInitialInvLoad = useRef(true);
  const isInitialHaccpLoad = useRef(true);

  useEffect(() => {
    // Inventory Alerts
    const unsubInv = onSnapshot(collection(db, 'inventoryItems'), (snapshot) => {
      const isInitial = isInitialInvLoad.current;
      if (isInitial) {
        isInitialInvLoad.current = false;
      }
      snapshot.docs.forEach(doc => {`;

code = code.replace(search, replace);

const haccpSearch = `    // HACCP DLC Alerts
    const unsubHaccp = onSnapshot(collection(db, 'haccpLots'), (snapshot) => {
      const now = new Date();
      const warningTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 hours

      snapshot.docs.forEach(doc => {`;

const haccpReplace = `    // HACCP DLC Alerts
    const unsubHaccp = onSnapshot(collection(db, 'haccpLots'), (snapshot) => {
      const isInitial = isInitialHaccpLoad.current;
      if (isInitial) {
        isInitialHaccpLoad.current = false;
      }
      const now = new Date();
      const warningTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 hours

      snapshot.docs.forEach(doc => {`;
      
code = code.replace(haccpSearch, haccpReplace);

const toastStockSearch = `              showToast(\`Rupture de Stock : \${item.name} (\${qty} \${item.unit || 'unité'})\`, 'error');`;
const toastStockReplace = `              if (!isInitial) showToast(\`Rupture de Stock : \${item.name} (\${qty} \${item.unit || 'unité'})\`, 'error');`;
code = code.replace(toastStockSearch, toastStockReplace);

const toastStockSearch2 = `              showToast(\`Alerte Stock : \${item.name} est sous le seuil minimal (\${qty} \${item.unit || 'unité'}).\`, 'error');`;
const toastStockReplace2 = `              if (!isInitial) showToast(\`Alerte Stock : \${item.name} est sous le seuil minimal (\${qty} \${item.unit || 'unité'}).\`, 'error');`;
code = code.replace(toastStockSearch2, toastStockReplace2);

const toastHaccpSearch1 = `              showToast(\`Alerte HACCP : Le lot \${lot.idLot} (\${lot.itemName}) est expiré !\`, 'error');`;
const toastHaccpReplace1 = `              if (!isInitial) showToast(\`Alerte HACCP : Le lot \${lot.idLot} (\${lot.itemName}) est expiré !\`, 'error');`;
code = code.replace(toastHaccpSearch1, toastHaccpReplace1);

const toastHaccpSearch2 = `              showToast(\`Alerte HACCP : Le lot \${lot.idLot} expire bientôt (\${dlc.toLocaleDateString('fr-FR')}).\`, 'error');`;
const toastHaccpReplace2 = `              if (!isInitial) showToast(\`Alerte HACCP : Le lot \${lot.idLot} expire bientôt (\${dlc.toLocaleDateString('fr-FR')}).\`, 'error');`;
code = code.replace(toastHaccpSearch2, toastHaccpReplace2);

fs.writeFileSync('src/NotificationSystem.tsx', code);
