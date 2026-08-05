const fs = require('fs');
let content = fs.readFileSync('src/Documentation.tsx', 'utf-8');

const targetStr = `                    if (text.includes("1.")) { colorClass = "text-blue-600"; mockupType = "achats"; }
                    else if (text.includes("2.")) { colorClass = "text-emerald-600"; mockupType = "inventaire"; }
                    else if (text.includes("3.")) { colorClass = "text-amber-600"; mockupType = "cuisine"; }
                    else if (text.includes("4.")) { colorClass = "text-rose-600"; mockupType = "recettes"; }
                    else if (text.includes("5.")) { colorClass = "text-cyan-600"; mockupType = "tables"; }
                    else if (text.includes("6.")) { colorClass = "text-fuchsia-600"; mockupType = "rh"; }
                    else if (text.includes("7.")) { colorClass = "text-orange-600"; mockupType = "pos"; }
                    else if (text.includes("8.")) { colorClass = "text-teal-600"; mockupType = "compta"; }`;

const replacementStr = `                    if (text.includes("1.")) { colorClass = "text-blue-600"; mockupType = "achats"; }
                    else if (text.includes("2.")) { colorClass = "text-emerald-600"; mockupType = "inventaire"; }
                    else if (text.includes("3.") && !text.includes("Production Journalière")) { colorClass = "text-amber-600"; mockupType = "cuisine"; }
                    else if (text.includes("3.") && text.includes("Production Journalière")) { colorClass = "text-amber-600"; mockupType = "cuisine"; /* Actually no specific mockup for production, fallback to cuisine */ }
                    else if (text.includes("4.") && !text.includes("Traçabilité HACCP")) { colorClass = "text-rose-600"; mockupType = "recettes"; }
                    else if (text.includes("4.") && text.includes("Traçabilité HACCP")) { colorClass = "text-teal-600"; mockupType = "compta"; /* HACCP Mockup? */ }
                    else if (text.includes("5.")) { colorClass = "text-cyan-600"; mockupType = "tables"; }
                    else if (text.includes("6.")) { colorClass = "text-fuchsia-600"; mockupType = "rh"; }
                    else if (text.includes("7.")) { colorClass = "text-orange-600"; mockupType = "pos"; }
                    else if (text.includes("8.")) { colorClass = "text-teal-600"; mockupType = "compta"; }`;

// Wait, let's just make it simpler
const simpleReplacement = `                    const lowerText = text.toLowerCase();
                    if (lowerText.includes("1.")) { colorClass = "text-blue-600"; mockupType = "achats"; }
                    if (lowerText.includes("2.")) { colorClass = "text-emerald-600"; mockupType = "inventaire"; }
                    if (lowerText.includes("3.")) { colorClass = "text-amber-600"; mockupType = "cuisine"; }
                    if (lowerText.includes("4.")) { colorClass = "text-rose-600"; mockupType = "recettes"; }
                    if (lowerText.includes("5.")) { colorClass = "text-cyan-600"; mockupType = "tables"; }
                    if (lowerText.includes("6.")) { colorClass = "text-fuchsia-600"; mockupType = "rh"; }
                    if (lowerText.includes("7.")) { colorClass = "text-orange-600"; mockupType = "pos"; }
                    if (lowerText.includes("8.")) { colorClass = "text-teal-600"; mockupType = "compta"; }
                    if (lowerText.includes("traçabilité haccp")) { colorClass = "text-green-600"; mockupType = "inventaire"; }
                    if (lowerText.includes("production journalière")) { colorClass = "text-amber-600"; mockupType = "cuisine"; }
                    if (lowerText.includes("tableau de bord") && lowerText.includes("5.")) { colorClass = "text-indigo-600"; mockupType = "compta"; }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, simpleReplacement);
  fs.writeFileSync('src/Documentation.tsx', content);
  console.log('h2 mapping fixed');
} else {
  console.log('target not found');
}
