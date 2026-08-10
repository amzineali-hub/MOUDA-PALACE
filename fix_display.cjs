const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const regex3 = /\{fournisseur\.categorie \|\| fournisseur\.category \|\| 'Général'\}/g;
const replacement3 = `{(() => {
                            const c = (fournisseur.categorie || fournisseur.category || 'Général').trim();
                            if (c === "Produits d'entretien" || c === "Produits de maintenance") return "Hygiène & Entretien"; 
                            if (c === "Boulangerie & Pâtisserie" || c === "Boulangerie et Pâtisserie" || c === "Boulangerie") return "Pâtisserie";
                            return c;
                          })()}`;

code = code.replace(regex3, replacement3);
fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
