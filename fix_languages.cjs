const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetSelect = `              <option value="fr" className="bg-[#1A1A1A] text-white">Français (FR)</option>
              <option value="en" className="bg-[#1A1A1A] text-white">English (EN)</option>
              <option value="es" className="bg-[#1A1A1A] text-white">Español (ES)</option>
              <option value="ar" className="bg-[#1A1A1A] text-white">العربية (AR)</option>`;

const replaceSelect = `              <option value="fr" className="bg-[#1A1A1A] text-white">Français (FR)</option>
              <option value="en" className="bg-[#1A1A1A] text-white">English (EN)</option>
              <option value="es" className="bg-[#1A1A1A] text-white">Español (ES)</option>
              <option value="ar" className="bg-[#1A1A1A] text-white">العربية (AR)</option>
              <option value="de" className="bg-[#1A1A1A] text-white">Deutsch (DE)</option>
              <option value="zh" className="bg-[#1A1A1A] text-white">中文 (ZH)</option>
              <option value="ko" className="bg-[#1A1A1A] text-white">한국어 (KO)</option>
              <option value="pt" className="bg-[#1A1A1A] text-white">Português (PT)</option>`;

content = content.replace(targetSelect, replaceSelect);

fs.writeFileSync('src/App.tsx', content);
