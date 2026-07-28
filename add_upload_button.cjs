const fs = require('fs');
let code = fs.readFileSync('src/BlogWriterAI.tsx', 'utf8');

const uploadFunc = `
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setter(dataUrl);
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };
`;

// Insert the function before return statement
code = code.replace('  return (', uploadFunc + '\n  return (');

// Add Upload icon import
if (!code.includes('Upload,')) {
    code = code.replace('import { ', 'import { Upload, ');
}

// First replace for generator form
const genFormOld = `                  <option value="custom">Autre (URL personnalisée)</option>
                </select>
                
                {!availableImages.includes(imageUrl) && imageUrl !== '' ? (
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL de l'image (ex: https://...)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                  />
                ) : null}`;

const genFormNew = `                  <option value="custom">Autre (URL personnalisée)</option>
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

// Second replace for edit form
const editFormOld = `                    <option value="custom">Autre (URL personnalisée)</option>
                  </select>
                  
                  {!availableImages.includes(editImageUrl) && editImageUrl !== '' ? (
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="URL de l'image (ex: https://...)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                    />
                  ) : null}`;

const editFormNew = `                    <option value="custom">Autre (URL personnalisée)</option>
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

code = code.replace(genFormOld, genFormNew);
code = code.replace(editFormOld, editFormNew);

fs.writeFileSync('src/BlogWriterAI.tsx', code);
console.log("Added upload button to BlogWriterAI");
