const fs = require('fs');
let content = fs.readFileSync('src/MenuGenerator.tsx', 'utf-8');

const badCodeStart = content.indexOf('    if (isPrintView) {');
const badCodeEnd = content.indexOf('  return () => unsubscribe();');
const badBlock = content.slice(badCodeStart, badCodeEnd);

content = content.replace(badBlock, '');

// Now we need to re-insert the printView block at the correct place.
const correctPlace = content.indexOf('  return (\\n    <div className="p-4 md:p-8');
if (correctPlace === -1) {
  const correctPlace2 = content.indexOf('  return (\\n    <div className="p-4');
  content = content.replace('  return (\\n    <div className="p-4', badBlock.replace('    if', '  if') + '\\n  return (\\n    <div className="p-4');
}

fs.writeFileSync('src/MenuGenerator.tsx', content);
