const fs = require('fs');
let code = fs.readFileSync('src/Accounting.tsx', 'utf8');

// Replace mock view report action
code = code.replace(
  "onClick={() => showToast && showToast('Action en cours de développement...')}  className=\"p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100\" title=\"Voir le rapport\"",
  "onClick={() => { setSelectedReport(report); setIsViewReportModalOpen(true); }} className=\"p-1.5 text-gray-400 hover:text-[#F4C75B] transition-colors rounded-lg hover:bg-gray-100\" title=\"Voir le rapport\""
);

fs.writeFileSync('src/Accounting.tsx', code);
