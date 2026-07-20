const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetFormHtml = `                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service (Optionnel)</label>
                  <select name="shift" defaultValue={editingStaff?.shift || '-'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="-">- Non assigné -</option>
                    <option value="Matin">Matin</option>
                    <option value="Soir">Soir</option>
                  </select>
                </div>`;

const replacementFormHtml = `                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service (Optionnel)</label>
                  <select name="shift" defaultValue={editingStaff?.shift || '-'} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]">
                    <option value="-">- Non assigné -</option>
                    <option value="Matin">Matin</option>
                    <option value="Soir">Soir</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire de Base (MAD)</label>
                  <input name="baseSalary" defaultValue={editingStaff?.baseSalary || 4000} type="number" required className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#DDA956]" placeholder="Ex: 4000" />
                </div>`;

content = content.replace(targetFormHtml, replacementFormHtml);

fs.writeFileSync('src/App.tsx', content);
