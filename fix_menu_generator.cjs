const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

const target = `                  <div className="h-48 relative bg-gray-100">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />`;
const replacement = `                  <div className="h-48 relative bg-gray-100">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Aucune image</span>
                      </div>
                    )}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/MenuGenerator.tsx', code);
  console.log('Fixed MenuGenerator.tsx');
} else {
  console.log('Target not found in MenuGenerator.tsx');
}
