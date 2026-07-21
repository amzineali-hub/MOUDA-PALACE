const fs = require('fs');
let content = fs.readFileSync('src/BlogWriterAI.tsx', 'utf8');

content = content.replace(/l\\\\'article/g, "l\\'article");
// Just replace manually
content = content.replace("showToast('Veuillez entrer un sujet pour l\\'article.');", "showToast(\"Veuillez entrer un sujet pour l'article.\");");
content = content.replace("showToast('Génération de l\\'article en cours avec Vertex AI...');", "showToast(\"Génération de l'article en cours avec Vertex AI...\");");
content = content.replace("showToast('Erreur lors de la génération de l\\'article.');", "showToast(\"Erreur lors de la génération de l'article.\");");

fs.writeFileSync('src/BlogWriterAI.tsx', content);
