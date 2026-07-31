const fs = require('fs');

let content = fs.readFileSync('src/Accounting.tsx', 'utf-8');

// Add states for inventoryItems and fournisseurs to fetch suppliers and categories
content = content.replace(
  /const \[isNewReceiptModalOpen, setIsNewReceiptModalOpen\] = useState\(false\);/,
  `const [isNewReceiptModalOpen, setIsNewReceiptModalOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  
  useEffect(() => {
    const unsubInv = onSnapshot(query(collection(db, 'inventoryItems')), (snapshot) => {
      setInventoryItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsubFourn = onSnapshot(query(collection(db, 'fournisseurs')), (snapshot) => {
      setFournisseurs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsubInv(); unsubFourn(); };
  }, []);

  const suppliersList = React.useMemo(() => {
    const dbSuppliers = inventoryItems.map((item: any) => item.supplier?.trim()).filter(Boolean).filter(s => s !== 'Non renseigné');
    const annuaireFournisseurs = fournisseurs.map(f => (f.name || f.nom)?.trim()).filter(Boolean);
    return Array.from(new Set([...dbSuppliers, ...annuaireFournisseurs])).sort();
  }, [inventoryItems, fournisseurs]);

  const categories = React.useMemo(() => {
    const defaultCats = ['Marchandise', 'Électricité', 'Marketing', 'Salaires', 'Loyer & Charges', 'Divers', 'Assurances', 'Frais Bancaires', 'Entretien & Réparations'];
    const dbCats = inventoryItems.map((item: any) => item.category?.trim()).filter(Boolean);
    const dbFournisseurCats = fournisseurs.map(f => (f.category || f.categorie)?.trim()).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dbCats, ...dbFournisseurCats])).sort();
  }, [inventoryItems, fournisseurs]);
`
);

// We need to make sure React is imported correctly since I used React.useMemo
// Let's add useMemo to the React import if it's not there, or just replace React.useMemo with useMemo
content = content.replace(/import \{ useEffect \} from 'react';/, "import { useEffect, useMemo } from 'react';");
content = content.replace(/React\.useMemo/g, "useMemo");

// Update the supplier input
content = content.replace(
  /<input name="supplier" required type="text" className="w-full border border-gray-200 rounded-lg p-2\.5 focus:outline-none focus:border-\[#F4C75B\]" placeholder="Nom du bénéficiaire" \/>/g,
  `<input name="supplier" list="dl-acc-sup" required type="text" className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F4C75B]" placeholder="Nom du bénéficiaire" />
                <datalist id="dl-acc-sup">
                  {suppliersList.map((sup, idx) => (
                    <option key={idx} value={sup} />
                  ))}
                </datalist>`
);

// Update the category datalist to use categories mapping
content = content.replace(
  /<datalist id="dl-omzfgo-1">[\s\S]*?<\/datalist>/g,
  `<datalist id="dl-omzfgo-1">
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} />
                  ))}
                </datalist>`
);

fs.writeFileSync('src/Accounting.tsx', content);
console.log("Updated Accounting.tsx");
