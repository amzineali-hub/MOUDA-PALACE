const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  return (
    <div className={\`min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative \${isFullScreenView ? "overflow-hidden" : ""}\`}>`;

const replacement = `  return (
    <div className={\`min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative \${isFullScreenView ? "overflow-hidden" : ""}\`}>
      <NotificationSystem />`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Injected");
