const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add states
const stateTarget = `  const [isTranslating, setIsTranslating] = useState(false);
  const [displayLanguage, setDisplayLanguage] = useState('fr');
  const [isPreviewMode, setIsPreviewMode] = useState(false);`;

const stateReplace = `  const [isTranslating, setIsTranslating] = useState(false);
  const [displayLanguage, setDisplayLanguage] = useState('fr');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaEditingItem, setMediaEditingItem] = useState<any>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  
  const openMediaModal = (item: any, type: 'image' | 'video') => {
    setMediaEditingItem(item);
    setMediaType(type);
    setIsMediaModalOpen(true);
  };
  
  const playVideo = (videoUrl?: string) => {
    if (videoUrl) {
      setCurrentVideo(videoUrl);
      setIsVideoPlayerOpen(true);
    } else {
      showToast("Aucune vidéo disponible pour ce plat");
    }
  };`;

content = content.replace(stateTarget, stateReplace);

// Update map
const listTarget = `        <div className={isPreviewMode ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50" : "divide-y divide-gray-100"}>
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
            ) : (`;

const listReplace = `        {/* Menu Items List */}
        <div className={isPreviewMode ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50" : "divide-y divide-gray-100"}>
          {filteredItems.map(item => {
            // @ts-ignore - dynamic properties
            const currentTranslation = displayLanguage !== 'fr' && item.translations ? item.translations[displayLanguage] : null;
            const displayName = currentTranslation?.name || item.name;
            const displayDesc = currentTranslation?.desc || item.desc;
            
            const defaultImages: Record<string, string> = {
              'Entrées': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop',
              'Plats Principaux': 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&h=300&fit=crop',
              'Desserts': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=300&fit=crop',
              'Boissons': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=300&fit=crop'
            };
            const imageSrc = item.image || defaultImages[item.category];
            
            return isPreviewMode ? (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col">
                <div className="aspect-video bg-gray-100 relative group overflow-hidden">
                  <img src={imageSrc} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => playVideo(item.video)} className="p-4 bg-white/95 backdrop-blur-sm rounded-full text-indigo-600 hover:scale-110 transition-transform shadow-lg">
                       <MonitorPlay size={28} className="ml-1" />
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
                      <button onClick={() => openMediaModal(item, 'video')} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors title='Ajouter une vidéo'"><MonitorPlay size={16}/></button>
                      <button onClick={() => openMediaModal(item, 'image')} className="p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors title='Changer la photo'"><ImageIcon size={16}/></button>
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (`;

content = content.replace(listTarget, listReplace);

// Update list mode media button
const listModeBtnTarget = `                <button 
                  onClick={() => showToast("Ajouter multimédia (Photo/Vidéo)")}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                  title="Ajouter multimédia"
                >
                  <ImageIcon size={18} />
                </button>`;

const listModeBtnReplace = `                <button 
                  onClick={() => openMediaModal(item, 'image')}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                  title="Ajouter une photo"
                >
                  <ImageIcon size={18} />
                </button>
                <button 
                  onClick={() => openMediaModal(item, 'video')}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                  title="Ajouter une vidéo"
                >
                  <MonitorPlay size={18} />
                </button>`;

content = content.replace(listModeBtnTarget, listModeBtnReplace);


// Add the Modals before QR Code Modal
const qrModalTarget = `      {/* QR Code Modal */}`;

const modalsContent = `      {/* Media Modal */}
      {isMediaModalOpen && mediaEditingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-medium text-gray-900 flex items-center gap-2">
                {mediaType === 'image' ? <ImageIcon size={20} className="text-indigo-600"/> : <MonitorPlay size={20} className="text-indigo-600"/>}
                Ajouter {mediaType === 'image' ? 'une photo' : 'une vidéo'}
              </h3>
              <button onClick={() => setIsMediaModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const url = formData.get('mediaUrl') as string;
              
              setMenuItems(items => items.map(item => item.id === mediaEditingItem.id ? {
                ...item,
                [mediaType]: url
              } : item));
              
              showToast(\`\${mediaType === 'image' ? 'Photo' : 'Vidéo'} ajoutée avec succès\`);
              setIsMediaModalOpen(false);
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de la {mediaType === 'image' ? 'photo' : 'vidéo'}
                  </label>
                  <input 
                    type="url" 
                    name="mediaUrl" 
                    required 
                    defaultValue={mediaEditingItem[mediaType] || ''}
                    placeholder={\`https://example.com/\${mediaType === 'image' ? 'photo.jpg' : 'video.mp4'}\`}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500" 
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {mediaType === 'image' 
                      ? "Pour une meilleure qualité, utilisez une image au format paysage (16:9)."
                      : "Lien vers une vidéo (MP4, WebM ou YouTube)."}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsMediaModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Video Player Modal */}
      {isVideoPlayerOpen && currentVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={() => setIsVideoPlayerOpen(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsVideoPlayerOpen(false)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors">
              <X size={20} />
            </button>
            <iframe 
              src={currentVideo.includes('youtube.com/watch?v=') ? currentVideo.replace('watch?v=', 'embed/') : currentVideo} 
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* QR Code Modal */}`;

content = content.replace(qrModalTarget, modalsContent);

fs.writeFileSync('src/App.tsx', content);

