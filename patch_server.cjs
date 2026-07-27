const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });',
  `let aiClient = null;
function getAI() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found!");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }
  return aiClient;
}`
);

code = code.replace(/ai\.models\.generateContent/g, 'getAI().models.generateContent');

fs.writeFileSync('server.ts', code);
