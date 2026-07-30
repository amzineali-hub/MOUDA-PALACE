const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  const handleExportPDF = \(\) => \{[\s\S]*?    \}[\s\S]*?  \};[\s\S]*?  return \([\s\S]*?    <div className="p-8 md:p-12 relative z-10">/;

code = code.replace(regex, `  return (
    <div className="p-8 md:p-12 relative z-10">`);

fs.writeFileSync('src/App.tsx', code);
