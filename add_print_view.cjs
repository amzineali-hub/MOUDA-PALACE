const fs = require('fs');
let content = fs.readFileSync('src/MenuGenerator.tsx', 'utf-8');

const oldImports = `import { Utensils, Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';`;
const newImports = `import { Utensils, Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Sparkles, Upload, Printer } from 'lucide-react';`;
content = content.replace(oldImports, newImports);

const oldState = `  const [editingItem, setEditingItem] = useState<any | null>(null);`;
const newState = `  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isPrintView, setIsPrintView] = useState(false);`;
content = content.replace(oldState, newState);

const oldButtons = `        <button
          onClick={() => {
            setEditingItem(null);
            setName('');
            setPrice('');
            setDesc('');
            setImageUrl('');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-5 py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors shadow-lg"
        >
          <Plus size={20} />
          <span>Ajouter un plat</span>
        </button>`;

const newButtons = `        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setIsPrintView(true)}
            className="flex items-center w-full sm:w-auto gap-2 bg-white/10 text-white border border-white/20 px-5 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors shadow-lg"
          >
            <Printer size={20} />
            <span>Aperçu Impression</span>
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setName('');
              setPrice('');
              setDesc('');
              setImageUrl('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center w-full sm:w-auto gap-2 bg-[#DDA956] text-[#1A1A1A] px-5 py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors shadow-lg"
          >
            <Plus size={20} />
            <span>Ajouter un plat</span>
          </button>
        </div>`;
content = content.replace(oldButtons, newButtons);

const printViewCode = `  if (isPrintView) {
    return (
      <div className="bg-white min-h-screen p-8 print:p-0">
        <div className="max-w-4xl mx-auto print:max-w-full">
          <div className="flex justify-between items-center mb-8 print:hidden">
            <button onClick={() => setIsPrintView(false)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
              <X size={20} /> Retour
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#DDA956] text-[#1A1A1A] px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-[#c4954b] transition-colors">
              <Printer size={18} /> Imprimer le menu
            </button>
          </div>

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

          <div className="mt-24 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm font-serif italic">
            <p>Tous nos prix sont en dirhams (MAD) et incluent les taxes.</p>
            <p className="mt-2">Mouda Palace Fès — 0535 00 00 00 — contact@moudapalace.com</p>
          </div>
        </div>
      </div>
    );
  }

  return (`;

content = content.replace("  return (", printViewCode);
fs.writeFileSync('src/MenuGenerator.tsx', content);
