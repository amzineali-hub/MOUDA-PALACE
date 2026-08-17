import React, { useEffect, useMemo, useRef, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react';

const CATEGORIES = ['Entrées', 'Plats Principaux', 'Desserts', 'Boissons'];

const CoverPage = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div ref={ref} className="w-full h-full bg-[#265C6D] text-white flex flex-col items-center justify-center p-8 text-center">
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
));

const CategoryDividerPage = React.forwardRef<HTMLDivElement, { category: string }>(({ category }, ref) => (
  <div ref={ref} className="w-full h-full bg-[#FDFBF7] flex items-center justify-center p-8 text-center border border-gray-100">
    <h2 className="text-2xl font-serif text-[#265C6D] uppercase tracking-widest">{category}</h2>
  </div>
));

const DishPage = React.forwardRef<HTMLDivElement, { item: any }>(({ item }, ref) => (
  <div ref={ref} className="w-full h-full bg-white flex flex-col border border-gray-100 overflow-hidden">
    <div className="h-1/2 bg-gray-100 shrink-0">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <UtensilsCrossed size={48} />
        </div>
      )}
    </div>
    <div className="flex-1 p-5 flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-[#F4C75B] font-medium mb-1">{item.category}</span>
      <h3 className="text-lg font-serif text-gray-900 mb-2">{item.name}</h3>
      <p className="text-xs text-gray-500 leading-relaxed flex-1 overflow-hidden">{item.desc}</p>
      <p className="text-right text-[#265C6D] font-serif font-semibold text-base mt-2">{item.price}</p>
    </div>
  </div>
));

const BackCoverPage = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div ref={ref} className="w-full h-full bg-[#265C6D] text-white flex flex-col items-center justify-center p-8 text-center">
    <p className="text-sm tracking-widest uppercase text-[#F4C75B] mb-2">Merci de votre visite</p>
    <p className="text-xs text-white/70">moudapalace.com</p>
  </div>
));

export default function Flipbook() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'menu_items'), orderBy('category')), (snapshot) => {
      setMenuItems(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, []);

  const pages = useMemo(() => {
    const result: React.ReactNode[] = [<CoverPage key="cover" />];
    CATEGORIES.forEach(cat => {
      const items = menuItems.filter(i => i.category === cat);
      if (items.length === 0) return;
      result.push(<CategoryDividerPage key={`div-${cat}`} category={cat} />);
      items.forEach(item => result.push(<DishPage key={item.id} item={item} />));
    });
    result.push(<BackCoverPage key="back" />);
    return result;
  }, [menuItems]);

  const totalPages = pages.length;

  return (
    <div className="p-4 md:p-6 w-full h-[calc(100vh-2rem)] flex flex-col items-center">
      <div className="mb-4 text-center shrink-0">
        <h2 className="text-3xl font-serif text-[#265C6D]">Flipbook des Plats</h2>
        <p className="text-gray-500 mt-1">Aperçu feuilletable de votre carte, généré depuis Menus digitaux.</p>
      </div>

      {menuItems.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Aucun plat trouvé — ajoutez des plats dans "Menus digitaux" pour les voir apparaître ici.
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center gap-6">
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
              width={280}
              height={400}
              size="stretch"
              minWidth={320}
              maxWidth={900}
              minHeight={440}
              maxHeight={1100}
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
          <p className="text-xs text-gray-400 mt-2 shrink-0">Page {currentPage + 1} / {totalPages}</p>
        </>
      )}
    </div>
  );
}
