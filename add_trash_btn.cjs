const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const original = `                        <div className="relative z-10 flex flex-col h-full justify-between">`;
const replacement = `                        {isEditMode && (
                          <div 
                            onClick={(e) => handleDeleteItem(e, item.id)}
                            className="absolute top-2 right-2 z-20 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </div>
                        )}
                        <div className="relative z-10 flex flex-col h-full justify-between">`;

code = code.replace(original, replacement);

fs.writeFileSync('src/POSTactile.tsx', code);
