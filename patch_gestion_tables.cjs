const fs = require('fs');
let code = fs.readFileSync('src/GestionTables.tsx', 'utf8');

code = code.replace(
  /className=\{`border-2 rounded-xl p-4 flex flex-col h-40 relative transition-all hover:shadow-md \$\{getStatusColor\(table\.status\)\}`\}/g,
  'className={`border-2 rounded-xl p-3 flex flex-col min-h-24 relative transition-all hover:shadow-md ${getStatusColor(table.status)}`}'
);

code = code.replace(
  /mb-2/g,
  'mb-1'
);

code = code.replace(
  /className="text-xs font-medium uppercase tracking-wider opacity-70 mb-auto"/g,
  'className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-70"'
);

code = code.replace(
  /mt-2 pt-2/g,
  'mt-auto pt-2'
);

code = code.replace(
  /<span className="text-xl font-bold">\{table\.id\}<\/span>/g,
  '<span className="text-lg font-bold">{table.id}</span>'
);

fs.writeFileSync('src/GestionTables.tsx', code);
