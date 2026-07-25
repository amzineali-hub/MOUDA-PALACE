const fs = require('fs');
let content = fs.readFileSync('src/MenuGenerator.tsx', 'utf-8');

const badBlockStart = content.indexOf('  if (isPrintView) {');
const endOfBadBlock = content.indexOf('  return (', badBlockStart + 1);

const blockCode = content.slice(badBlockStart, endOfBadBlock);

// Remove it from current position
content = content.replace(blockCode, '  return () => unsubscribe();\n  }, []);\n\n');

// The original "return (" that we wanted to replace is actually at the end of the component.
// Oh wait, the bad replace also REMOVED `return () => unsubscribe(); \n }, []); \n\n const handleSaveItem = async...` ? No, wait.

