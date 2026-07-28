const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state
code = code.replace(
  "const [journalOperatorFilter, setJournalOperatorFilter] = useState('');",
  "const [journalOperatorFilter, setJournalOperatorFilter] = useState('');\n  const [journalCurrentPage, setJournalCurrentPage] = useState(1);\n  const ITEMS_PER_PAGE = 20;"
);

// 2. Add computed pagination logic
const opsEndStr = `  const uniqueOperators = Array.from(new Set(fullJournalMovements.map(tx => tx.user)));`;
const paginatedLogicStr = `  const uniqueOperators = Array.from(new Set(fullJournalMovements.map(tx => tx.user)));
  const totalJournalPages = Math.ceil(filteredJournal.length / ITEMS_PER_PAGE);
  const paginatedJournal = filteredJournal.slice((journalCurrentPage - 1) * ITEMS_PER_PAGE, journalCurrentPage * ITEMS_PER_PAGE);`;
code = code.replace(opsEndStr, paginatedLogicStr);

// 3. Update onChange to reset page
code = code.replace(
  "onChange={(e) => setJournalSearch(e.target.value)}",
  "onChange={(e) => { setJournalSearch(e.target.value); setJournalCurrentPage(1); }}"
);
code = code.replace(
  "onChange={(e) => setJournalOperatorFilter(e.target.value)}",
  "onChange={(e) => { setJournalOperatorFilter(e.target.value); setJournalCurrentPage(1); }}"
);

// 4. Update the map to use paginatedJournal
code = code.replace(
  "{filteredJournal.length > 0 ? (",
  "{paginatedJournal.length > 0 ? ("
);
code = code.replace(
  "filteredJournal.map((tx, idx) => (",
  "paginatedJournal.map((tx, idx) => ("
);

// 5. Add Pagination UI
const tableEndStr = `              </table>
            </div>
          </motion.div>`;
const paginationUIStr = `              </table>
            </div>
            
            {/* Pagination UI */}
            {totalJournalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                <span className="text-sm text-gray-500">
                  Affichage de {((journalCurrentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(journalCurrentPage * ITEMS_PER_PAGE, filteredJournal.length)} sur {filteredJournal.length} transactions
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setJournalCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={journalCurrentPage === 1}
                    className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <button 
                    onClick={() => setJournalCurrentPage(prev => Math.min(prev + 1, totalJournalPages))}
                    disabled={journalCurrentPage === totalJournalPages}
                    className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </motion.div>`;
code = code.replace(tableEndStr, paginationUIStr);

fs.writeFileSync('src/App.tsx', code);
console.log("Pagination added");
