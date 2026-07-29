const fs = require('fs');

const files = ['src/Accounting.tsx', 'src/RH.tsx'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes("import html2pdf")) {
    code = code.replace(
      "import { ",
      "import html2pdf from 'html2pdf.js';\nimport { "
    );
  }

  const printCode = `onClick={() => {
              showToast("Génération du PDF en cours...", "info");
              const element = document.getElementById('printable-dashboard');
              if (element) {
                const opt = {
                  margin: 10,
                  filename: 'export-mouda-palace.pdf',
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2, useCORS: true },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
                };
                html2pdf().set(opt).from(element).save().then(() => showToast("PDF généré", "success"));
              } else {
                try { if (window !== window.top) { const win = window.open(window.location.href, '_blank'); } else { window.print(); } } catch(e) {}
              }
            }}`;

  code = code.replace(
    /onClick=\{\(\) => \{ try \{ if \(window !== window\.top\)[\s\S]*?\}\}/g,
    printCode
  );

  // Wrap the main content in printable-dashboard id
  // Looking for <div className="space-y-6"> or similar main wrapper
  if (!code.includes('id="printable-dashboard"')) {
    code = code.replace(
      '<div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">',
      '<div id="printable-dashboard" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">'
    );
    code = code.replace(
      '<div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">',
      '<div id="printable-dashboard" className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">'
    );
  }

  fs.writeFileSync(file, code);
}
console.log("Updated accounting and rh print");
