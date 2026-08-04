const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('const [fichesTechniques, setFichesTechniques] = useState<any[]>([])')) {
  content = content.replace(
    'const [recipes, setRecipes] = useState<any[]>([]);',
    'const [recipes, setRecipes] = useState<any[]>([]);\n  const [fichesTechniques, setFichesTechniques] = useState<any[]>([]);'
  );
  
  content = content.replace(
    "const unsub = onSnapshot(collection(db, 'recipes'), (snapshot) => {",
    "const unsubFiches = onSnapshot(collection(db, 'fiches_techniques'), (snapshot) => {\n      setFichesTechniques(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));\n    });\n    const unsub = onSnapshot(collection(db, 'recipes'), (snapshot) => {"
  );
  
  content = content.replace(
    "return () => unsub();",
    "return () => { unsub(); unsubFiches(); };"
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log("Patched state");
