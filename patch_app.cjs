const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add menuItems state
content = content.replace(
  "const [fichesTechniques, setFichesTechniques] = useState<any[]>([]);",
  "const [fichesTechniques, setFichesTechniques] = useState<any[]>([]);\n  const [menuItems, setMenuItems] = useState<any[]>([]);"
);

// Subscribe to menu_items
const hookTarget = `  useEffect(() => {
    const unsubFiches = onSnapshot(collection(db, 'fiches_techniques'), (snapshot) => {
      setFichesTechniques(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsub = onSnapshot(collection(db, 'recipes'), (snapshot) => {
      setRecipes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsub(); unsubFiches(); };
  }, []);`;

const hookReplacement = `  useEffect(() => {
    const unsubFiches = onSnapshot(collection(db, 'fiches_techniques'), (snapshot) => {
      setFichesTechniques(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsubMenu = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    const unsub = onSnapshot(collection(db, 'recipes'), (snapshot) => {
      setRecipes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => { unsub(); unsubFiches(); unsubMenu(); };
  }, []);`;

content = content.replace(hookTarget, hookReplacement);

// Change text "Produits Semi-finis" to "Plats Semi-finis"
content = content.replace("{tab === 'semi_finished' && 'Produits Semi-finis'}", "{tab === 'semi_finished' && 'Plats Semi-finis'}");
content = content.replace("<h3 className=\"text-lg font-medium text-gray-900\">Produits Semi-finis</h3>", "<h3 className=\"text-lg font-medium text-gray-900\">Plats Semi-finis</h3>");
content = content.replace("<Plus size={16} /> Nouveau Produit", "<Plus size={16} /> Nouveau Plat");
content = content.replace("Aucun produit semi-fini enregistré.", "Aucun plat semi-fini enregistré.");
content = content.replace("{semiFinishedForm.id ? 'Éditer le Produit' : 'Nouveau Produit Semi-fini'}", "{semiFinishedForm.id ? 'Éditer le Plat' : 'Nouveau Plat Semi-fini'}");
content = content.replace("<label className=\"block text-sm font-medium text-gray-700 mb-1\">Nom du produit</label>", "<label className=\"block text-sm font-medium text-gray-700 mb-1\">Nom du plat</label>");
content = content.replace("placeholder=\"Ex: Pâte à pizza\"", "placeholder=\"Ex: Tajine, Pâte à pizza, etc.\"");

// Update datalist
const datalistTarget = `                    "Pâte à pizza", "Sauce tomate", "Pâte brisée", "Pâte feuilletée", 
                    "Fond de veau", "Bouillon de volaille", "Crème pâtissière", "Sauce béchamel",
                    ...recipes.map(r => r.name), ...fichesTechniques.map(f => f.name)
                  ])).map((name: any, idx) => (`;

const datalistReplacement = `                    "Pâte à pizza", "Sauce tomate", "Pâte brisée", "Pâte feuilletée", 
                    "Fond de veau", "Bouillon de volaille", "Crème pâtissière", "Sauce béchamel",
                    ...recipes.map(r => r.name), ...fichesTechniques.map(f => f.nom || f.name), ...menuItems.map(m => m.name)
                  ])).filter(Boolean).map((name: any, idx) => (`;

content = content.replace(datalistTarget, datalistReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx");
