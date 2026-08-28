import React, { useEffect, useMemo, useRef, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText, UtensilsCrossed, ClipboardList, PlayCircle, X } from 'lucide-react';
import { getVideoEmbedUrl } from './lib/videoUtils';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const CATEGORIES = ['Entrées', 'Plats Principaux', 'Desserts', 'Boissons'];

const CoverPage = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div ref={ref} className="relative w-full h-full bg-[#265C6D] text-white overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center p-8 text-center">
      <div
        className="h-20 w-24 mb-6 bg-[#F4C75B]"
        style={{
          maskImage: 'url(/mouda-1-1-1.png)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: 'url(/mouda-1-1-1.png)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center'
        }}
      />
      <h1 className="text-3xl font-serif tracking-[0.2em] uppercase mb-2">Mouda Palace</h1>
      <p className="text-xs tracking-[0.3em] uppercase text-[#F4C75B]">Carte des Plats</p>
    </div>
  </div>
));

const CategoryDividerPage = React.forwardRef<HTMLDivElement, { category: string }>(({ category }, ref) => (
  <div ref={ref} className="relative w-full h-full bg-[#FDFBF7] border border-gray-100 overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-8 text-center">
      <h2 className="text-2xl font-serif text-[#265C6D] uppercase tracking-widest">{category}</h2>
    </div>
  </div>
));

const DishPage = React.forwardRef<HTMLDivElement, { item: any; hasFiche: boolean; onOpenFiche?: (dishName: string) => void; onPlayVideo?: (url: string) => void }>(
  ({ item, hasFiche, onOpenFiche, onPlayVideo }, ref) => (
  <div ref={ref} className="w-full h-full bg-white flex flex-col border border-gray-100 overflow-hidden">
    <div className="h-1/2 bg-gray-100 shrink-0 relative">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <UtensilsCrossed size={48} />
        </div>
      )}
      {item.videoUrl && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onPlayVideo?.(item.videoUrl); }}
          className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-black/90 transition-colors"
          title="Voir la vidéo"
        >
          <PlayCircle size={18} />
        </button>
      )}
    </div>
    <div className="flex-1 p-5 flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-[#F4C75B] font-medium mb-1">{item.category}</span>
      <h3 className="text-lg font-serif text-gray-900 mb-2">{item.name}</h3>
      <p className="text-xs text-gray-500 leading-relaxed flex-1 overflow-hidden">{item.desc}</p>
      {hasFiche && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onOpenFiche?.(item.name); }}
          className="flex items-center gap-1.5 text-[11px] font-medium text-[#265C6D] hover:underline mt-1 self-start"
        >
          <ClipboardList size={12} /> Voir la fiche technique
        </button>
      )}
      <p className="text-right text-[#265C6D] font-serif font-semibold text-base mt-2">{item.price}</p>
    </div>
  </div>
));

const BackCoverPage = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div ref={ref} className="relative w-full h-full bg-[#265C6D] text-white overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center p-8 text-center">
      <p className="text-sm tracking-widest uppercase text-[#F4C75B] mb-2">Merci de votre visite</p>
      <p className="text-xs text-white/70">moudapalace.com</p>
    </div>
  </div>
));

const BrochurePage = React.forwardRef<HTMLDivElement, { imageUrl: string; pageNumber: number }>(({ imageUrl, pageNumber }, ref) => (
  <div ref={ref} className="w-full h-full bg-white border border-gray-100 overflow-hidden flex items-center justify-center">
    <img src={imageUrl} alt={`Page ${pageNumber} de la brochure`} className="w-full h-full object-contain" />
  </div>
));

const BrochureCoverPage = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div ref={ref} className="relative w-full h-full bg-white border border-gray-100 overflow-hidden flex flex-col items-center justify-center text-center px-6">
    <div className="w-full max-w-[92%] flex flex-col items-center -translate-y-1">
      <img src="/mouda-1-1-1.png" alt="Logo Mouda Palace" className="w-44 h-52 object-contain mb-4" />
      <h1 className="text-3xl md:text-4xl font-serif tracking-[0.18em] text-[#265C6D] uppercase">Mouda Palace</h1>
      <p className="mt-2 text-sm md:text-base tracking-[0.2em] text-[#265C6D] uppercase">Restaurant Lounge - Rooftop</p>
    </div>
  </div>
));

function BrochureFlipbook({ brochureUrl }: { brochureUrl: string }) {
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
        let arrayBuffer: ArrayBuffer;

        const proxyUrl = `/api/proxy-document?url=${encodeURIComponent(brochureUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Proxy fetch failed: ${response.status}`);
        arrayBuffer = await response.arrayBuffer();

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
        console.error('Brochure PDF error:', loadError);
        if (!cancelled) setError('Impossible de charger la brochure. Ouvrez le PDF dans un nouvel onglet pour vérifier son accès.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPdfPages();
    return () => { cancelled = true; };
  }, [brochureUrl]);

  if (loading) {
    return <div className="h-[520px] flex items-center justify-center text-gray-500">Chargement des pages de la brochure...</div>;
  }

  if (error || pageImages.length === 0) {
    return <div className="h-[520px] flex flex-col items-center justify-center gap-3 text-center text-gray-500 px-6"><FileText size={36} className="text-gray-300" /><p>{error || 'Aucune page trouvée dans ce PDF.'}</p></div>;
  }

  const pages = [
    <BrochureCoverPage key={`${brochureUrl}-cover`} />,
    ...pageImages.map((imageUrl, index) => (
      <BrochurePage key={`${brochureUrl}-${index}`} imageUrl={imageUrl} pageNumber={index + 1} />
    ))
  ];

  return (
    <>
      <div className="w-full max-w-6xl flex items-center justify-center gap-4 px-4 py-4">
        <button
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
          disabled={currentPage <= 0}
          className="shrink-0 p-3 rounded-full bg-white shadow-sm border border-gray-100 text-[#265C6D] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Page précédente de la brochure"
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
          aria-label="Page suivante de la brochure"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <p className="text-xs text-gray-400 pb-3">Page {currentPage + 1} / {pages.length}</p>
    </>
  );
}

export default function Flipbook({ onOpenFiche }: { onOpenFiche?: (dishName: string) => void } = {}) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [recettes, setRecettes] = useState<any[]>([]);
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'menu_items'), orderBy('category')), (snapshot) => {
      setMenuItems(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, []);

  // Pour savoir quels plats ont une fiche technique liée (bouton "Voir la fiche technique").
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'fiches_techniques'), (snapshot) => {
      setRecettes(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'restaurant_documents'), (snapshot) => {
      const brochure = snapshot.docs
        .map(d => d.data() as { name?: string; url?: string })
        .find(document => document.name?.trim().toLowerCase() === 'brochures plats marocains.pdf');
      setBrochureUrl(brochure?.url || null);
    });
    return () => unsub();
  }, []);

  const pages = useMemo(() => {
    const result: React.ReactNode[] = [<CoverPage key="cover" />];
    CATEGORIES.forEach(cat => {
      const items = menuItems.filter(i => i.category === cat);
      if (items.length === 0) return;
      result.push(<CategoryDividerPage key={`div-${cat}`} category={cat} />);
      items.forEach(item => {
        const hasFiche = recettes.some(r => (r.nom || r.name || '').trim().toLowerCase() === (item.name || '').trim().toLowerCase());
        result.push(
          <DishPage
            key={item.id}
            item={item}
            hasFiche={hasFiche}
            onOpenFiche={onOpenFiche}
            onPlayVideo={setPlayingVideoUrl}
          />
        );
      });
    });
    result.push(<BackCoverPage key="back" />);
    return result;
  }, [menuItems, recettes, onOpenFiche]);

  const totalPages = pages.length;

  return (
    <div className="p-4 md:p-6 w-full flex flex-col items-center relative z-10">
      <div className="mb-4 text-center">
        <h2 className="text-3xl font-serif text-[#265C6D]">Flipbook des Plats</h2>
        <p className="text-gray-500 mt-1">Aperçu feuilletable de votre carte, généré depuis Menus digitaux.</p>
      </div>

      {menuItems.length === 0 ? (
        <div className="flex items-center justify-center text-gray-400 py-12">
          Aucun plat trouvé — ajoutez des plats dans "Menus digitaux" pour les voir apparaître ici.
        </div>
      ) : (
        <>
          <div className="w-full max-w-6xl flex items-center justify-center gap-6">
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
              onFlip={(e: any) => setCurrentPage(e.data)}
            >
              {pages}
            </HTMLFlipBook>

            <button
              onClick={() => bookRef.current?.pageFlip()?.flipNext()}
              disabled={currentPage >= totalPages - 1}
              className="shrink-0 p-3 rounded-full bg-white shadow-sm border border-gray-100 text-[#265C6D] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Page suivante"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Page {currentPage + 1} / {totalPages}</p>
        </>
      )}

      <section className="w-full max-w-6xl mt-8 pt-6 border-t border-gray-200">
        <div className="mb-4 text-center">
          <h2 className="text-3xl font-serif text-[#265C6D]">Flipbook des Brochures</h2>
          <p className="text-gray-500 mt-1">Brochures Plats Marocains</p>
        </div>

        {brochureUrl ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={18} className="text-[#265C6D] shrink-0" />
                <span className="text-sm font-medium text-gray-700 truncate">Brochures Plats Marocains.pdf</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={brochureUrl} target="_blank" rel="noopener noreferrer" title="Ouvrir dans un nouvel onglet" className="p-2 text-[#265C6D] hover:bg-gray-50 rounded-lg">
                  <ExternalLink size={17} />
                </a>
                <a href={brochureUrl} download="Brochures Plats Marocains.pdf" title="Télécharger la brochure" className="p-2 text-[#265C6D] hover:bg-gray-50 rounded-lg">
                  <Download size={17} />
                </a>
              </div>
            </div>
            <BrochureFlipbook brochureUrl={brochureUrl} />
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 px-6 text-center text-gray-400">
            <FileText size={36} className="mx-auto mb-3 text-gray-300" />
            <p>Ajoutez le fichier « Brochures Plats Marocains.pdf » dans « Fichiers & Modèles » pour l&apos;afficher ici.</p>
          </div>
        )}
      </section>

      {/* Lecture vidéo d'un plat, déclenchée depuis le badge lecture sur sa page du flipbook */}
      {playingVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={() => setPlayingVideoUrl(null)}>
          <button
            onClick={() => setPlayingVideoUrl(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            {getVideoEmbedUrl(playingVideoUrl) ? (
              <iframe
                src={getVideoEmbedUrl(playingVideoUrl) as string}
                title="Vidéo du plat"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video rounded-xl bg-black"
              />
            ) : (
              <video src={playingVideoUrl} controls autoPlay className="w-full max-h-[75vh] rounded-xl bg-black" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
