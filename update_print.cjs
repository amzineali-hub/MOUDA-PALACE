const fs = require('fs');
let content = fs.readFileSync('src/MenuGenerator.tsx', 'utf-8');

// Add the printTemplate state
const stateLine = `  const [isPrintView, setIsPrintView] = useState(false);`;
content = content.replace(stateLine, stateLine + `\n  const [printTemplate, setPrintTemplate] = useState<'moderne' | 'traditionnel'>('moderne');`);

// We know the block starts with `if (isPrintView) {` and ends before `  return (\n    <div className="p-4 md:p-8 max-w-7xl`
const startSearch = 'if (isPrintView) {';
const startIdx = content.indexOf(startSearch);
const endSearch = '  return (\n    <div className="p-4 md:p-8';
const endIdx = content.indexOf(endSearch);

if (startIdx !== -1 && endIdx !== -1) {
  const oldBlock = content.substring(startIdx, endIdx);
  const newBlock = `if (isPrintView) {
    return (
      <div className="bg-white min-h-screen p-8 print:p-0">
        <div className="max-w-5xl mx-auto print:max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 print:hidden">
            <button onClick={() => setIsPrintView(false)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
              <X size={20} /> Retour
            </button>
            <div className="flex items-center gap-4">
              <select 
                value={printTemplate} 
                onChange={(e) => setPrintTemplate(e.target.value as any)}
                className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-sm font-medium focus:outline-none focus:border-[#DDA956]"
              >
                <option value="moderne">Modèle Moderne (Minimaliste)</option>
                <option value="traditionnel">Modèle Traditionnel (Marocain)</option>
              </select>
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-[#c4954b] transition-colors">
                <Printer size={18} /> Imprimer
              </button>
            </div>
          </div>

          {printTemplate === 'moderne' ? (
            <div className="print:p-4">
              <div className="text-center mb-16 border-b-2 border-[#DDA956] pb-10">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full border border-[#DDA956] flex items-center justify-center text-[#DDA956]">
                    <Utensils size={40} />
                  </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-[0.2em]">Mouda Palace</h1>
                <p className="text-2xl text-gray-500 font-serif italic tracking-wider">La Carte</p>
              </div>

              <div className="space-y-16">
                {categories.map((cat) => {
                  const itemsInCat = menuItems.filter(i => i.category === cat);
                  if (itemsInCat.length === 0) return null;

                  return (
                    <div key={cat} className="break-inside-avoid">
                      <h2 className="text-3xl font-serif text-[#DDA956] text-center mb-10 uppercase tracking-widest flex items-center justify-center gap-6">
                        <span className="h-[1px] w-12 bg-[#DDA956]"></span> 
                        {cat} 
                        <span className="h-[1px] w-12 bg-[#DDA956]"></span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {itemsInCat.map(item => (
                          <div key={item.id} className="flex gap-5 break-inside-avoid">
                            {item.imageUrl && (
                              <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-[#DDA956]/30 shadow-sm print:border-gray-200">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 pt-1">
                              <div className="flex justify-between items-baseline mb-2 gap-4">
                                <h3 className="text-xl font-serif font-bold text-gray-900">{item.name}</h3>
                                <div className="flex-1 border-b-2 border-dotted border-gray-300 relative -top-1"></div>
                                <span className="text-lg font-serif font-bold text-[#DDA956] whitespace-nowrap">{item.price}</span>
                              </div>
                              <p className="text-sm text-gray-600 italic leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="relative bg-[#FAF5E9] border-[12px] border-[#3E2723] p-8 md:p-12 min-h-[1100px] shadow-2xl rounded-sm print:shadow-none print:border-[8px] print:p-8">
              <div className="absolute inset-4 border-2 border-[#8D6E63] pointer-events-none rounded-sm"></div>
              
              <div className="text-center mb-12 relative z-10 pt-4">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full border border-[#8D6E63] flex items-center justify-center text-[#5D4037] bg-[#FAF5E9] shadow-inner">
                    <Utensils size={40} />
                  </div>
                </div>
                <h1 className="text-5xl font-serif font-bold text-[#3E2723] mb-4 uppercase tracking-[0.1em] drop-shadow-sm">Mouda Palace</h1>
                <p className="text-2xl text-[#5D4037] font-serif italic tracking-widest border-y border-[#8D6E63] py-3 inline-block px-12">Maison Marocaine</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 relative z-10 mt-16">
                <div className="space-y-16">
                  {categories.map((cat) => {
                    const itemsInCat = menuItems.filter(i => i.category === cat);
                    if (itemsInCat.length === 0) return null;

                    return (
                      <div key={cat} className="break-inside-avoid">
                        <div className="relative text-center mb-10">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#8D6E63]"></div>
                          </div>
                          <h2 className="relative inline-block bg-[#3E2723] text-[#FAF5E9] px-8 py-2.5 text-2xl font-serif font-bold uppercase tracking-widest shadow-md">
                            Nos {cat}
                          </h2>
                        </div>
                        <div className="space-y-4">
                          {itemsInCat.map(item => (
                            <div key={item.id} className="flex justify-between items-baseline gap-4 break-inside-avoid pl-2">
                              <h3 className="text-xl font-serif font-semibold text-[#3E2723] tracking-wide">{item.name}</h3>
                              <div className="flex-1 border-b-[3px] border-dotted border-[#8D6E63] relative -top-1.5 opacity-60"></div>
                              <span className="text-xl font-serif font-bold text-[#5D4037] whitespace-nowrap">{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden lg:flex flex-col gap-10 mt-4 pr-4">
                   {menuItems.filter(i => i.imageUrl).slice(0, 4).map((item, index) => (
                      <div key={index} className="relative group">
                        <div className="absolute inset-0 bg-[#3E2723] rounded-full translate-x-2 translate-y-2 opacity-20"></div>
                        <div className="relative rounded-full overflow-hidden border-8 border-[#FAF5E9] shadow-xl w-64 h-64 mx-auto z-10">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                   ))}
                </div>
              </div>
              
              <div className="text-center mt-20 pt-8 text-[#5D4037] text-sm font-serif italic border-t border-[#8D6E63]/30">
                <p>Commande 24-48h à l'avance — Paiement à la récupération</p>
                <p className="mt-1">Mouda Palace Fès — 0535 00 00 00</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
\n  `;
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync('src/MenuGenerator.tsx', content);
} else {
  console.log("Could not find start or end bounds", {startIdx, endIdx});
}
