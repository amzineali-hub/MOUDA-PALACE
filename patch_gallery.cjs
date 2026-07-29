const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

code = code.replace(
  "const [isManualName, setIsManualName] = useState(false);",
  "const [isManualName, setIsManualName] = useState(false);\n  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);"
);

// Find unique images
const galleryUI = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo de l'article</label>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="w-full border border-gray-200 rounded-xl p-2 focus:outline-none focus:border-[#DDA956] bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsPhotoGalleryOpen(!isPhotoGalleryOpen)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    Photos du menu
                  </button>
                </div>
                
                {isPhotoGalleryOpen && (
                  <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 h-40 overflow-y-auto">
                    {Array.from(new Set(menuItems.filter(i => i.imageUrl).map(i => i.imageUrl))).map((url: any, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewItemImage(url);
                          setIsPhotoGalleryOpen(false);
                        }}
                        className={\`relative aspect-square rounded-lg overflow-hidden border-2 \${newItemImage === url ? 'border-[#DDA956]' : 'border-transparent hover:border-gray-300'}\`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {menuItems.filter(i => i.imageUrl).length === 0 && (
                      <div className="col-span-4 text-center text-sm text-gray-500 py-4">Aucune photo disponible dans le menu</div>
                    )}
                  </div>
                )}

                {newItemImage && !isPhotoGalleryOpen && (
                  <div className="mt-2 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setNewItemImage('')} className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1 shadow text-gray-700">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>`;

code = code.replace(
  /<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Photo \(Appareil ou Galerie\)<\/label>[\s\S]*?<\/div>/,
  galleryUI
);

code = code.replace(
  "setIsManualName(false);",
  "setIsManualName(false);\n      setIsPhotoGalleryOpen(false);"
);

fs.writeFileSync('src/POSTactile.tsx', code);
