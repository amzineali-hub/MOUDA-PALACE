import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

// Génère un vrai fichier PDF téléchargé localement, sans passer par window.print() — son
// comportement (bouton "Enregistrer" vs impression directe) dépend de l'imprimante par défaut du
// poste, ce qui donne un résultat différent selon les postes (imprimante branchée → impression
// directe, pas de moyen simple d'enregistrer). Même mécanisme que Accounting.tsx / RH.tsx
// (`downloadDocumentAsPdf` / `generateAndStorePdf`), extrait ici pour être réutilisé sans dupliquer
// à nouveau cette logique dans chaque nouveau document imprimable (ex: ProductionJournaliere.tsx).
export async function downloadDocumentAsPdf(html: string, filename: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-99999px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  // Volontairement très grand : document.body.scrollHeight est plafonné à AU MOINS la hauteur de
  // l'iframe — une hauteur trop petite ferait capturer une image gonflée de vide.
  iframe.style.height = '4000px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  try {
    const idoc = iframe.contentDocument;
    if (!idoc) throw new Error('iframe indisponible');
    const loadPromise = new Promise<void>((resolve) => { iframe.onload = () => resolve(); });
    idoc.open();
    idoc.write(html);
    idoc.close();
    await Promise.race([loadPromise, new Promise<void>((resolve) => setTimeout(resolve, 3000))]);

    const images = Array.from(idoc.images);
    await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); })));
    await new Promise((res) => setTimeout(res, 200));

    const bodyEl = idoc.body;
    // Mesure la vraie fin du contenu via le bas du pied de page (pas scrollHeight, plafonné par
    // la hauteur de l'iframe — voir commentaire ci-dessus).
    const footerEl = idoc.querySelector('.lh-footer-bar');
    const contentHeight = footerEl ? Math.ceil(footerEl.getBoundingClientRect().bottom) : bodyEl.scrollHeight;
    const dataUrl = await toPng(bodyEl, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      width: bodyEl.scrollWidth,
      height: contentHeight
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const scale = Math.min(pageWidth / bodyEl.scrollWidth, pageHeight / contentHeight, 1);
    const imgWidth = bodyEl.scrollWidth * scale;
    const imgHeight = contentHeight * scale;
    pdf.addImage(dataUrl, 'PNG', (pageWidth - imgWidth) / 2, 0, imgWidth, imgHeight);
    pdf.save(`${filename.replace(/[\\/:*?"<>|]/g, '-')}.pdf`);
  } finally {
    document.body.removeChild(iframe);
  }
}
