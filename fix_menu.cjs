const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

const brokenPart = `          }
  
      {/* Modal Ajout / Édition */}`;

const fixedPart = `        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* En-Tête du Menu avec Logo & Identité Mouda Palace */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333] text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#DDA956]/20 border border-[#DDA956]/40 flex items-center justify-center overflow-hidden p-2">
            <img src="/mouda-1.png" alt="Mouda Palace Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#DDA956] font-semibold">Éditeur de Carte Officiel</span>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-wide">Restaurant Mouda Palace</h1>
            <p className="text-gray-300 text-sm mt-1">Fès, Maroc — Gestion dynamique des menus, tarifs et visuels</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button onClick={() => setIsPrintView(true)} className="flex items-center w-full sm:w-auto gap-2 bg-white/10 text-white border border-white/20 px-5 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors shadow-lg">
            <Printer size={20} />
            <span>Génération du Menu</span>
          </button>
          <button onClick={() => { setEditingItem(null); setName(""); setCategory(categories[0]); setPrice(""); setDesc(""); setIsAddModalOpen(true); }} className="flex items-center w-full sm:w-auto gap-2 bg-[#DDA956] text-[#1A1A1A] px-5 py-3 rounded-xl font-medium hover:bg-[#c4954b] transition-colors shadow-lg">
            <Plus size={20} />
            <span>Ajouter un plat</span>
          </button>
        </div>
      </div>

      {categories.map(category => {
        const items = menuItems.filter(item => item.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl font-serif text-[#1A1A1A] border-b border-gray-200 pb-2 flex items-center gap-2">
              <ChefHat size={20} className="text-[#DDA956]" />
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="h-48 relative bg-gray-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Aucune image</span>
                      </div>
                    )}
                    <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-[#DDA956] font-serif font-bold px-3 py-1 rounded-full text-sm">
                      {item.price}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-serif font-semibold text-lg text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{item.desc}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Mouda Palace Fès</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-gray-50" title="Éditer">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-50" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Modal Ajout / Édition */}`;

code = code.replace(brokenPart, fixedPart);
fs.writeFileSync('src/MenuGenerator.tsx', code);
console.log("Fixed MenuGenerator");
