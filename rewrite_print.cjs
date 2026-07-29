const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

if (!code.includes("import html2pdf")) {
    code = code.replace(
        "import { Plus, Trash2, Save, Printer, X, Image as ImageIcon } from 'lucide-react';",
        "import { Plus, Trash2, Save, Printer, X, Image as ImageIcon } from 'lucide-react';\nimport html2pdf from 'html2pdf.js';"
    );
}

const handlePrintOld = /const handlePrint = \(\) => \{[\s\S]*?catch \(e\) \{[\s\S]*?\}\n  \};/;
const handlePrintNew = `const handlePrint = () => {
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

code = code.replace(handlePrintOld, handlePrintNew);

// Add printable wrapper
code = code.replace(
    "{printTemplate === 'moderne' ? (",
    "<div id=\"printable-menu\">\n          {printTemplate === 'moderne' ? ("
);

code = code.replace(
    "          )}\n        </div>\n      </div>\n    );\n  }",
    "          )}\n          </div>\n        </div>\n      </div>\n    );\n  }"
);

fs.writeFileSync('src/MenuGenerator.tsx', code);
console.log("Updated handlePrint successfully");
