const fs = require('fs');
let content = fs.readFileSync('src/Recettes.tsx', 'utf8');

const replacement = `
              try {
                const updatedData = {
                  nom: formData.get('nom'),
                  categorie: formData.get('categorie'),
                  cout: Number(formData.get('cout')),
                  prix: Number(formData.get('prix')),
                  marge: Math.round(((Number(formData.get('prix')) - Number(formData.get('cout'))) / Number(formData.get('prix'))) * 100) || 0,
                  tempsPrep: formData.get('tempsPrep'),
                  chef: formData.get('chef')
                };

                if (selectedRecette.id && !selectedRecette.id.startsWith('R00')) {
                  await updateDoc(doc(db, 'recettes', selectedRecette.id), updatedData);
                } else {
                  // Fallback for mock items
                  setRecettes(prev => prev.map(r => r.id === selectedRecette.id ? { ...r, ...updatedData } : r));
                }
                showToast("Recette modifiée avec succès");
                setIsEditRecetteModalOpen(false);
              }
`;

content = content.replace(
  /try \{\s*if \(selectedRecette\.id && !selectedRecette\.id\.startsWith\('R00'\)\) \{[\s\S]*?\}\s*showToast\("Recette modifiée avec succès"\);\s*setIsEditRecetteModalOpen\(false\);\s*\}/m,
  replacement.trim()
);

fs.writeFileSync('src/Recettes.tsx', content);
