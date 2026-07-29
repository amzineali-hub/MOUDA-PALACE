const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

// Add import
if (!code.includes("import html2pdf")) {
    code = code.replace(
        "import { Plus, Trash2, Save, Printer, X, Image as ImageIcon } from 'lucide-react';",
        "import { Plus, Trash2, Save, Printer, X, Image as ImageIcon } from 'lucide-react';\nimport html2pdf from 'html2pdf.js';"
    );
}

// Update handlePrint
const oldHandlePrint = `  const handlePrint = () => {
    try {
      if (window !== window.top) {
         const win = window.open(window.location.href, '_blank');
         if (!win) showToast("L'impression est bloquée. Veuillez ouvrir l'application dans votre navigateur.", "error");
      } else {
         window.print();
      }
    } catch (e) {
         showToast("Impossible d'imprimer. Ouvrez l'app dans un nouvel onglet.", "error");
    }
  };`;

const newHandlePrint = `  const handlePrint = () => {
    try {
      showToast("Génération du PDF en cours...", "info");
      const element = document.getElementById('printable-menu');
      if (!element) return;
      const opt = {
        margin:       10,
        filename:     'menu-mouda-palace.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save().then(() => {
        showToast("PDF téléchargé avec succès", "success");
      });
    } catch (e) {
         showToast("Erreur lors de la génération du PDF.", "error");
    }
  };`;

code = code.replace(oldHandlePrint, newHandlePrint);

// Wrap templates with id="printable-menu"
code = code.replace(
  "{printTemplate === 'moderne' ? (",
  "<div id=\"printable-menu\">\n          {printTemplate === 'moderne' ? ("
);

// We need to close the div. Let's see the end of printView.
