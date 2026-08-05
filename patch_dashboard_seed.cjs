const fs = require('fs');
let content = fs.readFileSync('src/TableauDeBord.tsx', 'utf-8');

// Add imports
const importTarget1 = `import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';`;
const importReplacement1 = `import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';`;
content = content.replace(importTarget1, importReplacement1);

const importTarget2 = `import { motion } from 'framer-motion';`;
const importReplacement2 = `import { motion } from 'framer-motion';\nimport { useToast } from './context/ToastContext';\nimport { Database } from 'lucide-react';`;
content = content.replace(importTarget2, importReplacement2);

const funcStartTarget = `export default function TableauDeBord() {`;
const funcStartReplacement = `export default function TableauDeBord() {\n  const { showToast } = useToast();\n  const [isSeeding, setIsSeeding] = useState(false);`;
content = content.replace(funcStartTarget, funcStartReplacement);

const insertAfterHooksTarget = `    return () => {
      unsubInv();
      unsubRec();
      unsubProd();
      unsubLots();
      unsubTemp();
      unsubCmd();
    };
  }, []);`;
const insertAfterHooksReplacement = `    return () => {
      unsubInv();
      unsubRec();
      unsubProd();
      unsubLots();
      unsubTemp();
      unsubCmd();
    };
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      // 1. Fournisseurs
      await addDoc(collection(db, 'fournisseurs'), {
        nom: 'Farine de Fès',
        contact: '0600000001',
        email: 'contact@farinedefes.ma',
        categorie: 'Sec',
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'fournisseurs'), {
        nom: 'Boucherie Atlas',
        contact: '0600000002',
        email: 'contact@boucherieatlas.ma',
        categorie: 'Viande',
        createdAt: serverTimestamp()
      });

      // 2. Ingrédients (inventoryItems)
      const i1 = await addDoc(collection(db, 'inventoryItems'), {
        name: 'Poulet Entier',
        category: 'Viande',
        quantity: 50,
        unit: 'kg',
        price: 35,
        minThreshold: 10,
        zone: 'Chambre Froide',
        createdAt: serverTimestamp()
      });
      const i2 = await addDoc(collection(db, 'inventoryItems'), {
        name: 'Citron Confit',
        category: 'Épicerie',
        quantity: 5,
        unit: 'kg',
        price: 40,
        minThreshold: 2,
        zone: 'Économat',
        createdAt: serverTimestamp()
      });
      const i3 = await addDoc(collection(db, 'inventoryItems'), {
        name: 'Oignon Blanc',
        category: 'Légumes',
        quantity: 20,
        unit: 'kg',
        price: 5,
        minThreshold: 5,
        zone: 'Économat',
        createdAt: serverTimestamp()
      });

      // 3. Fiche technique (fiches_techniques)
      await addDoc(collection(db, 'fiches_techniques'), {
        nom: 'Tajine de Poulet Citron Confit',
        categorie: 'Plat Principal',
        portions: 4,
        prixVente: 120,
        coutMatiere: 45,
        foodCost: (45 / 120) * 100,
        margeBrute: 120 - 45,
        ingredients: [
          { nom: 'Poulet Entier', quantite: 1, unite: 'kg', prixUnitaire: 35, unitePrix: 'kg', coutCalculated: 35 },
          { nom: 'Citron Confit', quantite: 0.1, unite: 'kg', prixUnitaire: 40, unitePrix: 'kg', coutCalculated: 4 },
          { nom: 'Oignon Blanc', quantite: 0.5, unite: 'kg', prixUnitaire: 5, unitePrix: 'kg', coutCalculated: 2.5 }
        ],
        updatedAt: serverTimestamp()
      });

      // 4. Lot sous-vide (haccpLots)
      await addDoc(collection(db, 'haccpLots'), {
        lotNumber: \`LOT-\${new Date().toISOString().slice(0,10).replace(/-/g,'')}-\${Math.floor(Math.random()*1000).toString().padStart(3, '0')}\`,
        itemId: i1.id,
        itemName: 'Poulet Entier (Portionné)',
        operator: 'Chef Ahmed',
        tempSealing: 4.5,
        tempRefrigeration: -19.0,
        quantity: 10,
        dlcDays: 30,
        dlcDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Validé',
        createdAt: serverTimestamp()
      });

      // 5. Temperature log
      await addDoc(collection(db, 'temperatureLogs'), {
        temperature: -19.5,
        operator: 'Chef Ahmed',
        room: 'Chambre Négative',
        timestamp: serverTimestamp()
      });

      showToast("Données de démo injectées avec succès !");
    } catch (error) {
      console.error("Erreur lors du seeding", error);
      showToast("Erreur lors de l'injection des données", "error");
    } finally {
      setIsSeeding(false);
    }
  };`;
content = content.replace(insertAfterHooksTarget, insertAfterHooksReplacement);

const headerTarget = `</div>
      </div>

      {/* KPIs */}`;
const headerReplacement = `</div>
        <button
          onClick={handleSeedData}
          disabled={isSeeding}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-medium transition-colors disabled:opacity-50"
          title="Injecter données de démo"
        >
          <Database size={18} />
          {isSeeding ? 'Injection...' : 'Données Démo'}
        </button>
      </div>

      {/* KPIs */}`;
content = content.replace(headerTarget, headerReplacement);

fs.writeFileSync('src/TableauDeBord.tsx', content);
console.log("Patched TableauDeBord.tsx with Seed function");
