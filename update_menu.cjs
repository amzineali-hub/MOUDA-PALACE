const fs = require('fs');
let content = fs.readFileSync('src/MenuGenerator.tsx', 'utf-8');

const oldImports = `import { Utensils, Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Sparkles } from 'lucide-react';`;
const newImports = `import { Utensils, Plus, Trash2, Edit2, Save, X, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';`;
content = content.replace(oldImports, newImports);

const newFunction = `  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };`;

content = content.replace("  const handleDelete = async (id: string) => {", newFunction + "\n\n  const handleDelete = async (id: string) => {");

const oldVisualSection = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visuel (Image)</label>
                <select
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white mb-2"
                >
                  <option value="">Sélectionner une image du serveur</option>
                  {availableImages.map(img => (
                    <option key={img} value={img}>{img.split('/').pop()}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Ou entrez une URL d'image directe (https://...)" 
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#DDA956]" 
                />
              </div>`;

const newVisualSection = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visuel (Image)</label>
                <div className="space-y-2">
                  <select
                    value={availableImages.includes(imageUrl) ? imageUrl : ""}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#DDA956] bg-white"
                  >
                    <option value="">Sélectionner une image par défaut</option>
                    {availableImages.map(img => (
                      <option key={img} value={img}>{img.split('/').pop()}</option>
                    ))}
                  </select>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl p-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:border-[#DDA956] transition-colors">
                        <Upload size={16} />
                        <span>Télécharger une image</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 font-medium">OU</span>
                    <input 
                      type="text" 
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="URL directe de l'image" 
                      className="flex-1 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#DDA956]" 
                    />
                  </div>
                  {imageUrl && imageUrl.startsWith('data:image') && (
                    <div className="text-xs text-green-600 font-medium mt-1">Image chargée avec succès.</div>
                  )}
                </div>
              </div>`;

content = content.replace(oldVisualSection, newVisualSection);
fs.writeFileSync('src/MenuGenerator.tsx', content);
