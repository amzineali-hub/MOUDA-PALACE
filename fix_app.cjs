const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Undo the bad replacement in ReviewAnalyzer
const badReplacement = `  return (
    <div className="w-full">
      <NotificationSystem />
    <div className="mt-8 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">`;
const goodReplacement = `  return (
    <div className="mt-8 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">`;

code = code.replace(badReplacement, goodReplacement);

// Now apply NotificationSystem to the ACTUAL App component
// The App component return is around line 550
// Let's find "export default function App() {" and the NEXT "return ("
const appStart = code.indexOf('export default function App() {');
if (appStart !== -1) {
  const returnIdx = code.indexOf('  return (', appStart);
  if (returnIdx !== -1) {
    const nextLineIdx = code.indexOf('\\n', returnIdx);
    const followingLines = code.substring(returnIdx, returnIdx + 200);
    console.log("App return block:", followingLines);
    
    // We will just replace it cleanly
    const target = `  return (
    <div className={\`min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative \${isFullScreenView ? "overflow-hidden" : ""}\`}>`;
    
    const replacement = `  return (
    <>
      <NotificationSystem />
      <div className={\`min-h-screen bg-[#FDFBF7] text-gray-900 font-sans flex flex-col md:flex-row relative \${isFullScreenView ? "overflow-hidden" : ""}\`}>`;
    
    if (code.includes(target)) {
      code = code.replace(target, replacement);
      
      // We also need to close the fragment at the VERY END of the App component.
      // But App component is huge, it ends around line 1500.
      // Wait, we can just replace the LAST </div>\n  );\n} of App component?
      // Actually, if we use fragment `<>` we must close it with `</>`.
      // Let's find the end of App component.
      const endOfApp = `  );
}

function ReviewAnalyzer() {`;
      
      // Wait, let's just search for the end of App component by looking for the next function declaration.
      // After App(), what is the next function?
      // It's `function InventoryAlerts()` or `function Reservations()` etc.
      // Let's just find `  );\n}` before `function `
    } else {
      console.log("Target not found");
    }
  }
}

fs.writeFileSync('src/App.tsx', code);
