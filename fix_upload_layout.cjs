const fs = require('fs');
let code = fs.readFileSync('src/BlogWriterAI.tsx', 'utf8');

// For Generator Form
const genOld = `<div className="space-y-3">
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
                </div>`;

const genNew = `<div className="space-y-3">
                  <select
                    value={availableImages.includes(imageUrl) ? imageUrl : (imageUrl !== '' && !imageUrl.startsWith('data:') ? 'custom' : (imageUrl.startsWith('data:') ? 'upload' : ''))}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setImageUrl('https://');
                      } else if (e.target.value !== 'upload') {
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
                    {imageUrl.startsWith('data:') && <option value="upload">Image téléchargée</option>}
                  </select>
                  
                  <label className="cursor-pointer w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium shadow-sm">
                      <Upload size={20} />
                      Télécharger une image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setImageUrl)} />
                  </label>`;

// For Edit Form
const editOld = `<div className="space-y-3">
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
                  </div>`;

const editNew = `<div className="space-y-3">
                  <select
                    value={availableImages.includes(editImageUrl) ? editImageUrl : (editImageUrl !== '' && !editImageUrl.startsWith('data:') ? 'custom' : (editImageUrl.startsWith('data:') ? 'upload' : ''))}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setEditImageUrl('https://');
                      } else if (e.target.value !== 'upload') {
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
                    {editImageUrl.startsWith('data:') && <option value="upload">Image téléchargée</option>}
                  </select>
                  
                  <label className="cursor-pointer w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium shadow-sm">
                      <Upload size={20} />
                      Télécharger une image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setEditImageUrl)} />
                  </label>`;

code = code.replace(genOld, genNew);
code = code.replace(editOld, editNew);

fs.writeFileSync('src/BlogWriterAI.tsx', code);
console.log("Updated layout to make upload button fully visible");
