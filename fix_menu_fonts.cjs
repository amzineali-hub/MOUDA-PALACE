const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

// Title 1
const t1 = `className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-[0.2em]"`;
const r1 = `className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-[0.15em] sm:tracking-[0.2em] px-2 text-center"`;
code = code.replace(t1, r1);

// Title 2 (category title in modern)
const t2 = `className="text-3xl font-serif text-[#DDA956] text-center mb-10 uppercase tracking-widest flex items-center justify-center gap-6"`;
const r2 = `className="text-2xl sm:text-3xl font-serif text-[#DDA956] text-center mb-10 uppercase tracking-widest flex items-center justify-center gap-4 sm:gap-6"`;
code = code.replace(t2, r2);

// Title 3 (category title in traditional)
// Wait, traditional uses an image for the category text, wait let's check
const t3 = `className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#7a1c15] text-center mb-12 uppercase tracking-[0.1em] md:tracking-[0.2em] relative z-10 drop-shadow-md"`;
const r3 = `className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#7a1c15] text-center mb-8 md:mb-12 uppercase tracking-[0.1em] md:tracking-[0.2em] relative z-10 drop-shadow-md"`;
code = code.replace(t3, r3);

fs.writeFileSync('src/MenuGenerator.tsx', code);
console.log("Updated font sizes in MenuGenerator");
