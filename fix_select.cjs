const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetSelect = `<select 
              value={displayLanguage}
              onChange={(e) => setDisplayLanguage(e.target.value)}
              className="text-sm border-none bg-transparent text-white font-medium focus:ring-0 cursor-pointer"
            >
              <option value="fr">Français (FR)</option>
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
              <option value="ar">العربية (AR)</option>
            </select>`;

const replaceSelect = `<select 
              value={displayLanguage}
              onChange={(e) => setDisplayLanguage(e.target.value)}
              className="text-sm border-none bg-transparent text-white font-medium focus:ring-0 outline-none focus:outline-none cursor-pointer"
            >
              <option value="fr" className="bg-[#1A1A1A] text-white">Français (FR)</option>
              <option value="en" className="bg-[#1A1A1A] text-white">English (EN)</option>
              <option value="es" className="bg-[#1A1A1A] text-white">Español (ES)</option>
              <option value="ar" className="bg-[#1A1A1A] text-white">العربية (AR)</option>
            </select>`;

content = content.replace(targetSelect, replaceSelect);

fs.writeFileSync('src/App.tsx', content);
