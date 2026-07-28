const fs = require('fs');
let code = fs.readFileSync('src/BlogWriterAI.tsx', 'utf8');

// For generator form
const genSelectOld = `<div className="space-y-3">
                <select`;
const genSelectNew = `<div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"`;
// Wait, we need to match it accurately.
