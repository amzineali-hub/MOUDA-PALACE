const fs = require('fs');
let content = fs.readFileSync('src/MenuGenerator.tsx', 'utf-8');

// Find the start of the bad block which is currently at line 41.
const searchStart = "    if (isPrintView) {";
const startIdx = content.indexOf(searchStart);

if (startIdx !== -1) {
    // Find the end of the return statement inside it.
    // It ends with:
    //         </div>
    //       </div>
    //     );
    //   }
    // So let's look for `  }`
    const endStr = "    );\n  }\n";
    let endIdx = content.indexOf(endStr, startIdx);
    
    if (endIdx !== -1) {
        const fullBlock = content.substring(startIdx, endIdx + endStr.length);
        content = content.replace(fullBlock, '');
        
        // Find the main return which is: `  return (\n    <div className="p-4 md:p-8`
        const mainReturnStr = '  return (\n    <div className="p-4 md:p-8';
        if (content.indexOf(mainReturnStr) !== -1) {
            content = content.replace(mainReturnStr, fullBlock.replace(/^    /gm, '  ').replace(/^  if/, 'if') + '\n' + mainReturnStr);
        }
    }
}
fs.writeFileSync('src/MenuGenerator.tsx', content);
