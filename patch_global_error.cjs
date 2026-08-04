const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

const target = `createRoot(document.getElementById('root')!).render(`;
const replacement = `
window.addEventListener('error', (event) => {
  alert('Global error: ' + event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  alert('Unhandled promise rejection: ' + event.reason);
});

createRoot(document.getElementById('root')!).render(`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/main.tsx', code);
    console.log("Patched main.tsx with global error handler");
} else {
    console.log("Target not found");
}
