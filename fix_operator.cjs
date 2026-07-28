const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state
code = code.replace(
  "const [journalSearch, setJournalSearch] = useState('');",
  "const [journalSearch, setJournalSearch] = useState('');\n  const [journalOperatorFilter, setJournalOperatorFilter] = useState('');"
);

// 2. Modify filteredJournal
const oldFilteredJournal = `  const filteredJournal = fullJournalMovements.filter(tx => 
    tx.id.toLowerCase().includes(journalSearch.toLowerCase()) || 
    tx.user.toLowerCase().includes(journalSearch.toLowerCase()) ||
    tx.type.toLowerCase().includes(journalSearch.toLowerCase())
  );`;

const newFilteredJournal = `  const filteredJournal = fullJournalMovements.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(journalSearch.toLowerCase()) || 
                          tx.user.toLowerCase().includes(journalSearch.toLowerCase()) ||
                          tx.type.toLowerCase().includes(journalSearch.toLowerCase());
    const matchesOperator = journalOperatorFilter === '' || tx.user === journalOperatorFilter;
    return matchesSearch && matchesOperator;
  });

  const uniqueOperators = Array.from(new Set(fullJournalMovements.map(tx => tx.user)));`;

code = code.replace(oldFilteredJournal, newFilteredJournal);

// 3. Add Dropdown to UI
const oldUI = `<div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Rechercher par ID, Opérateur ou Type..." 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
              <button onClick={handleExportCSV}`;

const newUI = `<div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Rechercher par ID, Opérateur ou Type..." 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956]"
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
              <div className="w-full md:w-64">
                <select 
                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] bg-white text-gray-700"
                  value={journalOperatorFilter}
                  onChange={(e) => setJournalOperatorFilter(e.target.value)}
                >
                  <option value="">Tous les opérateurs</option>
                  {uniqueOperators.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleExportCSV}`;

code = code.replace(oldUI, newUI);

fs.writeFileSync('src/App.tsx', code);
console.log("Added operator filter");
