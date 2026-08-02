const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `              <div className="w-full sm:w-64">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
                >
                  <option value="Tous">Toutes les catégories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>`;

const replacement = `              <div className="w-full sm:w-64">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
                >
                  <option value="Tous">Toutes les catégories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-64">
                <select 
                  value={expirationFilter}
                  onChange={(e) => setExpirationFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4C75B]"
                >
                  <option value="Tous">Toutes les péremptions</option>
                  <option value="En attente">En attente d'expiration (< 7j)</option>
                  <option value="Expirés">Expirés</option>
                </select>
              </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Successfully patched UI logic');
} else {
  console.error('Target not found in App.tsx');
}
