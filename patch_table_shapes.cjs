const fs = require('fs');
let content = fs.readFileSync('src/GestionTables.tsx', 'utf8');

const replacement = `
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {table.shape === 'rond' && <Circle size={18} className="text-current opacity-70" />}
                  {table.shape === 'rectangle' && <RectangleHorizontal size={18} className="text-current opacity-70" />}
                  {(!table.shape || table.shape === 'carre') && <Square size={18} className="text-current opacity-70" />}
                  <span className="text-xl font-bold">{table.id}</span>
                </div>
                <button className="text-current opacity-50 hover:opacity-100 transition-opacity">
`;

content = content.replace(`
              <div className="flex justify-between items-start mb-2">
                <span className="text-xl font-bold">{table.id}</span>
                <button className="text-current opacity-50 hover:opacity-100 transition-opacity">
`, replacement);

fs.writeFileSync('src/GestionTables.tsx', content);
console.log("Done");
