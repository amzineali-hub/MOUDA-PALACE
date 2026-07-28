const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const targetShadow = 'shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-3px_0_rgba(0,0,0,0.1)]';
const newShadow = 'shadow-[0_8px_0_rgba(0,0,0,0.25),0_12px_20px_rgba(0,0,0,0.3),inset_0_3px_0_rgba(255,255,255,0.4),inset_0_-3px_0_rgba(0,0,0,0.2)] border border-white/20';

if (code.includes(targetShadow)) {
  code = code.replace(targetShadow, newShadow);
  code = code.replace('whileTap={{ scale: 0.95, y: 0, boxShadow: "none" }}', 'whileTap={{ scale: 0.95, y: 4, boxShadow: "0 4px 0 rgba(0,0,0,0.25), 0 8px 10px rgba(0,0,0,0.3), inset 0 3px 0 rgba(255,255,255,0.4), inset 0 -3px 0 rgba(0,0,0,0.2)" }}');
  fs.writeFileSync('src/POSTactile.tsx', code);
  console.log("Updated POS buttons to have 3D effect");
} else {
  console.log("Target not found");
}
