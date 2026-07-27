const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// The lines 4567 to 6039 in App.tsx
// To be safe, let's use string manipulation to remove the function StaffHR()
const startIndex = code.indexOf('function StaffHR() {');
if (startIndex !== -1) {
  const endIndex = code.indexOf('function Configuration() {');
  if (endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
    
    // Add import RH
    const importStatement = "import RH from './RH';\n";
    const lastImportIndex = code.lastIndexOf('import ');
    const lastImportEnd = code.indexOf('\n', lastImportIndex);
    code = code.substring(0, lastImportEnd + 1) + importStatement + code.substring(lastImportEnd + 1);
    
    // Replace <StaffHR /> with <RH />
    code = code.replace('<StaffHR />', '<RH />');
    
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced successfully");
  } else {
    console.log("Could not find Configuration()");
  }
} else {
  console.log("Could not find StaffHR()");
}
