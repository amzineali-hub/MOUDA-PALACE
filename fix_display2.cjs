const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const regex4 = /\{selectedFournisseur\.categorie \|\| selectedFournisseur\.category \|\| 'Non renseignée'\}/g;
const replacement4 = `{(() => {
                        const c = (selectedFournisseur.categorie || selectedFournisseur.category || 'Non renseignée').trim();
                        if (c === "Produits d'entretien" || c === "Produits de maintenance") return "Hygiène & Entretien"; 
                        if (c === "Boulangerie & Pâtisserie" || c === "Boulangerie et Pâtisserie" || c === "Boulangerie") return "Pâtisserie";
                        return c;
                      })()}`;

code = code.replace(regex4, replacement4);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
