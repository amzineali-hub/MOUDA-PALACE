const fs = require('fs');
let content = fs.readFileSync('src/MenuGenerator.tsx', 'utf-8');

// The original file is at /tmp/MenuGenerator.tsx. Let's make sure it's the right one.
const badBlockStart = content.indexOf('    if (isPrintView) {');
if (badBlockStart !== -1) {
    const endBlock = content.indexOf('    );\\n  }', badBlockStart);
    if (endBlock !== -1) {
        const fullBlock = content.substring(badBlockStart, endBlock + 9);
        content = content.replace(fullBlock, '');
    }
}
fs.writeFileSync('src/MenuGenerator.tsx', content);
