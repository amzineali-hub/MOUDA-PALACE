const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

// Remove confirm
code = code.replace(
  "    if (confirm('Voulez-vous vraiment supprimer cet article du menu ?')) {\n      try {\n        await deleteDoc(doc(db, 'menu_items', id));\n        showToast('Article supprimé avec succès');\n      } catch (error) {\n        console.error(error);\n        showToast('Erreur lors de la suppression', 'error');\n      }\n    }",
  "    try {\n      await deleteDoc(doc(db, 'menu_items', id));\n      showToast('Article supprimé avec succès');\n    } catch (error) {\n      console.error(error);\n      showToast('Erreur lors de la suppression', 'error');\n    }"
);

// Change motion.button to motion.div
code = code.replace(
  /<motion\.button\s+layout\s+initial=\{\{ opacity: 0, scale: 0\.8, y: 20 \}\}/g,
  '<motion.div\n                        layout\n                        initial={{ opacity: 0, scale: 0.8, y: 20 }}'
);
code = code.replace(
  /<\/div>\s*<\/motion\.button>/g,
  '</div>\n                      </motion.div>'
);

fs.writeFileSync('src/POSTactile.tsx', code);
