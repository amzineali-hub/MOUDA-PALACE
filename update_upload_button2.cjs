const fs = require('fs');
let code = fs.readFileSync('src/BlogWriterAI.tsx', 'utf8');

const genOld = `<div className="space-y-3">
                <select
                  value={availableImages.includes(imageUrl) ? imageUrl : (imageUrl !== '' ? 'custom' : '')}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setImageUrl('https://');
                    } else {
                      setImageUrl(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                >
                  <option value="">Image aléatoire</option>
                  {availableImages.map(img => (
                    <option key={img} value={img}>{img.split('/').pop()}</option>
                  ))}
                  <option value="custom">Autre (URL personnalisée)</option>
                </select>
                
                {!availableImages.includes(imageUrl) && imageUrl !== '' ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="URL de l'image (ex: https://...) ou Télécharger ci-dessous"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                    />
                    <label className="cursor-pointer bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <Upload size={18} />
                        Télécharger une image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            handleImageUpload(e, setImageUrl);
                            // Set dropdown to custom just in case it wasn't
                        }} />
                    </label>
                  </div>
                ) : null}`;

const genNew = `<div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={availableImages.includes(imageUrl) ? imageUrl : (imageUrl !== '' && !imageUrl.startsWith('data:') ? 'custom' : (imageUrl.startsWith('data:') ? 'upload' : ''))}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setImageUrl('https://');
                      } else if (e.target.value !== 'upload') {
                        setImageUrl(e.target.value);
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Image aléatoire</option>
                    {availableImages.map(img => (
                      <option key={img} value={img}>{img.split('/').pop()}</option>
                    ))}
                    <option value="custom">Autre (URL personnalisée)</option>
                    {imageUrl.startsWith('data:') && <option value="upload">Image téléchargée</option>}
                  </select>
                  <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0" title="Télécharger une image depuis votre appareil">
                      <Upload size={20} />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setImageUrl)} />
                  </label>
                </div>
                
                {!availableImages.includes(imageUrl) && imageUrl !== '' && !imageUrl.startsWith('data:') ? (
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL de l'image (ex: https://...)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                  />
                ) : null}`;

const editOld = `<div className="space-y-3">
                  <select
                    value={availableImages.includes(editImageUrl) ? editImageUrl : (editImageUrl !== '' ? 'custom' : '')}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setEditImageUrl('https://');
                      } else {
                        setEditImageUrl(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Image aléatoire</option>
                    {availableImages.map(img => (
                      <option key={img} value={img}>{img.split('/').pop()}</option>
                    ))}
                    <option value="custom">Autre (URL personnalisée)</option>
                  </select>
                  
                  {!availableImages.includes(editImageUrl) && editImageUrl !== '' ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="URL de l'image (ex: https://...) ou Télécharger ci-dessous"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                      />
                      <label className="cursor-pointer bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors">
                          <Upload size={18} />
                          Télécharger une image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              handleImageUpload(e, setEditImageUrl);
                          }} />
                      </label>
                    </div>
                  ) : null}`;

const editNew = `<div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={availableImages.includes(editImageUrl) ? editImageUrl : (editImageUrl !== '' && !editImageUrl.startsWith('data:') ? 'custom' : (editImageUrl.startsWith('data:') ? 'upload' : ''))}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setEditImageUrl('https://');
                        } else if (e.target.value !== 'upload') {
                          setEditImageUrl(e.target.value);
                        }
                      }}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Image aléatoire</option>
                      {availableImages.map(img => (
                        <option key={img} value={img}>{img.split('/').pop()}</option>
                      ))}
                      <option value="custom">Autre (URL personnalisée)</option>
                      {editImageUrl.startsWith('data:') && <option value="upload">Image téléchargée</option>}
                    </select>
                    <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0" title="Télécharger une image depuis votre appareil">
                        <Upload size={20} />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setEditImageUrl)} />
                    </label>
                  </div>
                  
                  {!availableImages.includes(editImageUrl) && editImageUrl !== '' && !editImageUrl.startsWith('data:') ? (
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="URL de l'image (ex: https://...)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                    />
                  ) : null}`;

code = code.replace(genOld, genNew);
code = code.replace(editOld, editNew);

fs.writeFileSync('src/BlogWriterAI.tsx', code);
console.log("Updated BlogWriterAI upload button layout");
