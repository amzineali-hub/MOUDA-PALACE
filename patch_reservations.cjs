const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// We need to inject NotificationSystem in App component
const importStmt = "import NotificationSystem from './NotificationSystem';\n";
const lastImport = code.lastIndexOf("import ");
const nextLine = code.indexOf("\n", lastImport);
code = code.substring(0, nextLine + 1) + importStmt + code.substring(nextLine + 1);

// Inside App component return, add <NotificationSystem />
const appRet = "return (\n    <div";
code = code.replace(appRet, "return (\n    <div className=\"w-full\">\n      <NotificationSystem />\n    <div");
// Wait, the return is:
// return (
//   <div className="flex h-screen bg-[#FDFBF7] font-sans selection:bg-[#DDA956]/20">

code = code.replace('<div className="flex h-screen bg-[#FDFBF7]', '<NotificationSystem />\n    <div className="flex h-screen bg-[#FDFBF7]');

fs.writeFileSync('src/App.tsx', code);
