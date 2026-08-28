import React, { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const PdfPage = React.forwardRef<HTMLDivElement, { imageUrl: string; pageNumber: number }>(({ imageUrl, pageNumber }, ref) => (
  <div ref={ref} className="w-full h-full bg-white border border-gray-100 overflow-hidden flex items-center justify-center">
    <img src={imageUrl} alt={`Page ${pageNumber}`} className="w-full h-full object-contain" />
  </div>
));

const PdfCoverPage = React.forwardRef<HTMLDivElement, { title: string; subtitle: string }>(({ title, subtitle }, ref) => (
  <div ref={ref} className="relative w-full h-full bg-white border border-gray-100 overflow-hidden flex flex-col items-center justify-center text-center px-6">
    <div className="w-full max-w-[92%] flex flex-col items-center -translate-y-1">
      <img src="/mouda-1-1-1.png" alt="Logo Mouda Palace" className="w-44 h-52 object-contain mb-4" />
      <h1 className="text-3xl md:text-4xl font-serif tracking-[0.18em] text-[#265C6D] uppercase">{title}</h1>
      <p className="mt-2 text-sm md:text-base tracking-[0.2em] text-[#265C6D] uppercase">{subtitle}</p>
    </div>
  </div>
));

// Rasterise chaque page du PDF (via le proxy /api/proxy-document pour contourner le CORS) et les
// présente dans un livre feuilletable — même mécanisme quel que soit le document (brochure plats,
// carte boissons...), seul le PDF source change d'un usage à l'autre.
function PdfPageFlipViewer({ pdfUrl, coverTitle, coverSubtitle }: { pdfUrl: string; coverTitle: string; coverSubtitle: string }) {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    const loadPdfPages = async () => {
      setLoading(true);
      setError(null);
      setPageImages([]);
      setCurrentPage(0);

      try {
        const proxyUrl = `/api/proxy-document?url=${encodeURIComponent(pdfUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Proxy fetch failed: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const images: string[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.6 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas non disponible');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          images.push(canvas.toDataURL('image/jpeg', 0.92));
        }

        if (!cancelled) setPageImages(images);
      } catch (loadError) {
        console.error('PDF flipbook error:', loadError);
        if (!cancelled) setError('Impossible de charger le document. Ouvrez le PDF dans un nouvel onglet pour vérifier son accès.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPdfPages();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  if (loading) {
    return <div className="h-[520px] flex items-center justify-center text-gray-500">Chargement des pages...</div>;
  }

  if (error || pageImages.length === 0) {
    return <div className="h-[520px] flex flex-col items-center justify-center gap-3 text-center text-gray-500 px-6"><FileText size={36} className="text-gray-300" /><p>{error || 'Aucune page trouvée dans ce PDF.'}</p></div>;
  }

  const pages = [
    <PdfCoverPage key={`${pdfUrl}-cover`} title={coverTitle} subtitle={coverSubtitle} />,
    ...pageImages.map((imageUrl, index) => (
      <PdfPage key={`${pdfUrl}-${index}`} imageUrl={imageUrl} pageNumber={index + 1} />
    ))
  ];

  return (
    <>
      <div className="w-full max-w-6xl flex items-center justify-center gap-4 px-4 py-4">
        <button
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
          disabled={currentPage <= 0}
          className="shrink-0 p-3 rounded-full bg-white shadow-sm border border-gray-100 text-[#265C6D] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeft size={20} />
        </button>

        <HTMLFlipBook
          ref={bookRef}
          width={380}
          height={500}
          size="stretch"
          minWidth={320}
          maxWidth={500}
          minHeight={420}
          maxHeight={600}
          showCover={true}
          maxShadowOpacity={0.3}
          className="shadow-xl"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={600}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
          renderOnlyPageLengthChange={true}
          onFlip={(event: any) => setCurrentPage(event.data)}
        >
          {pages}
        </HTMLFlipBook>

        <button
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
          disabled={currentPage >= pages.length - 1}
          className="shrink-0 p-3 rounded-full bg-white shadow-sm border border-gray-100 text-[#265C6D] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Page suivante"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <p className="text-xs text-gray-400 pb-3 text-center">Page {currentPage + 1} / {pages.length}</p>
    </>
  );
}

// Section complète "document PDF feuilletable", branchée sur un fichier de `restaurant_documents`
// (uploadé via Fichiers & Modèles) retrouvé par son nom exact. Réutilisée pour la brochure des
// plats marocains (Flipbook) et pour la carte des boissons (Génération du Menu) — même
// fonctionnement, seul le fichier source change.
export default function PdfDocumentFlipbook({
  documentName,
  title,
  subtitle,
  coverTitle = 'Mouda Palace',
  coverSubtitle
}: {
  documentName: string;
  title: string;
  subtitle: string;
  coverTitle?: string;
  coverSubtitle?: string;
}) {
  const [docUrl, setDocUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'restaurant_documents'), (snapshot) => {
      const match = snapshot.docs
        .map(d => d.data() as { name?: string; url?: string })
        .find(document => document.name?.trim().toLowerCase() === documentName.trim().toLowerCase());
      setDocUrl(match?.url || null);
    });
    return () => unsub();
  }, [documentName]);

  return (
    <section className="w-full max-w-6xl mt-8 pt-6 border-t border-gray-200 mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-3xl font-serif text-[#265C6D]">{title}</h2>
        <p className="text-gray-500 mt-1">{subtitle}</p>
      </div>

      {docUrl ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={18} className="text-[#265C6D] shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">{documentName}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={docUrl} target="_blank" rel="noopener noreferrer" title="Ouvrir dans un nouvel onglet" className="p-2 text-[#265C6D] hover:bg-gray-50 rounded-lg">
                <ExternalLink size={17} />
              </a>
              <a href={docUrl} download={documentName} title="Télécharger" className="p-2 text-[#265C6D] hover:bg-gray-50 rounded-lg">
                <Download size={17} />
              </a>
            </div>
          </div>
          <PdfPageFlipViewer pdfUrl={docUrl} coverTitle={coverTitle} coverSubtitle={coverSubtitle || title} />
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 px-6 text-center text-gray-400">
          <FileText size={36} className="mx-auto mb-3 text-gray-300" />
          <p>Ajoutez le fichier « {documentName} » dans « Fichiers &amp; Modèles » pour l&apos;afficher ici.</p>
        </div>
      )}
    </section>
  );
}
