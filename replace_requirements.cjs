const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace tab in map
code = code.replace(
  /\['stocks', 'requirements', 'semi_finished', 'production', 'waste', 'transactions', 'suppliers', 'price_history'\]/g,
  "['stocks', 'production_orders', 'semi_finished', 'production', 'waste', 'transactions', 'suppliers', 'price_history']"
);

// Replace label
code = code.replace(
  /\{tab === 'requirements' && 'Besoins & Seuils'\}/g,
  "{tab === 'production_orders' && 'Ordre de fabrication'}"
);

// Replace content block for 'requirements'
const reqStart = "{activeTab === 'requirements' && (";
const nextTabStart = "{activeTab === 'semi_finished' && (";
const startIndex = code.indexOf(reqStart);
const endIndex = code.indexOf(nextTabStart);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = `{activeTab === 'production_orders' && (
            <div className="h-[800px] flex-1 overflow-y-auto bg-gray-50">
              <ProductionJournaliere />
            </div>
          )}
          `;
  code = code.slice(0, startIndex) + newContent + code.slice(endIndex);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Replaced successfully.');
} else {
  console.log('Could not find boundaries.', startIndex, endIndex);
}
