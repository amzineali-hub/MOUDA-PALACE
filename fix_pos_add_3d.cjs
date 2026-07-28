const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf8');

const targetClass = 'className="relative overflow-hidden flex flex-col justify-center items-center aspect-square rounded-2xl sm:rounded-3xl p-2 sm:p-4 border-2 border-dashed border-gray-300 text-gray-400 hover:text-[#DDA956] hover:border-[#DDA956] hover:bg-[#DDA956]/5 transition-all"';
const newClass = 'className="relative overflow-hidden flex flex-col justify-center items-center aspect-square rounded-2xl sm:rounded-3xl p-2 sm:p-4 border-2 border-dashed border-gray-300 text-gray-400 hover:text-[#DDA956] hover:border-[#DDA956] hover:bg-[#DDA956]/5 bg-white shadow-[0_8px_0_#d1d5db,0_12px_20px_rgba(0,0,0,0.1)] transition-all"';

if (code.includes(targetClass)) {
  code = code.replace(targetClass, newClass);
  code = code.replace('whileTap={{ scale: 0.95 }}', 'whileTap={{ scale: 0.95, y: 4, boxShadow: "0 4px 0 #d1d5db, 0 8px 10px rgba(0,0,0,0.1)" }}');
  fs.writeFileSync('src/POSTactile.tsx', code);
  console.log("Updated add button to have 3D effect");
} else {
  console.log("Target not found");
}
