const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `        {/* Menu Items List */}
        <div className="divide-y divide-gray-100">
          {filteredItems.map(item => {
            // @ts-ignore - dynamic properties
            const currentTranslation = displayLanguage !== 'fr' && item.translations ? item.translations[displayLanguage] : null;
            const displayName = currentTranslation?.name || item.name;
            const displayDesc = currentTranslation?.desc || item.desc;
            
            return (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <UtensilsCrossed className="text-gray-400" size={24} />
                </div>
                <div className={displayLanguage === 'ar' ? 'text-right w-full' : ''} dir={displayLanguage === 'ar' ? 'rtl' : 'ltr'}>
                  <div className={\`flex items-center gap-3 mb-1 \${displayLanguage === 'ar' ? 'justify-start flex-row-reverse' : ''}\`}>
                    <h4 className="font-medium text-gray-900">{displayName}</h4>
                    {!item.active && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium flex items-center gap-1">
                        <EyeOff size={12} /> Masqué
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 max-w-2xl">{displayDesc}</p>
                  
                  <div className={\`flex items-center gap-4 mt-3 \${displayLanguage === 'ar' ? 'justify-start flex-row-reverse' : ''}\`}>
                    <span className="font-semibold text-[#1A1A1A]">{item.price}</span>
                    <div className="w-px h-4 bg-gray-200"></div>
                    {item.translated ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Globe size={12} /> Traduit (FR, EN, ES, AR)
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle size={12} /> Traduction requise
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setMenuItems(items => items.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
                    showToast(\`Visibilité de \${item.name} modifiée\`);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  title={item.active ? "Masquer" : "Afficher"}
                >
                  {item.active ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button 
                  onClick={() => openEditModal(item)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  title="Modifier"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteDish(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Aucun plat dans cette catégorie.
            </div>
          )}
        </div>`;

const replace = `        {/* Menu Items List */}
        <div className={isPreviewMode ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50" : "divide-y divide-gray-100"}>
          {filteredItems.map(item => {
            // @ts-ignore - dynamic properties
            const currentTranslation = displayLanguage !== 'fr' && item.translations ? item.translations[displayLanguage] : null;
            const displayName = currentTranslation?.name || item.name;
            const displayDesc = currentTranslation?.desc || item.desc;
            
            return isPreviewMode ? (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col">
                <div className="aspect-video bg-gray-100 relative group cursor-pointer overflow-hidden">
                  {item.category === 'Entrées' && <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop" alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
                  {item.category === 'Plats Principaux' && <img src="https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&h=300&fit=crop" alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
                  {item.category === 'Desserts' && <img src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=300&fit=crop" alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
                  {item.category === 'Boissons' && <img src="https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=300&fit=crop" alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
                  
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => showToast("Lecture vidéo de préparation en cours de développement")} className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:scale-110 transition-transform shadow-lg">
                       <MonitorPlay size={24} className="ml-1" />
                     </button>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-bold text-gray-900 shadow-sm">
                    {item.price}
                  </div>
                </div>
                <div className={\`p-5 flex-1 flex flex-col \${displayLanguage === 'ar' ? 'text-right' : ''}\`} dir={displayLanguage === 'ar' ? 'rtl' : 'ltr'}>
                  <h4 className="font-serif font-medium text-lg text-gray-900 mb-2">{displayName}</h4>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1 leading-relaxed">{displayDesc}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    {item.translated ? (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-green-600 flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md">
                        <Globe size={12} /> Traduit
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md">
                        <AlertTriangle size={12} /> À traduire
                      </span>
                    )}
                    <div className="flex gap-1.5">
                      <button onClick={() => showToast("Ajout de vidéo en développement")} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors title='Ajouter une vidéo'"><MonitorPlay size={16}/></button>
                      <button onClick={() => showToast("Ajout de photo en développement")} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors title='Changer la photo'"><ImageIcon size={16}/></button>
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <UtensilsCrossed className="text-gray-400" size={24} />
                </div>
                <div className={displayLanguage === 'ar' ? 'text-right w-full' : ''} dir={displayLanguage === 'ar' ? 'rtl' : 'ltr'}>
                  <div className={\`flex items-center gap-3 mb-1 \${displayLanguage === 'ar' ? 'justify-start flex-row-reverse' : ''}\`}>
                    <h4 className="font-medium text-gray-900">{displayName}</h4>
                    {!item.active && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium flex items-center gap-1">
                        <EyeOff size={12} /> Masqué
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 max-w-2xl">{displayDesc}</p>
                  
                  <div className={\`flex items-center gap-4 mt-3 \${displayLanguage === 'ar' ? 'justify-start flex-row-reverse' : ''}\`}>
                    <span className="font-semibold text-[#1A1A1A]">{item.price}</span>
                    <div className="w-px h-4 bg-gray-200"></div>
                    {item.translated ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Globe size={12} /> Traduit (FR, EN, ES, AR)
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle size={12} /> Traduction requise
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => showToast("Ajouter multimédia (Photo/Vidéo)")}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                  title="Ajouter multimédia"
                >
                  <ImageIcon size={18} />
                </button>
                <button 
                  onClick={() => {
                    setMenuItems(items => items.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
                    showToast(\`Visibilité de \${item.name} modifiée\`);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  title={item.active ? "Masquer" : "Afficher"}
                >
                  {item.active ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button 
                  onClick={() => openEditModal(item)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  title="Modifier"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteDish(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Aucun plat dans cette catégorie.
            </div>
          )}
        </div>`;

content = content.replace(target, replace);
fs.writeFileSync('src/App.tsx', content);

console.log("Replaced:", content.includes('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50'));

